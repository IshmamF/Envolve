import modal
from pathlib import Path


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

