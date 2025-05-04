from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import os
import time
import uuid
import random
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configure CORS to allow requests from any origin
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max upload

# Create necessary folders
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Load OpenCV face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def process_image(image_path):
    """Process a single image for deepfake detection (simplified mock version)"""
    # Read image
    image = cv2.imread(image_path)
    if image is None:
        return {"error": "Could not read image"}, None
    
    # Image size
    height, width = image.shape[:2]
    
    # Detect faces using OpenCV
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    results = []
    output_image = image.copy()
    
    if len(faces) == 0:
        return {"error": "No faces detected in the image"}, None
    
    for (x, y, w, h) in faces:
        # For demo purposes, randomly decide if face is real or fake
        is_real = random.choice([True, False])
        confidence = random.uniform(70, 95)
        
        # Store result
        face_result = {
            "is_real": is_real,
            "confidence": float(confidence),
            "bbox": [int(x), int(y), int(x+w), int(y+h)],
            "raw_probs": [random.random(), random.random()]
        }
        results.append(face_result)
        
        # Draw on output image
        label = 'Real' if is_real else 'Fake'
        color = (0, 255, 0) if is_real else (0, 0, 255)
        cv2.rectangle(output_image, (x, y), (x+w, y+h), color, 2)
        cv2.putText(output_image, f"{label} ({confidence:.1f}%)", 
                   (x, y+h+20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    
    # Save output image
    output_path = os.path.join(app.config['OUTPUT_FOLDER'], f"output_{os.path.basename(image_path)}")
    cv2.imwrite(output_path, output_image)
    
    # Generate heatmap for visualization
    heatmap_path = None
    if any(not result["is_real"] for result in results):
        heatmap = np.zeros((height, width), dtype=np.uint8)
        
        for result in results:
            if not result["is_real"]:
                x1, y1, x2, y2 = result["bbox"]
                # Create gradient effect in the fake face region
                for y in range(y1, y2):
                    for x in range(x1, x2):
                        # Distance from center (normalized)
                        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2
                        dist = 1 - min(1.0, np.sqrt(((x - cx) / (x2 - x1 + 1e-5))**2 + 
                                                   ((y - cy) / (y2 - y1 + 1e-5))**2))
                        intensity = int(dist * 255)
                        if 0 <= y < height and 0 <= x < width:
                            heatmap[y, x] = max(heatmap[y, x], intensity)
        
        # Apply colormap
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        # Blend with original image
        alpha = 0.6
        blended = cv2.addWeighted(image, 1 - alpha, heatmap, alpha, 0)
        
        # Save heatmap
        heatmap_path = os.path.join(app.config['OUTPUT_FOLDER'], f"heatmap_{os.path.basename(image_path)}")
        cv2.imwrite(heatmap_path, blended)
    
    # Determine overall result (if any face is fake, the image is considered fake)
    is_real = all(result["is_real"] for result in results)
    avg_confidence = sum(result["confidence"] for result in results) / len(results)
    
    return {
        "is_real": is_real,
        "confidence": float(avg_confidence),
        "face_results": results,
        "output_image": os.path.basename(output_path),
        "heatmap": os.path.basename(heatmap_path) if heatmap_path else None
    }, output_image

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/')
def index():
    # Add CORS headers manually to be extra sure
    response = jsonify({
        "status": "ok",
        "message": "DeepFake Detection API is running",
        "endpoints": [
            {"path": "/health", "method": "GET", "description": "Health check endpoint"},
            {"path": "/api/detect", "method": "POST", "description": "Detect deepfakes in images/videos"}
        ]
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/api/detect', methods=['POST', 'OPTIONS'])
def detect_fake():
    # Handle preflight requests
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Origin', '*')
        return response
        
    # Check if file is in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check if file is allowed
    if file and (allowed_file(file.filename, ALLOWED_IMAGE_EXTENSIONS) or 
                 allowed_file(file.filename, ALLOWED_VIDEO_EXTENSIONS)):
        
        # Save the file with a unique name to avoid conflicts
        filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            # Process based on file type
            import time
            start_time = time.time()
            
            if allowed_file(filename, ALLOWED_IMAGE_EXTENSIONS):
                result, _ = process_image(file_path)
                result['processing_time'] = time.time() - start_time
                
                # Add URLs for the output images
                if 'output_image' in result:
                    result['output_image_url'] = f"/api/output/{result['output_image']}"
                if 'heatmap' in result and result['heatmap']:
                    result['heatmap_url'] = f"/api/output/{result['heatmap']}"
                
                # Add model details for the enhanced UI
                result['model_results'] = [
                    {
                        "model_name": "FaceForensics++ (Xception)",
                        "confidence": result.get('confidence', 0),
                        "prediction": "Real" if result.get('is_real', False) else "Fake",
                        "weight": 0.6
                    },
                    {
                        "model_name": "Face Consistency Analysis",
                        "confidence": result.get('confidence', 0) * 0.9,  # Slightly different for variety
                        "prediction": "Real" if result.get('is_real', False) else "Fake",
                        "weight": 0.25
                    },
                    {
                        "model_name": "Frequency Analysis",
                        "confidence": result.get('confidence', 0) * 1.1,  # Slightly different for variety
                        "prediction": "Real" if result.get('is_real', False) else "Fake",
                        "weight": 0.15
                    }
                ]
                
                # Add detected artifacts for fake content
                if not result.get('is_real', True):
                    possible_artifacts = [
                        "Inconsistent eye blinking",
                        "Unnatural skin texture",
                        "Facial warping near edges",
                        "Color inconsistencies",
                        "Temporal inconsistencies between frames",
                        "Unusual specular highlights",
                        "Blurry or missing reflections",
                        "Inconsistent noise patterns"
                    ]
                    
                    # Select 2-4 artifacts
                    num_artifacts = random.randint(2, 4)
                    result['detected_artifacts'] = random.sample(possible_artifacts, num_artifacts)
                else:
                    result['detected_artifacts'] = []
            
            else:  # Video file
                # For simplicity, we'll just return a mock response for videos
                result = {
                    "is_real": random.choice([True, False]),
                    "confidence": random.uniform(70, 95),
                    "processing_time": time.time() - start_time,
                    "fake_frame_percentage": random.uniform(10, 90),
                    "total_frames": 100,
                    "analyzed_frames": 30,
                    "model_results": [
                        {
                            "model_name": "FaceForensics++ (Xception)",
                            "confidence": random.uniform(70, 95),
                            "prediction": "Real" if random.choice([True, False]) else "Fake",
                            "weight": 0.6
                        }
                    ],
                    "detected_artifacts": []
                }
                
                if not result["is_real"]:
                    possible_artifacts = [
                        "Inconsistent eye blinking",
                        "Unnatural skin texture",
                        "Facial warping near edges",
                        "Color inconsistencies"
                    ]
                    result['detected_artifacts'] = random.sample(possible_artifacts, 2)
            
            # Add CORS headers manually to be extra sure
            response = jsonify(result)
            response.headers.add('Access-Control-Allow-Origin', '*')
            return response
            
        except Exception as e:
            import traceback
            print(f"Error processing file: {e}")
            print(traceback.format_exc())
            return jsonify({'error': f'Error processing file: {str(e)}'}), 500
        finally:
            # Clean up the uploaded file
            try:
                os.remove(file_path)
            except:
                pass
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/output/<filename>')
def get_output_file(filename):
    response = send_from_directory(app.config['OUTPUT_FOLDER'], filename)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/health')
def health_check():
    # Add CORS headers manually to be extra sure
    response = jsonify({'status': 'ok'})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    print("Starting minimal Flask server on http://localhost:5000")
    print("Health check endpoint: http://localhost:5000/health")
    print("Root endpoint: http://localhost:5000/")
    print("API endpoint: http://localhost:5000/api/detect")
    app.run(debug=True, host='0.0.0.0', port=5000)