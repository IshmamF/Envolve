import modal

stub = modal.App("yolo-checker")

volume = modal.Volume.from_name("yolo-finetune")
volume_path = "/root/data"

@stub.function(volumes={volume_path: volume})
def check_weights():
    import os
    weights_path = os.path.join(volume_path, "runs/unified_model/weights/best.pt")
    if os.path.exists(weights_path):
        print(f"✅ Found weights at {weights_path}")
        return True
    else:
        print(f"❌ No weights found at {weights_path}")
        return False

if __name__ == "__main__":
    with stub.run():
        result = check_weights.call()
        print(f"Weights exist: {result}")
