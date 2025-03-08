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
