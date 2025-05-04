import torch
import torch.nn as nn
import torchvision.models as models
import numpy as np
import cv2
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import os
from PIL import Image
import matplotlib.pyplot as plt
from scipy import fftpack

# 1. ENSEMBLE MODEL APPROACH
class EnsembleDeepfakeDetector:
    def __init__(self):
        # Initialize multiple models for ensemble detection
        self.models = {
            'faceforensics': self._create_faceforensics_model(),
            'recurrent_cnn': self._create_recurrent_cnn_model(),
            'frequency_analysis': self._create_frequency_analysis_model()
        }
        
        # Model weights (can be tuned based on validation performance)
        self.weights = {
            'faceforensics': 0.5,
            'recurrent_cnn': 0.3,
            'frequency_analysis': 0.2
        }
    
    def _create_faceforensics_model(self):
        # Base model using ResNet50 (similar to FaceForensics++)
        model = models.resnet50(pretrained=True)
        num_ftrs = model.fc.in_features
        model.fc = nn.Sequential(
            nn.Linear(num_ftrs, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, 2)  # Binary classification: real or fake
        )
        # In a real implementation, you would load pre-trained weights
        # model.load_state_dict(torch.load('faceforensics_weights.pth'))
        model.eval()
        return model
    
    def _create_recurrent_cnn_model(self):
        # CNN + LSTM for temporal analysis in videos
        backbone = models.resnet34(pretrained=True)
        backbone = nn.Sequential(*list(backbone.children())[:-1])  # Remove classification layer
        
        class RCNN(nn.Module):
            def __init__(self, backbone):
                super(RCNN, self).__init__()
                self.backbone = backbone
                self.lstm = nn.LSTM(512, 256, batch_first=True)
                self.fc = nn.Linear(256, 2)
                
            def forward(self, x):
                batch_size, seq_len, c, h, w = x.shape
                x = x.view(batch_size * seq_len, c, h, w)
                features = self.backbone(x).view(batch_size, seq_len, -1)
                lstm_out, _ = self.lstm(features)
                output = self.fc(lstm_out[:, -1, :])
                return output
        
        model = RCNN(backbone)
        # In a real implementation, you would load pre-trained weights
        # model.load_state_dict(torch.load('rcnn_weights.pth'))
        model.eval()
        return model
    
    def _create_frequency_analysis_model(self):
        # Model that analyzes frequency domain artifacts
        model = models.resnet34(pretrained=True)
        model.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)  # Modified for grayscale FFT input
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, 2)
        # In a real implementation, you would load pre-trained weights
        # model.load_state_dict(torch.load('frequency_model_weights.pth'))
        model.eval()
        return model
    
    def preprocess_image(self, image_path):
        # Standard preprocessing for CNN models
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        image = Image.open(image_path).convert('RGB')
        return transform(image).unsqueeze(0)
    
    def preprocess_video_frames(self, video_path, num_frames=16):
        # Extract frames from video for temporal analysis
        cap = cv2.VideoCapture(video_path)
        frames = []
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Select evenly spaced frames
        indices = np.linspace(0, frame_count - 1, num_frames, dtype=int)
        
        transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        for i in indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, i)
            ret, frame = cap.read()
            if ret:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(transform(frame))
        
        cap.release()
        
        # Stack frames for batch processing
        return torch.stack(frames).unsqueeze(0)  # [1, num_frames, 3, 224, 224]
    
    def preprocess_frequency(self, image_path):
        # Process image in frequency domain
        image = cv2.imread(image_path, 0)  # Grayscale
        image = cv2.resize(image, (224, 224))
        
        # Apply FFT
        f_transform = fftpack.fft2(image)
        f_transform_shifted = fftpack.fftshift(f_transform)
        magnitude_spectrum = np.log(np.abs(f_transform_shifted) + 1)
        
        # Normalize and convert to tensor
        magnitude_spectrum = (magnitude_spectrum - magnitude_spectrum.min()) / (magnitude_spectrum.max() - magnitude_spectrum.min())
        magnitude_spectrum = torch.tensor(magnitude_spectrum).float().unsqueeze(0).unsqueeze(0)  # [1, 1, 224, 224]
        
        return magnitude_spectrum
    
    def detect(self, file_path, is_video=False):
        with torch.no_grad():
            # Process with each model
            results = {}
            
            # 1. FaceForensics++ style model
            img_tensor = self.preprocess_image(file_path)
            outputs = self.models['faceforensics'](img_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            results['faceforensics'] = {
                'is_real': probabilities[0][0].item() > probabilities[0][1].item(),
                'confidence': max(probabilities[0][0].item(), probabilities[0][1].item()) * 100
            }
            
            # 2. Recurrent CNN for temporal analysis (for videos)
            if is_video:
                frames = self.preprocess_video_frames(file_path)
                outputs = self.models['recurrent_cnn'](frames)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                results['recurrent_cnn'] = {
                    'is_real': probabilities[0][0].item() > probabilities[0][1].item(),
                    'confidence': max(probabilities[0][0].item(), probabilities[0][1].item()) * 100
                }
            else:
                # For images, use a simplified version or skip
                results['recurrent_cnn'] = results['faceforensics']
            
            # 3. Frequency domain analysis
            freq_tensor = self.preprocess_frequency(file_path)
            outputs = self.models['frequency_analysis'](freq_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            results['frequency_analysis'] = {
                'is_real': probabilities[0][0].item() > probabilities[0][1].item(),
                'confidence': max(probabilities[0][0].item(), probabilities[0][1].item()) * 100
            }
            
            # Ensemble the results
            weighted_real_score = sum(
                results[model]['is_real'] * results[model]['confidence'] * self.weights[model]
                for model in self.models
            ) / sum(self.weights.values())
            
            # Final decision
            is_real = weighted_real_score > 50
            
            confidence = abs(weighted_real_score - 50) * 2  # Scale to 0-100%
            
            # Generate heatmap for visualization
            heatmap = self._generate_manipulation_heatmap(file_path)
            
            return {
                'is_real': is_real,
                'confidence': confidence,
                'heatmap': heatmap,
                'model_results': [
                    {
                        'model_name': model,
                        'prediction': 'Real' if results[model]['is_real'] else 'Fake',
                        'confidence': results[model]['confidence'],
                        'weight': self.weights[model]
                    } for model in self.models
                ]
            }
    
    def _generate_manipulation_heatmap(self, image_path):
        """Generate a heatmap highlighting potentially manipulated regions"""
        # Load image
        image = cv2.imread(image_path)
        image = cv2.resize(image, (224, 224))
        
        # In a real implementation, this would use a specialized model
        # for pixel-level manipulation detection. Here we'll simulate it.
        
        # Convert to RGB for processing
        rgb_img = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # 1. Error Level Analysis (ELA)
        # Save image at a specific quality level
        temp_path = "temp_ela.jpg"
        cv2.imwrite(temp_path, image, [cv2.IMWRITE_JPEG_QUALITY, 90])
        
        # Read the saved image
        saved_img = cv2.imread(temp_path)
        os.remove(temp_path)  # Clean up
        
        # Calculate the difference
        ela_img = cv2.absdiff(image, saved_img) * 10
        
        # 2. Noise Analysis
        # Apply median blur and find difference with original
        median_img = cv2.medianBlur(image, 3)
        noise_img = cv2.absdiff(image, median_img) * 5
        
        # 3. Combine the analyses
        heatmap = cv2.addWeighted(ela_img, 0.5, noise_img, 0.5, 0)
        
        # Apply colormap for visualization
        heatmap = cv2.applyColorMap(cv2.cvtColor(heatmap, cv2.COLOR_BGR2GRAY), cv2.COLORMAP_JET)
        
        # Blend with original image
        alpha = 0.6
        blended = cv2.addWeighted(image, 1 - alpha, heatmap, alpha, 0)
        
        # Save heatmap
        heatmap_path = image_path.replace('.', '_heatmap.')
        cv2.imwrite(heatmap_path, blended)
        
        return heatmap_path

# 2. DATA AUGMENTATION FOR TRAINING
class DeepfakeDataset(Dataset):
    def __init__(self, root_dir, transform=None, augment=True):
        self.root_dir = root_dir
        self.transform = transform
        self.augment = augment
        self.samples = []
        
        # Collect all samples (real and fake)
        for label in ['real', 'fake']:
            label_dir = os.path.join(root_dir, label)
            for img_name in os.listdir(label_dir):
                if img_name.endswith(('.jpg', '.png', '.jpeg')):
                    self.samples.append({
                        'path': os.path.join(label_dir, img_name),
                        'label': 0 if label == 'real' else 1  # 0 for real, 1 for fake
                    })
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        sample = self.samples[idx]
        image = Image.open(sample['path']).convert('RGB')
        label = sample['label']
        
        # Apply standard transform
        if self.transform:
            image = self.transform(image)
        
        # Apply augmentation for training
        if self.augment:
            # Random horizontal flip
            if np.random.random() > 0.5:
                image = transforms.functional.hflip(image)
            
            # Color jitter
            if np.random.random() > 0.7:
                image = transforms.functional.adjust_brightness(image, brightness_factor=np.random.uniform(0.8, 1.2))
                image = transforms.functional.adjust_contrast(image, contrast_factor=np.random.uniform(0.8, 1.2))
                image = transforms.functional.adjust_saturation(image, saturation_factor=np.random.uniform(0.8, 1.2))
            
            # Random rotation
            if np.random.random() > 0.7:
                angle = np.random.uniform(-10, 10)
                image = transforms.functional.rotate(image, angle)
        
        return image, label

# 3. TRAINING WITH HARD EXAMPLES
def train_with_hard_examples(model, train_loader, val_loader, num_epochs=10):
    """Training strategy focusing on hard examples"""
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, patience=3)
    
    # Keep track of hard examples
    hard_examples = []
    
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        
        # Regular training phase
        for inputs, labels in train_loader:
            inputs = inputs.cuda()
            labels = labels.cuda()
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
            # Identify hard examples (high loss)
            with torch.no_grad():
                probs = torch.softmax(outputs, dim=1)
                for i in range(inputs.size(0)):
                    # If prediction confidence is low
                    if probs[i, labels[i]] < 0.6:
                        hard_examples.append({
                            'input': inputs[i].cpu(),
                            'label': labels[i].cpu()
                        })
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        correct = 0
        total = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs = inputs.cuda()
                labels = labels.cuda()
                
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                val_loss += loss.item()
                
                _, predicted = torch.max(outputs, 1)
                total += labels.size(0)
                correct += (predicted == labels).sum().item()
        
        val_accuracy = 100 * correct / total
        print(f'Epoch {epoch+1}, Train Loss: {running_loss/len(train_loader):.4f}, '
              f'Val Loss: {val_loss/len(val_loader):.4f}, Val Accuracy: {val_accuracy:.2f}%')
        
        scheduler.step(val_loss)
        
        # Train on hard examples if we have enough
        if len(hard_examples) > 32:
            print(f"Training on {len(hard_examples)} hard examples")
            # Create a mini-batch of hard examples
            hard_inputs = torch.stack([ex['input'] for ex in hard_examples[:64]])
            hard_labels = torch.tensor([ex['label'] for ex in hard_examples[:64]])
            
            model.train()
            hard_inputs = hard_inputs.cuda()
            hard_labels = hard_labels.cuda()
            
            # Train with higher learning rate on hard examples
            for _ in range(3):  # Multiple passes on hard examples
                optimizer.zero_grad()
                outputs = model(hard_inputs)
                loss = criterion(outputs, hard_labels) * 1.5  # Higher weight
                loss.backward()
                optimizer.step()
            
            # Clear the hard examples list
            hard_examples = hard_examples[64:]
    
    return model

# 4. FREQUENCY DOMAIN ANALYSIS
def analyze_frequency_domain(image_path):
    """Analyze image in frequency domain to detect GAN artifacts"""
    # Load image
    image = cv2.imread(image_path, 0)  # Grayscale
    image = cv2.resize(image, (512, 512))
    
    # Apply FFT
    f_transform = fftpack.fft2(image)
    f_transform_shifted = fftpack.fftshift(f_transform)
    magnitude_spectrum = np.log(np.abs(f_transform_shifted) + 1)
    
    # Analyze frequency distribution
    # GAN-generated images often have specific patterns in frequency domain
    
    # 1. Compute average energy in different frequency bands
    h, w = magnitude_spectrum.shape
    center_y, center_x = h // 2, w // 2
    
    # Define frequency bands (distance from center)
    bands = [
        (0, 30),    # Low frequencies
        (30, 100),  # Mid-low frequencies
        (100, 200), # Mid-high frequencies
        (200, 300)  # High frequencies
    ]
    
    band_energies = []
    for inner_r, outer_r in bands:
        band_mask = np.zeros_like(magnitude_spectrum)
        y, x = np.ogrid[:h, :w]
        mask_area = (y - center_y) ** 2 + (x - center_x) ** 2
        band_mask[(mask_area >= inner_r ** 2) & (mask_area < outer_r ** 2)] = 1
        
        # Calculate average energy in this band
        band_energy = np.mean(magnitude_spectrum * band_mask)
        band_energies.append(band_energy)
    
    # 2. Calculate energy ratio between bands
    # GAN images often have unusual ratios between frequency bands
    low_to_high_ratio = band_energies[0] / (band_energies[3] + 1e-10)
    mid_to_high_ratio = band_energies[1] / (band_energies[3] + 1e-10)
    
    # 3. Check for grid-like patterns (common in some GANs)
    # Apply bandpass filter to isolate mid-frequencies
    bandpass_mask = np.zeros_like(magnitude_spectrum)
    mask_area = (y - center_y) ** 2 + (x - center_x) ** 2
    bandpass_mask[(mask_area >= 50 ** 2) & (mask_area < 150 ** 2)] = 1
    
    filtered_spectrum = f_transform_shifted * bandpass_mask
    filtered_image = np.abs(fftpack.ifft2(fftpack.ifftshift(filtered_spectrum)))
    
    # Check for regular patterns in the filtered image
    std_dev = np.std(filtered_image)
    
    # Visualize the frequency spectrum
    plt.figure(figsize=(12, 5))
    
    plt.subplot(131)
    plt.imshow(image, cmap='gray')
    plt.title('Original Image')
    
    plt.subplot(132)
    plt.imshow(magnitude_spectrum, cmap='viridis')
    plt.title('Frequency Spectrum')
    
    plt.subplot(133)
    plt.imshow(filtered_image, cmap='gray')
    plt.title('Filtered Image')
    
    plt.tight_layout()
    plt.savefig(image_path.replace('.', '_freq_analysis.'))
    plt.close()
    
    # Return features for classification
    return {
        'band_energies': band_energies,
        'low_to_high_ratio': low_to_high_ratio,
        'mid_to_high_ratio': mid_to_high_ratio,
        'filtered_std': std_dev
    }

# Example usage
if __name__ == "__main__":
    # Initialize the ensemble detector
    detector = EnsembleDeepfakeDetector()
    
    # Detect a sample image
    result = detector.detect("sample_image.jpg")
    print(f"Detection result: {'Real' if result['is_real'] else 'Fake'}")
    print(f"Confidence: {result['confidence']:.2f}%")
    print(f"Heatmap saved to: {result['heatmap']}")
    
    # Print individual model results
    print("\nIndividual model results:")
    for model_result in result['model_results']:
        print(f"{model_result['model_name']}: {model_result['prediction']} "
              f"({model_result['confidence']:.2f}%, weight: {model_result['weight']})")
    
    # Frequency domain analysis
    print("\nPerforming frequency domain analysis...")
    freq_features = analyze_frequency_domain("sample_image.jpg")
    print("Frequency analysis complete. Visualization saved.")
