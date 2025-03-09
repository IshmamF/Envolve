import modal
from pathlib import Path
from dataclasses import dataclass
import os

os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        ["libgl1-mesa-glx", "libglib2.0-0"]
    )
    .pip_install(
        ["ultralytics", "roboflow", "opencv-python~=4.10.0"]
    )
    .pip_install(
        "term-image==0.7.1"
    )
)

volume = modal.Volume.from_name("yolo-finetune", create_if_missing=True)
volume_path = Path("/root") / "data"

app = modal.App("yolo-finetune", image=image, volumes={volume_path: volume})

@dataclass
class DatasetConfig:
    workspace_id: str
    project_id: str
    version: int
    format: str
    target_class: str
    api_key: str

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

    rf = Roboflow(api_key=os.getenv(config.api_key))
    project = (
        rf.workspace(config.workspace_id)
        .project(config.project_id)
        .version(config.version)
    )

    dataset_dir = volume_path / "dataset_parts" / config.target_class
    project.download(config.format, location=str(dataset_dir))
    
    print(f"Downloaded {config.target_class} dataset to {dataset_dir}")
    return config.target_class

@app.function(timeout=3600) 
def create_unified_dataset(categories):
    import os
    import shutil
    import yaml
    from pathlib import Path
    
    print(f"Starting unified dataset creation with categories: {categories}")
    
    unified_dir = volume_path / "unified_dataset"
    unified_images_dir = unified_dir / "images"
    unified_labels_dir = unified_dir / "labels"
    unified_yaml_path = unified_dir / "data.yaml"
    
    if unified_dir.exists() and unified_yaml_path.exists():
        print(f"Unified dataset already exists at {unified_dir}. Skipping recreation.")
        return str(unified_yaml_path)
    
    for split in ["train", "valid", "test"]:
        (unified_images_dir / split).mkdir(parents=True, exist_ok=True)
        (unified_labels_dir / split).mkdir(parents=True, exist_ok=True)
    
    class_names = []
    
    for category in categories:
        class_names.append(category)
        category_idx = class_names.index(category)
        
        source_dir = volume_path / "dataset_parts" / category
        print(f"\nProcessing category: {category} from {source_dir}")
        
        yaml_path = source_dir / "data.yaml"
        if not yaml_path.exists():
            print(f"WARNING: data.yaml not found for {category} at {yaml_path}")
            continue
            
        with open(yaml_path, "r") as f:
            dataset_config = yaml.safe_load(f)
            print(f"Original dataset config: {dataset_config}")
        
        for split in ["train", "valid", "test"]:
            src_img_dir = source_dir / split / "images"
            if not src_img_dir.exists():
                print(f"Warning: {src_img_dir} doesn't exist, skipping")
                continue
                
            src_label_dir = source_dir / split / "labels"
            if not src_label_dir.exists():
                print(f"WARNING: Label directory {src_label_dir} doesn't exist!")
                continue
                
            print(f"  Processing {split} split for {category}")
            
            img_copied = 0
            label_copied = 0
            

            img_files = list(os.listdir(src_img_dir))
            

            batch_size = 500
            for i in range(0, len(img_files), batch_size):
                batch_files = img_files[i:i+batch_size]
                
                for img_file in batch_files:
                    if not img_file.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp')):
                        continue
                        

                    new_name = f"{category}_{img_file}"
                    

                    src_img_path = src_img_dir / img_file
                    dst_img_path = unified_images_dir / split / new_name
                    shutil.copy(src_img_path, dst_img_path)
                    img_copied += 1
                    

                    label_file = img_file.replace(".jpg", ".txt").replace(".jpeg", ".txt").replace(".png", ".txt").replace(".bmp", ".txt")
                    src_label_path = src_label_dir / label_file
                    
                    if src_label_path.exists():

                        with open(src_label_path, "r") as f:
                            lines = f.readlines()
                        

                        if not lines:
                            print(f"  Warning: Empty label file - {src_label_path}")
                            # skip empty label files
                            continue
                        

                        modified_lines = []
                        for line in lines:
                            parts = line.strip().split()
                            if parts:

                                parts[0] = str(category_idx)
                                modified_lines.append(" ".join(parts) + "\n")
                        

                        new_label_name = new_name.replace(".jpg", ".txt").replace(".jpeg", ".txt").replace(".png", ".txt").replace(".bmp", ".txt")
                        dst_label_path = unified_labels_dir / split / new_label_name
                        with open(dst_label_path, "w") as f:
                            f.writelines(modified_lines)
                        label_copied += 1
                    else:
                        print(f"  Warning: Missing label for {img_file} - expected at {src_label_path}")
                
                del batch_files
            
            print(f"  Copied {img_copied} images and {label_copied} labels for {category} {split} split")
    
    unified_yaml = {
        "path": str(unified_dir),
        "train": str(unified_images_dir / "train"),
        "val": str(unified_images_dir / "valid"),
        "test": str(unified_images_dir / "test"),
        "names": {i: name for i, name in enumerate(class_names)},
        "nc": len(class_names)
    }
    
    yaml_path = unified_dir / "data.yaml"
    with open(yaml_path, "w") as f:
        yaml.dump(unified_yaml, f, sort_keys=False)
    
    for split in ["train", "valid", "test"]:
        img_count = len(list((unified_images_dir / split).glob('*.*')))
        label_count = len(list((unified_labels_dir / split).glob('*.txt')))
        print(f"FINAL {split}: {img_count} images, {label_count} labels")
    
    print(f"Created unified dataset with {len(class_names)} classes: {', '.join(class_names)}")
    print(f"YAML file created at: {yaml_path}")
    
    return str(yaml_path)

MINUTES = 60

TRAIN_GPU_COUNT = 1
TRAIN_GPU = f"A100:{TRAIN_GPU_COUNT}"
TRAIN_CPU_COUNT = 4

@app.function(
    gpu=TRAIN_GPU,
    cpu=TRAIN_CPU_COUNT,
    timeout=60 * MINUTES
)
def train(
    unified_yaml_path: str,
    model_size="yolov8m.pt",
    quick_check=False,
):
    import torch
    import os
    import gc
    from ultralytics import YOLO
    
    _original_torch_load = torch.load
    torch.load = lambda *args, **kwargs: _original_torch_load(*args, weights_only=False, **kwargs)
    
    os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
    os.environ['YOLO_PLOTS'] = 'False'  
    
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    volume.reload()  

    import shutil
    model_path = volume_path / "runs" / "unified_model"
    if model_path.exists():
        shutil.rmtree(model_path)
    model_path.mkdir(parents=True, exist_ok=True)

    print(f"Loading {model_size} model...")
    model = YOLO(model_size)  
    
 
    epochs = 15 if not quick_check else 15
    batch_size = 32
    
    print(f"Starting transfer learning with batch size {batch_size} for {epochs} epochs...")
    
    try:
       
        model.train(
            data=unified_yaml_path,
            device=list(range(TRAIN_GPU_COUNT)),
            epochs=epochs,
            
            batch=batch_size,
            imgsz=640,
            pretrained=True,  
            freeze=5,        
            augment=True,  
            cos_lr=True, 
            cache=True,
            workers=max(TRAIN_CPU_COUNT // TRAIN_GPU_COUNT, 1),
            
            optimizer="AdamW",
            patience=0,
            save_period=1,
            
            project=f"{volume_path}/runs",
            name="unified_model",
            exist_ok=True,
            verbose=True,
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Training error: {e}")
    
    best_weights_path = volume_path / "runs" / "unified_model" / "weights" / "best.pt"
    
    if best_weights_path.exists():
        print(f"Training complete. Best weights saved to {best_weights_path}")
        return str(best_weights_path)
    else:
            
        last_weights_path = volume_path / "runs" / "unified_model" / "weights" / "last.pt"
        if last_weights_path.exists():
            print(f"Training complete. Last weights saved to {last_weights_path}")
            return str(last_weights_path)
        else:
            raise RuntimeError("No weights found after training!")

@app.function()
def read_image(image_path: str):
    import cv2

    source = cv2.imread(image_path)
    return source

@app.cls(gpu="A100") #less memory
class Inference:
    def __init__(self, weights_path):
        self.weights_path = weights_path

    @modal.enter()
    def load_model(self):
        from ultralytics import YOLO
        import torch
        
        torch.backends.cudnn.benchmark = True
        
        self.model = YOLO(self.weights_path)

    @modal.method()
    def predict(self, model_id: str, image_path: str, display: bool = False):
        results = self.model.predict(
            image_path,
            half=True, #fp16
            save=True,
            exist_ok=True,
            project=f"{volume_path}/predictions/{model_id}",
        )
        if display:
            from term_image.image import from_file

            terminal_image = from_file(results[0].path)
            terminal_image.draw()

    @modal.method()
    def streaming_count(self, batch_dir: str, threshold: float | None = None):
        import os
        import time

        image_files = [
            os.path.join(batch_dir, f) for f in os.listdir(batch_dir)
        ]

        completed, start = 0, time.monotonic_ns()
        for image in read_image.map(image_files):
            results = self.model.predict(
                image,
                half=True, #fp16
                save=False,
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

@app.local_entrypoint()
def main(quick_check: bool = False, inference_only: bool = False):
    import os
    
    pothole = DatasetConfig(
        workspace_id="pothole-azvhk",
        project_id="pothole-clzln-nytef",
        version=1,
        format="yolov8", 
        target_class="Pothole",
        api_key="POTHOLE_API_KEY"
    )
    litter = DatasetConfig(
        workspace_id="litter-gjwtf",
        project_id="garbage-bc3vb",
        version=1,
        format="yolov8", 
        target_class="Litter",
        api_key="LITTER_API_KEY"
    )
    flood = DatasetConfig(
        workspace_id="flood-rhaty",
        project_id="flood-tjtoa",
        version=1,
        format="yolov8",
        target_class="Flood",
        api_key="FLOOD_API_KEY"
    )
    light = DatasetConfig(
        workspace_id="streetlight-wnkgf",
        project_id="light-rfvlc",
        version=1,
        format="yolov8", 
        target_class="Light",
        api_key="LIGHT_API_KEY"
    )

    datasets = [pothole, litter, flood, light]

    if not inference_only:
        print("Downloading datasets...")
        categories = []
        for category in download_dataset.map(datasets):
            categories.append(category)
        
        print("Creating unified dataset...")
        unified_yaml_path = create_unified_dataset.remote(categories)
        
        print("Training unified model...")
        best_weights_path = train.remote(unified_yaml_path, quick_check=quick_check)
    else:
        best_weights_path = str(volume_path / "runs" / "unified_model" / "weights" / "best.pt")
    
    inference = Inference(best_weights_path)
    
    for dataset in datasets:
        category_dir = volume_path / "dataset_parts" / dataset.target_class
        test_img_dir = category_dir / "test" / "images"
        
        if not test_img_dir.exists():
            continue
            
        print(f"Running inference on {dataset.target_class} test images...")
        for i, img_file in enumerate(os.listdir(test_img_dir)[:3]):  #first 3 pics
            img_path = test_img_dir / img_file
            print(f"Testing image: {img_path}")
            inference.predict.remote(
                model_id="unified_model",
                image_path=str(img_path),
                display=(i == 0) 
            )
    
    print("fin.")