from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import torch
from torchvision import transforms
import os
from werkzeug.utils import secure_filename
import tempfile

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
ALLOWED_VIDEO_EXTENSIONS = {'mp4', 'mov', 'avi'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max upload

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load the FaceForensics++ model
# Note: In a real implementation, you would need to download the pre-trained model
class FaceForensicsModel:
    def __init__(self):
        # In a real implementation, you would load the actual model here
        # For example:
        # self.model = torch.hub.load('pytorch/vision:v0.10.0', 'resnet50', pretrained=True)
        # self.model.eval()
        print("Initializing FaceForensics++ model...")
        
    def preprocess_image(self, image_path):
        # Load and preprocess the image
        image = cv2.imread(image_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Resize and normalize
        transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        
        return transform(image).unsqueeze(0)
    
    def detect_fake(self, image_path):
        # In a real implementation, you would:
        # 1. Preprocess the image
        # 2. Run it through the model
        # 3. Return the prediction
        
        # For demonstration, we'll return a random result
        import random
        is_fake = random.random() > 0.5
        confidence = random.uniform(0.7, 0.99)
        
        # Generate a fake heatmap for visualization
        image = cv2.imread(image_path)
        heatmap = np.zeros((image.shape[0], image.shape[1]), dtype=np.uint8)
        
        if is_fake:
            # Create random regions of "manipulation"
            for _ in range(3):
                x = random.randint(0, image.shape[1] - 100)
                y = random.randint(0, image.shape[0] - 100)
                w = random.randint(50, 100)
                h = random.randint(50, 100)
                intensity = random.randint(100, 255)
                heatmap[y:y+h, x:x+w] = intensity
            
            # Apply colormap
            heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
            
            # Blend with original image
            alpha = 0.7
            blended = cv2.addWeighted(image, 1 - alpha, heatmap, alpha, 0)
            
            # Save heatmap
            heatmap_path = image_path.replace('.', '_heatmap.')
            cv2.imwrite(heatmap_path, blended)
        else:
            heatmap_path = None
        
        return {
            "is_real": not is_fake,
            "confidence": confidence * 100,
            "heatmap_path": heatmap_path
        }
    
    def process_video(self, video_path):
        # In a real implementation, you would:
        # 1. Extract frames from the video
        # 2. Process each frame
        # 3. Aggregate results
        
        # For demonstration, we'll return a random result
        import random
        is_fake = random.random() > 0.5
        confidence = random.uniform(0.7, 0.99)
        
        # Create a simple visualization
        cap = cv2.VideoCapture(video_path)
        ret, frame = cap.read()
        cap.release()
        
        if ret:
            heatmap = np.zeros((frame.shape[0], frame.shape[1]), dtype=np.uint8)
            
            if is_fake:
                # Create random regions of "manipulation"
                for _ in range(3):
                    x = random.randint(0, frame.shape[1] - 100)
                    y = random.randint(0, frame.shape[0] - 100)
                    w = random.randint(50, 100)
                    h = random.randint(50, 100)
                    intensity = random.randint(100, 255)
                    heatmap[y:y+h, x:x+w] = intensity
                
                # Apply colormap
                heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
                
                # Blend with original image
                alpha = 0.7
                blended = cv2.addWeighted(frame, 1 - alpha, heatmap, alpha, 0)
                
                # Save heatmap
                heatmap_path = video_path.replace('.', '_heatmap.')
                cv2.imwrite(heatmap_path, blended)
            else:
                heatmap_path = None
            
            return {
                "is_real": not is_fake,
                "confidence": confidence * 100,
                "heatmap_path": heatmap_path
            }
        else:
            return {
                "is_real": not is_fake,
                "confidence": confidence * 100,
                "heatmap_path": None
            }

# Initialize the model
model = FaceForensicsModel()

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

@app.route('/api/detect', methods=['POST'])
def detect_fake():
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
        
        # Save the file
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Process based on file type
        if allowed_file(filename, ALLOWED_IMAGE_EXTENSIONS):
            result = model.detect_fake(file_path)
        else:  # Video file
            result = model.process_video(file_path)
        
        # If there's a heatmap, convert it to a URL
        if result.get('heatmap_path'):
            # In a real app, you'd serve this file or upload to cloud storage
            # For demo, we'll just return the filename
            result['heatmap_url'] = f"/api/heatmap/{os.path.basename(result['heatmap_path'])}"
            del result['heatmap_path']
        
        return jsonify(result)
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/heatmap/<filename>')
def get_heatmap(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)
