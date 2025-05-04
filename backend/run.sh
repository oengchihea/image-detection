#!/bin/bash

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Download model if it doesn't exist
if [ ! -f "models/faceforensics_model.pth" ]; then
    echo "Downloading model..."
    python download_model.py
fi

# Run the Flask app
echo "Starting Flask server..."
python app.py
