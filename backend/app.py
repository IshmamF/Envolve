import modal
from pathlib import Path
from dataclasses import dataclass

image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        ["libgl1-mesa-glx", "libglib2.0-0"]
    )
    .pip_install(  
        ["ultralytics", "roboflow", "opencv-python"]
    )
    .pip_install(  
        "term-image"
    )
)

volume = modal.Volume.from_name("yolo-finetune", create_if_missing=True)
volume_path = ( 
    Path("/root") / "data"
)

app = modal.App("yolo-finetune", image=image, volumes={volume_path: volume})

@dataclass
class DatasetConfig:

    workspace_id: str
    project_id: str
    version: int
    format: str
    target_class: str

    @property
    def id(self) -> str:
        return f"{self.workspace_id}/{self.project_id}/{self.version}"


@app.function(
    secrets=[
        modal.Secret.from_name(
            "roboflow-api-key", required_keys=["FLOOD_API_KEY", "LIGHT_API_KEY", "LITTER_API_KEY", "POTHOLE_API_KEY"]
        )
    ]
)
def download_dataset(config: DatasetConfig):
    import os

    from roboflow import Roboflow

    rf = Roboflow(api_key=os.getenv("ROBOFLOW_API_KEY"))
    project = (
        rf.workspace(config.workspace_id)
        .project(config.project_id)
        .version(config.version)
    )
    dataset_dir = volume_path / "dataset" / config.id
    project.download(config.format, location=str(dataset_dir))


MINUTES = 60

TRAIN_GPU_COUNT = 1
TRAIN_GPU = f"A100:{TRAIN_GPU_COUNT}"
TRAIN_CPU_COUNT = 4


@app.function(
    gpu=TRAIN_GPU,
    cpu=TRAIN_CPU_COUNT,
    timeout=60 * MINUTES,
)
def train(
    model_id: str,
    dataset: DatasetConfig,
    model_size="yolov10m.pt",
    quick_check=False,
):
    from ultralytics import YOLO

    volume.reload()  

    model_path = volume_path / "runs" / model_id
    model_path.mkdir(parents=True, exist_ok=True)

    data_path = volume_path / "dataset" / dataset.id / "data.yaml"

    model = YOLO(model_size)
    model.train(
        # dataset config
        data=data_path,
        fraction=0.4
        if not quick_check
        else 0.04,  # fraction of dataset to use for training/validation
        # optimization config
        device=list(range(TRAIN_GPU_COUNT)),  # use the GPU(s)
        epochs=8
        if not quick_check
        else 1,  # pass over entire dataset this many times
        batch=0.95,  # automatic batch size to target fraction of GPU util
        seed=117,  # set seed for reproducibility
        # data processing config
        workers=max(
            TRAIN_CPU_COUNT // TRAIN_GPU_COUNT, 1
        ),  # split CPUs evenly across GPUs
        cache=False,  # cache preprocessed images in RAM?
        # model saving config
        project=f"{volume_path}/runs",
        name=model_id,
        exist_ok=True,  # overwrite previous model if it exists
        verbose=True,  # detailed logs
    )

@app.function()
def read_image(image_path: str):
    import cv2

    source = cv2.imread(image_path)
    return source

@app.cls(gpu="a10g")
class Inference:
    def __init__(self, weights_path):
        self.weights_path = weights_path

    @modal.enter()
    def load_model(self):
        from ultralytics import YOLO

        self.model = YOLO(self.weights_path)

    @modal.method()
    def predict(self, model_id: str, image_path: str, display: bool = False):
        """A simple method for running inference on one image at a time."""
        results = self.model.predict(
            image_path,
            half=True,  # use fp16
            save=True,
            exist_ok=True,
            project=f"{volume_path}/predictions/{model_id}",
        )
        if display:
            from term_image.image import from_file

            terminal_image = from_file(results[0].path)
            terminal_image.draw()
        # you can view the output file via the Volumes UI in the Modal dashboard -- https://modal.com/storage

    @modal.method()
    def streaming_count(self, batch_dir: str, threshold: float | None = None):
        """Counts the number of objects in a directory of images.

        Intended as a demonstration of high-throughput streaming inference."""
        import os
        import time

        image_files = [
            os.path.join(batch_dir, f) for f in os.listdir(batch_dir)
        ]

        completed, start = 0, time.monotonic_ns()
        for image in read_image.map(image_files):
            # note that we run predict on a single input at a time.
            # each individual inference is usually done before the next image arrives, so there's no throughput benefit to batching.
            results = self.model.predict(
                image,
                half=True,  # use fp16
                save=False,  # don't save to disk, as it slows down the pipeline significantly
                verbose=False,
            )
            completed += 1
            for res in results:
                for conf in res.boxes.conf:
                    if threshold is None:
                        yield 1
                        continue
                    if conf.item() >= threshold:
                        yield 1
            yield 0

        elapsed_seconds = (time.monotonic_ns() - start) / 1e9
        print(
            "Inferences per second:",
            round(completed / elapsed_seconds, 2),
        )

