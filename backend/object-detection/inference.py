import modal
import base64
from pathlib import Path
import os

image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        ["libgl1-mesa-glx", "libglib2.0-0"]
    )
    .pip_install(
        ["ultralytics", "opencv-python", "fastapi", "python-multipart", "Pillow"]
    )
)

volume = modal.Volume.from_name("yolo-finetune", create_if_missing=True)
volume_path = Path("/root") / "data"

app = modal.App("yolo-dual-model-detection", image=image, volumes={volume_path: volume})

STATIC_DIR = Path(__file__).parent / "static"
STATIC_DIR.mkdir(exist_ok=True)

html_content = """
<!DOCTYPE html>
<html>
<head>
    <title>YOLO Dual Model Detection</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            margin: 0; 
            padding: 20px; 
            background-color: #f0f0f0;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .video-container { 
            position: relative;
            margin: 0 auto; 
            width: 640px; 
            height: 480px; 
            border: 1px solid #ccc;
            background-color: #000;
        }
        @media (max-width: 680px) {
            .video-container {
                width: 100%;
                height: auto;
                aspect-ratio: 4/3;
            }
        }
        #webcam, #overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        #overlay {
            z-index: 10;
        }
        .controls {
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .camera-controls {
            margin: 10px 0;
        }
        .slider-container {
            display: flex;
            justify-content: space-between;
            width: 100%;
            max-width: 600px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .slider-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            padding: 0 10px;
            min-width: 150px;
            margin-bottom: 10px;
        }
        button {
            padding: 10px 20px;
            font-size: 16px;
            margin: 0 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        #toggle-camera {
            background-color: #4a4a4a;
        }
        #toggle-camera:hover {
            background-color: #5a5a5a;
        }
        .status {
            margin-top: 10px;
            font-style: italic;
            color: #666;
        }
        #fps-counter, #latency-counter {
            position: absolute;
            background-color: rgba(0,0,0,0.5);
            color: white;
            padding: 5px;
            border-radius: 3px;
            z-index: 15;
        }
        #fps-counter {
            top: 10px;
            left: 10px;
        }
        #latency-counter {
            top: 10px;
            right: 10px;
        }
        .no-webcam {
            color: red;
            padding: 20px;
            display: none;
        }
        .model-info {
            margin: 20px 0;
            padding: 15px;
            background-color: #e9f7ef;
            border-radius: 5px;
        }
        .class-list {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
        }
        .class-badge {
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 14px;
        }
        .coco-class {
            background-color: #c8e6c9;
            color: #2e7d32;
        }
        .custom-class {
            background-color: #ffcdd2;
            color: #c62828;
        }
        input[type=range] {
            width: 100%;
        }
        .performance-settings {
            margin-top: 15px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
            width: 100%;
            max-width: 600px;
        }
        @media only screen and (max-width: 768px) {
            .camera-controls {
                display: block;
            }
        }
        
        @media only screen and (min-width: 769px) {
            .camera-controls {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>YOLO Dual Model Detection</h1>
        
        <div class="model-info">
            <h3>Dual Model Detection System</h3>
            <p>This system uses two YOLO models simultaneously:</p>
            <ul style="text-align: left; display: inline-block;">
                <li><strong style="color: #2e7d32;">COCO Model (Green):</strong> Detects common objects like people, cars, phones, etc.</li>
                <li><strong style="color: #c62828;">Environmental Model (Red):</strong> Detects environmental issues like potholes, litter, etc.</li>
            </ul>
            
            <div class="class-list">
                <div class="class-badge custom-class">Pothole</div>
                <div class="class-badge custom-class">Litter</div>
                <div class="class-badge custom-class">Flood</div>
                <div class="class-badge custom-class">Light</div>
                <div class="class-badge coco-class">Person</div>
                <div class="class-badge coco-class">Car</div>
                <div class="class-badge coco-class">Phone</div>
                <div class="class-badge coco-class">+77 more</div>
            </div>
        </div>
        
        <div class="video-container">
            <video id="webcam" autoplay playsinline></video>
            <canvas id="overlay"></canvas>
            <div id="fps-counter">FPS: 0</div>
            <div id="latency-counter">Latency: 0ms</div>
        </div>
        
        <div class="no-webcam" id="no-webcam">
            <h2>Webcam not available</h2>
            <p>Please ensure your browser has permission to access your webcam.</p>
        </div>
        
        <div class="controls">
            <div class="camera-controls">
                <button id="toggle-camera">Switch to Front Camera</button>
            </div>
            
            <div class="slider-container">
                <div class="slider-group">
                    <label for="env-confidence">Environmental Model: <span id="env-confidence-value">0.25</span></label>
                    <input type="range" id="env-confidence" min="0.1" max="0.9" step="0.05" value="0.25">
                </div>
                <div class="slider-group">
                    <label for="coco-confidence">COCO Model: <span id="coco-confidence-value">0.25</span></label>
                    <input type="range" id="coco-confidence" min="0.1" max="0.9" step="0.05" value="0.25">
                </div>
            </div>
            
            <div class="performance-settings">
                <h4>Performance Settings</h4>
                <div class="slider-container">
                    <div class="slider-group">
                        <label for="input-size">Image Size: <span id="input-size-value">480</span>px</label>
                        <input type="range" id="input-size" min="160" max="640" step="32" value="480">
                    </div>
                    <div class="slider-group">
                        <label for="frame-interval">Frame Interval: <span id="frame-interval-value">300</span>ms</label>
                        <input type="range" id="frame-interval" min="100" max="1000" step="50" value="300">
                    </div>
                </div>
                <div>
                    <label for="adaptive-rate">
                        <input type="checkbox" id="adaptive-rate" checked> Adaptive Frame Rate
                    </label>
                </div>
            </div>
            
            <div style="margin-top: 15px;">
                <button id="start-btn">Start Detection</button>
                <button id="stop-btn" disabled>Stop Detection</button>
            </div>
        </div>
        
        <div class="status" id="status">Ready to start detection.</div>
    </div>

    <script>
        const video = document.getElementById('webcam');
        const overlay = document.getElementById('overlay');
        const ctx = overlay.getContext('2d');
        const startBtn = document.getElementById('start-btn');
        const stopBtn = document.getElementById('stop-btn');
        const statusElement = document.getElementById('status');
        const fpsCounter = document.getElementById('fps-counter');
        const latencyCounter = document.getElementById('latency-counter');
        const noWebcamMessage = document.getElementById('no-webcam');
        
        const envConfidenceSlider = document.getElementById('env-confidence');
        const envConfidenceValue = document.getElementById('env-confidence-value');
        const cocoConfidenceSlider = document.getElementById('coco-confidence');
        const cocoConfidenceValue = document.getElementById('coco-confidence-value');
        const inputSizeSlider = document.getElementById('input-size');
        const inputSizeValue = document.getElementById('input-size-value');
        const frameIntervalSlider = document.getElementById('frame-interval');
        const frameIntervalValue = document.getElementById('frame-interval-value');
        const adaptiveRateCheckbox = document.getElementById('adaptive-rate');
        
        let isCapturing = false;
        let captureInterval;
        let lastFrameTime = 0;
        let frameCount = 0;
        let fpsUpdateInterval;
        let currentInterval = parseInt(frameIntervalSlider.value);
        let processingFrame = false;
        let latencyHistory = [];
        let currentFacingMode = "environment";
        let mediaStream = null;
        
        function updateCanvasSize() {
            const container = document.querySelector('.video-container');
            overlay.width = container.offsetWidth;
            overlay.height = container.offsetHeight;
        }
        
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        
        envConfidenceSlider.addEventListener('input', function() {
            envConfidenceValue.textContent = this.value;
        });
        cocoConfidenceSlider.addEventListener('input', function() {
            cocoConfidenceValue.textContent = this.value;
        });
        inputSizeSlider.addEventListener('input', function() {
            inputSizeValue.textContent = this.value;
        });
        frameIntervalSlider.addEventListener('input', function() {
            frameIntervalValue.textContent = this.value;
            currentInterval = parseInt(this.value);
            
            if (isCapturing && captureInterval) {
                clearInterval(captureInterval);
                captureInterval = setInterval(triggerCapture, currentInterval);
            }
        });
        
        async function toggleCamera() {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => {
                    track.stop();
                });
            }
            
            currentFacingMode = currentFacingMode === "environment" ? "user" : "environment";
            
            try {
                const constraints = {
                    video: { 
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: { ideal: currentFacingMode }
                    }
                };
                
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                video.srcObject = mediaStream;
                await video.play();
                
                document.getElementById('toggle-camera').innerText = 
                    currentFacingMode === "environment" ? "Switch to Front Camera" : "Switch to Back Camera";
                
                return true;
            } catch (err) {
                console.error('Error switching camera:', err);
                return false;
            }
        }
        
        async function setupWebcam() {
            return await toggleCamera();
        }
        
        async function startCapture() {
            if (!video.srcObject) {
                const success = await setupWebcam();
                if (!success) return;
            }
            
            isCapturing = true;
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusElement.textContent = 'Detection running...';
            
            lastFrameTime = performance.now();
            frameCount = 0;
            latencyHistory = [];
            fpsUpdateInterval = setInterval(updateFPS, 1000);
            
            currentInterval = parseInt(frameIntervalSlider.value);
            captureInterval = setInterval(triggerCapture, currentInterval);
        }
        
        function triggerCapture() {
            if (!isCapturing) return;
            
            if (!processingFrame || !adaptiveRateCheckbox.checked) {
                captureFrame();
            }
        }
        
        function stopCapture() {
            isCapturing = false;
            clearInterval(captureInterval);
            clearInterval(fpsUpdateInterval);
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusElement.textContent = 'Detection stopped.';
            
            ctx.clearRect(0, 0, overlay.width, overlay.height);
        }
        
        async function captureFrame() {
            if (!isCapturing) return;
            
            processingFrame = true;
            const startTime = performance.now();
            
            try {
                const targetSize = parseInt(inputSizeSlider.value);
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = targetSize;
                tempCanvas.height = targetSize * (video.videoHeight / video.videoWidth);
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
                
                const dataURL = tempCanvas.toDataURL('image/jpeg', 0.8);
                
                const envConfidence = parseFloat(envConfidenceSlider.value);
                const cocoConfidence = parseFloat(cocoConfidenceSlider.value);
                
                const response = await fetch(`/predict?conf_env=${envConfidence}&conf_coco=${cocoConfidence}`, {
                    method: 'POST',
                    body: dataURL
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const resultDataURL = await response.text();
                
                if (isCapturing) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, overlay.width, overlay.height);
                        ctx.drawImage(img, 0, 0, overlay.width, overlay.height);
                        
                        frameCount++;
                    };
                    img.src = resultDataURL;
                }
                
                const latency = performance.now() - startTime;
                latencyHistory.push(latency);
                if (latencyHistory.length > 10) latencyHistory.shift();
                
                const avgLatency = latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length;
                latencyCounter.textContent = `Latency: ${Math.round(avgLatency)}ms`;
                
                if (adaptiveRateCheckbox.checked) {
                    const newInterval = Math.max(100, Math.min(1000, Math.round(avgLatency * 1.2)));
                    
                    if (Math.abs(newInterval - currentInterval) > 50) {
                        currentInterval = newInterval;
                        clearInterval(captureInterval);
                        captureInterval = setInterval(triggerCapture, currentInterval);
                        
                        frameIntervalSlider.value = currentInterval;
                        frameIntervalValue.textContent = currentInterval;
                    }
                }
                
            } catch (err) {
                console.error('Error processing frame:', err);
                statusElement.textContent = 'Error: ' + err.message;
            } finally {
                processingFrame = false;
            }
        }
        
        function updateFPS() {
            const now = performance.now();
            const elapsed = now - lastFrameTime;
            const fps = Math.round((frameCount / elapsed) * 1000);
            fpsCounter.textContent = `FPS: ${fps}`;
            
            frameCount = 0;
            lastFrameTime = now;
        }
        
        startBtn.addEventListener('click', startCapture);
        stopBtn.addEventListener('click', stopCapture);
        document.getElementById('toggle-camera').addEventListener('click', async () => {
            const wasCapturing = isCapturing;
            if (wasCapturing) {
                stopCapture();
            }
            
            await toggleCamera();
            
            if (wasCapturing) {
                startCapture();
            }
        });
        
        setupWebcam();
    </script>
</body>
</html>
"""

with open(STATIC_DIR / "index.html", "w") as f:
    f.write(html_content)

models_cache = {}

@app.cls(gpu="a10g")
class DualModelDetection:
    def __init__(self, env_model_path=None, coco_model_path="yolov8n.pt"):
        if env_model_path is None:
            self.env_model_path = str(volume_path / "runs" / "unified_model" / "weights" / "best.pt")
        else:
            self.env_model_path = env_model_path
            
        self.coco_model_path = coco_model_path
            
        self.env_classes = None
        self.coco_classes = None
        
        self.initialized = False

    @modal.enter()
    def load_models(self):
        import torch
        from ultralytics import YOLO
        import os
        import yaml
        
        os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
        
        _original_torch_load = torch.load
        torch.load = lambda *args, **kwargs: _original_torch_load(*args, weights_only=False, **kwargs)
        
        torch.backends.cudnn.benchmark = True
        
        global models_cache
        
        if self.env_model_path not in models_cache:
            try:
                print(f"Loading environmental model from {self.env_model_path}")
                env_model = YOLO(self.env_model_path)
                print(f"Successfully loaded environmental model")
                
                env_classes = None
                try:
                    model_yaml = env_model.yaml
                    if hasattr(model_yaml, 'get') and model_yaml.get('names'):
                        env_classes = model_yaml['names']
                        print(f"Loaded environmental class names from model: {env_classes}")
                    else:
                        yaml_path = volume_path / "unified_dataset" / "data.yaml"
                        if yaml_path.exists():
                            with open(yaml_path, "r") as f:
                                dataset_config = yaml.safe_load(f)
                                if 'names' in dataset_config:
                                    env_classes = dataset_config['names']
                                    print(f"Loaded environmental class names from yaml: {env_classes}")
                except Exception as e:
                    print(f"Error loading environmental class names: {e}")
                    env_classes = {0: "Pothole", 1: "Litter", 2: "Flood", 3: "Light"}
                    print(f"Using fallback environmental class names: {env_classes}")
                
                models_cache[self.env_model_path] = (env_model, env_classes)
                    
            except Exception as e:
                print(f"Error loading environmental model: {e}")
                models_cache[self.env_model_path] = (None, None)
        
        self.env_model, self.env_classes = models_cache.get(self.env_model_path, (None, None))
        if self.env_model is None:
            print("Environmental model disabled")
        
        if self.coco_model_path not in models_cache:
            try:
                print(f"Loading COCO model from {self.coco_model_path}")
                coco_model = YOLO(self.coco_model_path)
                print(f"Successfully loaded COCO model")
                
                coco_classes = [
                    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat", "traffic light",
                    "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep", "cow",
                    "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
                    "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove", "skateboard", "surfboard",
                    "tennis racket", "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
                    "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
                    "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote", "keyboard", "cell phone",
                    "microwave", "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
                    "hair drier", "toothbrush"
                ]
                print(f"Loaded COCO class names ({len(coco_classes)} classes)")
                
                models_cache[self.coco_model_path] = (coco_model, coco_classes)
                
            except Exception as e:
                print(f"Error loading COCO model: {e}")
                models_cache[self.coco_model_path] = (None, None)
        
        self.coco_model, self.coco_classes = models_cache.get(self.coco_model_path, (None, None))
        if self.coco_model is None:
            print("COCO model disabled")
            
        self.initialized = True

    @modal.method()
    def detect(self, img_data_base64, conf_env=0.25, conf_coco=0.25):
        import cv2
        import numpy as np
        import math
        
        try:
            img_bytes = base64.b64decode(img_data_base64)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            vis_img = img.copy()
            
            if self.env_model is not None:
                try:
                    env_results = self.env_model(img, stream=True, conf=conf_env, verbose=False)
                    
                    for r in env_results:
                        boxes = r.boxes
                        
                        for box in boxes:
                            x1, y1, x2, y2 = box.xyxy[0]
                            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                            
                            confidence = math.ceil((box.conf[0]*100))/100
                            cls_id = int(box.cls[0])
                            
                            cls_name = self.env_classes.get(cls_id, f"Env-{cls_id}")
                            
                            color = (0, 0, 255)
                            cv2.rectangle(vis_img, (x1, y1), (x2, y2), color, 2)
                            
                            label = f"{cls_name} {confidence:.2f}"
                            t_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)[0]
                            c2 = x1 + t_size[0], y1 - t_size[1] - 3
                            cv2.rectangle(vis_img, (x1, y1), c2, color, -1, cv2.LINE_AA)
                            cv2.putText(vis_img, label, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX,
                                       0.6, [255, 255, 255], 1, cv2.LINE_AA)
                except Exception as e:
                    print(f"Error in environmental model inference: {e}")
            
            if self.coco_model is not None:
                try:
                    coco_results = self.coco_model(img, stream=True, conf=conf_coco, verbose=False)
                    
                    for r in coco_results:
                        boxes = r.boxes
                        
                        for box in boxes:
                            x1, y1, x2, y2 = box.xyxy[0]
                            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                            
                            confidence = math.ceil((box.conf[0]*100))/100
                            cls_id = int(box.cls[0])
                            
                            if cls_id < len(self.coco_classes):
                                cls_name = self.coco_classes[cls_id]
                            else:
                                cls_name = f"COCO-{cls_id}"
                            
                            color = (0, 255, 0)
                            cv2.rectangle(vis_img, (x1, y1), (x2, y2), color, 2)
                            
                            label = f"{cls_name} {confidence:.2f}"
                            t_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)[0]
                            c2 = x1 + t_size[0], y1 - t_size[1] - 3
                            cv2.rectangle(vis_img, (x1, y1), c2, color, -1, cv2.LINE_AA)
                            cv2.putText(vis_img, label, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX,
                                       0.6, [255, 255, 255], 1, cv2.LINE_AA)
                except Exception as e:
                    print(f"Error in COCO model inference: {e}")
            
            _, buffer = cv2.imencode('.jpg', vis_img)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            return f"data:image/jpeg;base64,{img_base64}"
            
        except Exception as e:
            print(f"Error in detection: {e}")
            return None

@app.function(
    image=image.pip_install(["fastapi", "python-multipart", "uvicorn"]),
)
@modal.asgi_app(label="yolo-dual-model-detection")
def fastapi_app():
    from fastapi import FastAPI, Request, Response, Query
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import HTMLResponse, FileResponse
    import os
    
    env_model_path = os.getenv("ENV_MODEL_PATH", None)
    coco_model_path = os.getenv("COCO_MODEL_PATH", "yolov8n.pt")
    
    web_app = FastAPI(title="YOLO Dual Model Detection")
    
    if STATIC_DIR.exists():
        web_app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
    
    @web_app.get("/", response_class=HTMLResponse)
    async def read_root():
        if (STATIC_DIR / "index.html").exists():
            return FileResponse(str(STATIC_DIR / "index.html"))
        else:
            return HTMLResponse(html_content)
    
    detector = DualModelDetection(env_model_path, coco_model_path)
    
    @web_app.post("/predict")
    async def predict(
        request: Request,
        conf_env: float = Query(0.25, description="Confidence threshold for environmental model"),
        conf_coco: float = Query(0.25, description="Confidence threshold for COCO model")
    ):
        try:
            body = await request.body()
            img_data_base64 = body.split(b",")[1]
            
            result = detector.detect.remote(
                img_data_base64, 
                conf_env=conf_env, 
                conf_coco=conf_coco
            )
            
            return Response(content=result)
        except Exception as e:
            print(f"Error in predict endpoint: {e}")
            return Response(content="Error processing image", status_code=500)
    
    return web_app

@app.local_entrypoint()
def main(env_model_path: str = None, coco_model_path: str = "yolov8n.pt"):
    if env_model_path is None:
        env_model_path = str(volume_path / "runs" / "unified_model" / "weights" / "best.pt")
    
    print(f"Deploying app with models:")
    print(f"  - Environmental model: {env_model_path}")
    print(f"  - COCO model: {coco_model_path}")
    print("Once deployed, access the web app at the URL provided by Modal")