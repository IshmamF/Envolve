import modal
import base64
from pathlib import Path
import os
import json
import anthropic

image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(
        ["libgl1-mesa-glx", "libglib2.0-0"]
    )
    .pip_install(
        ["ultralytics", "opencv-python", "fastapi", "python-multipart", "Pillow", "anthropic"]
    )
)

volume = modal.Volume.from_name("yolo-finetune", create_if_missing=True)
volume_path = Path("/root") / "data"

app = modal.App("yolo-dual-model-detection", image=image, volumes={volume_path: volume})

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
            
            # Initialize detections list to return detailed detection data
            detections = {
                'env': [],
                'coco': []
            }
            
            if self.env_model is not None:
                try:
                    env_results = self.env_model(img, stream=True, conf=conf_env, verbose=False)
                    
                    for r in env_results:
                        boxes = r.boxes
                        
                        for box in boxes:
                            x1, y1, x2, y2 = box.xyxy[0]
                            x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                            
                            confidence = float(box.conf[0])
                            cls_id = int(box.cls[0])
                            
                            cls_name = self.env_classes.get(cls_id, f"Env-{cls_id}")
                            
                            color = (0, 0, 255)  # Red for environmental issues
                            cv2.rectangle(vis_img, (x1, y1), (x2, y2), color, 2)
                            
                            label = f"{cls_name} {confidence:.2f}"
                            t_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)[0]
                            c2 = x1 + t_size[0], y1 - t_size[1] - 3
                            cv2.rectangle(vis_img, (x1, y1), c2, color, -1, cv2.LINE_AA)
                            cv2.putText(vis_img, label, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX,
                                       0.6, [255, 255, 255], 1, cv2.LINE_AA)
                            
                            # Add detection to the results
                            detections['env'].append({
                                'class': cls_name,
                                'confidence': confidence,
                                'box': [int(x1), int(y1), int(x2), int(y2)]
                            })
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
                            
                            confidence = float(box.conf[0])
                            cls_id = int(box.cls[0])
                            
                            if cls_id < len(self.coco_classes):
                                cls_name = self.coco_classes[cls_id]
                            else:
                                cls_name = f"COCO-{cls_id}"
                            
                            color = (0, 255, 0)  # Green for COCO objects
                            cv2.rectangle(vis_img, (x1, y1), (x2, y2), color, 2)
                            
                            label = f"{cls_name} {confidence:.2f}"
                            t_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)[0]
                            c2 = x1 + t_size[0], y1 - t_size[1] - 3
                            cv2.rectangle(vis_img, (x1, y1), c2, color, -1, cv2.LINE_AA)
                            cv2.putText(vis_img, label, (x1, y1 - 2), cv2.FONT_HERSHEY_SIMPLEX,
                                       0.6, [255, 255, 255], 1, cv2.LINE_AA)
                            
                            # Add detection to the results
                            detections['coco'].append({
                                'class': cls_name,
                                'confidence': confidence,
                                'box': [int(x1), int(y1), int(x2), int(y2)]
                            })
                except Exception as e:
                    print(f"Error in COCO model inference: {e}")
            
            # Encode the image with detections drawn on it
            _, buffer = cv2.imencode('.jpg', vis_img)
            img_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Return both the image and structured detection data
            return {
                'image': f"data:image/jpeg;base64,{img_base64}",
                'detections': detections
            }
            
        except Exception as e:
            print(f"Error in detection: {e}")
            return None

@modal.method()
async def analyze_with_claude(self, image_base64, classification, title):
    """Use Claude to analyze the image and provide enhanced information"""
    
    # Check if ANTHROPIC_API_KEY is available
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ANTHROPIC_API_KEY not available, skipping Claude analysis")
        return None
    
    try:
        client = anthropic.Anthropic(api_key=api_key)
        
        # Format the prompt with actual values
        prompt_content = f"""You will be given a photo and a classification (which may be null) of the photo, as well as the title of the photo. Your task is to analyze the photo and provide information about it in a specific JSON format. Follow these steps:

1. Examine the provided photo:
<photo>
data:image/jpeg;base64,{image_base64}
</photo>

2. Consider the given classification and title (if available):
<classification>
{classification}
</classification>

Title:
<title>
{title}
</title>

3. Analyze the photo and provide the following information in JSON format:

a. General information: Provide a simple description of a potential environmental fix-up task related to the image. Focus on issues such as potholes, littering, flooding, broken street lights, or similar urban/environmental problems.

b. Environmental task: Describe what you can tell about the photo, including key elements, setting, and any notable features.

c. Severity: Rate the urgency of the issue on a scale from 1 to 5, where 1 is least urgent and 5 is most urgent. Consider factors such as safety hazards, environmental impact, and inconvenience to the public.

d. Tags: List 3-5 relevant tags that categorize the issue or elements in the photo.

Format your response in the following JSON structure:

<answer>
{{
 "general_information": "Detailed description of the photo",
 "environmental_task": "Simple description of the potential task",
 "severity": X,
 "tags": ["tag1", "tag2", "tag3"]
}}
</answer>

Ensure that your analysis is based solely on the information provided in the photo and classification. If the classification is null or doesn't match what you see in the photo, rely on your own analysis of the image.

Remember to be objective and focus on observable details. If you cannot determine certain aspects from the photo, it's acceptable to state that in your response."""

        # Call Claude
        message = await client.messages.create(
            model="claude-3-7-sonnet-20250219",
            max_tokens=4000,
            temperature=0.7,
            messages=[
                {
                    "role": "user",
                    "content": prompt_content
                }
            ]
        )
        
        # Extract JSON from Claude's response
        response_text = message.content[0].text
        
        # Extract JSON between <answer> tags
        json_str = response_text.split('<answer>')[1].split('</answer>')[0].strip()
        result = json.loads(json_str)
        return result
    
    except Exception as e:
        print(f"Error using Claude for analysis: {e}")
        return None

def map_severity_to_string(self, severity_value):
    """Map numerical severity (1-5) to string values (Low, Medium, High)"""
    if isinstance(severity_value, str):
        return severity_value
        
    severity_map = {
        1: "Low",
        2: "Low",
        3: "Medium",
        4: "High",
        5: "High"
    }
    return severity_map.get(severity_value, "Medium")

@app.function(
    image=image.pip_install(["fastapi", "python-multipart", "uvicorn"]),
)
@modal.asgi_app(label="yolo-dual-model-detection")
def fastapi_app():
    from fastapi import FastAPI, Request, Response, Query
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    import json
    import os
    
    env_model_path = os.getenv("ENV_MODEL_PATH", None)
    coco_model_path = os.getenv("COCO_MODEL_PATH", "yolov8n.pt")
    
    web_app = FastAPI(title="YOLO Dual Model Detection API")
    
    # Add CORS middleware to allow requests from your frontend
    web_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Adjust this in production to be more restrictive
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    detector = DualModelDetection(env_model_path, coco_model_path)
    
    @web_app.get("/")
    async def read_root():
        return {"message": "YOLO Dual Model Detection API is running"}
    
    @web_app.post("/detect")
    async def detect(
        request: Request,
        conf_env: float = Query(0.25, description="Confidence threshold for environmental model"),
        conf_coco: float = Query(0.25, description="Confidence threshold for COCO model")
    ):
        try:
            body = await request.body()
            # Handle if data is sent as JSON with base64 string
            if body.startswith(b'{'):
                try:
                    json_data = json.loads(body)
                    img_data_base64 = json_data.get('image', '').split(',')[1]
                except:
                    return JSONResponse(content={"error": "Invalid JSON format"}, status_code=400)
            else:
                # Handle if data is sent directly as base64 string
                try:
                    img_data_base64 = body.split(b',')[1]
                except:
                    img_data_base64 = body
            
            result = detector.detect.remote(
                img_data_base64, 
                conf_env=conf_env, 
                conf_coco=conf_coco
            )
            
            if result:
                return JSONResponse(content=result)
            else:
                return JSONResponse(content={"error": "Detection failed"}, status_code=500)
        except Exception as e:
            print(f"Error in detect endpoint: {e}")
            return JSONResponse(content={"error": f"Error processing image: {str(e)}"}, status_code=500)
    
    @web_app.post("/analyze")
    async def analyze(
        request: Request,
        conf_env: float = Query(0.3, description="Confidence threshold for environmental model"),
        conf_coco: float = Query(0.3, description="Confidence threshold for COCO model")
    ):
        """Endpoint for final image analysis with higher confidence thresholds and additional metadata"""
        try:
            body = await request.body()
            
            # Handle if data is sent as JSON with base64 string
            if body.startswith(b'{'):
                try:
                    json_data = json.loads(body)
                    img_data_base64 = json_data.get('image', '').split(',')[1]
                except:
                    return JSONResponse(content={"error": "Invalid JSON format"}, status_code=400)
            else:
                # Handle if data is sent directly as base64 string
                try:
                    img_data_base64 = body.split(b',')[1]
                except:
                    img_data_base64 = body
            
            # Call the same detection method but with higher confidence thresholds
            result = detector.detect.remote(
                img_data_base64, 
                conf_env=conf_env, 
                conf_coco=conf_coco
            )
            
            if not result:
                return JSONResponse(content={"error": "Detection failed"}, status_code=500)
                
            # Process the results to get more meaningful API response for the React app
            env_detections = result['detections']['env']
            coco_detections = result['detections']['coco']
            
            # Generate the API response with titles, descriptions, etc.
            title = "No issues detected"
            category = "General"
            severity = "Low"
            tags = []
            
            # Customize based on environmental detections
            if env_detections:
                # Get most confident environmental detection
                best_env = max(env_detections, key=lambda x: x['confidence'])
                title = f"{best_env['class']} detected"
                category = "Environmental Issue"
                
                # Set severity based on confidence and type
                if best_env['confidence'] > 0.7:
                    severity = "High"
                elif best_env['confidence'] > 0.5:
                    severity = "Medium"
                else:
                    severity = "Low"
                
                # Add all environmental classes to tags
                tags.extend([d['class'] for d in env_detections])
            
            # Add relevant COCO objects to tags
            if coco_detections:
                top_coco = [d['class'] for d in sorted(coco_detections, key=lambda x: x['confidence'], reverse=True)[:3]]
                tags.extend(top_coco)
            
            # Generate a description based on detections
            description = "Analysis complete."
            if env_detections:
                env_classes = [d['class'] for d in env_detections]
                description = f"Detected environmental issues: {', '.join(env_classes)}. "
                
                if "Pothole" in env_classes:
                    description += "Potholes may pose a hazard to vehicles and pedestrians. "
                if "Litter" in env_classes:
                    description += "Litter should be cleaned up promptly. "
                if "Flood" in env_classes:
                    description += "Flooding detected, which may require immediate attention. "
            
            if coco_detections:
                relevant_objects = [d['class'] for d in coco_detections if d['confidence'] > 0.4]
                if relevant_objects:
                    description += f"Also detected: {', '.join(relevant_objects)}."
            
            # Call Claude for enhanced analysis if ANTHROPIC_API_KEY is available
            enhanced_analysis = None
            try:
                enhanced_analysis = await self.analyze_with_claude(
                    image_base64=img_data_base64,
                    classification=json.dumps(result['detections']), 
                    title=title
                )
            except Exception as e:
                print(f"Claude analysis failed, using basic analysis: {e}")
                
            # Create the final API response with Claude analysis if available
            api_response = {
                "image": result['image'],
                "detections": result['detections'],
                "title": title,
                "description": description,
                "category": category,
                "tags": ",".join(tags),
                "severity": severity
            }
            
            # Update with Claude analysis if available
            if enhanced_analysis:
                api_response.update({
                    "description": enhanced_analysis.get("general_information", description),
                    "environmental_task": enhanced_analysis.get("environmental_task", ""),
                    "severity": self.map_severity_to_string(enhanced_analysis.get("severity", 3)),
                    "tags": ",".join(enhanced_analysis.get("tags", tags))
                })
            
            return JSONResponse(content=api_response)
            
        except Exception as e:
            print(f"Error in analyze endpoint: {e}")
            return JSONResponse(content={"error": f"Error processing image: {str(e)}"}, status_code=500)
    
    return web_app

@app.local_entrypoint()
def main(env_model_path: str = None, coco_model_path: str = "yolov8n.pt"):
    if env_model_path is None:
        env_model_path = str(volume_path / "runs" / "unified_model" / "weights" / "best.pt")
    
    print(f"Deploying app with models:")
    print(f"  - Environmental model: {env_model_path}")
    print(f"  - COCO model: {coco_model_path}")
    print("Once deployed, access the API at the URL provided by Modal")