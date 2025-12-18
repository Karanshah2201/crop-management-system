"""
Quick Model Evaluation Script
Tests the trained disease detection model
"""

import sys
from pathlib import Path

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

from Utils.disease_predictor import DiseasePredictor
import matplotlib.pyplot as plt
from PIL import Image
import json

def test_model():
    """Test the disease detection model"""
    
    print("\n" + "="*60)
    print("🧪 TESTING DISEASE DETECTION MODEL")
    print("="*60 + "\n")
    
    # Initialize predictor
    predictor = DiseasePredictor()
    
    # Get model info
    info = predictor.get_model_info()
    
    if info['loaded']:
        print("✅ Model Status: LOADED")
        print(f"📊 Classes: {info['num_classes']}")
        print(f"📦 Model Path: {info['model_path']}")
        print(f"📐 Input Shape: {info['input_shape']}\n")
        
        print("📋 Available Disease Classes:")
        for i, class_name in enumerate(info['classes'][:10], 1):
            clean_name = class_name.replace('___', ' - ').replace('_', ' ')
            print(f"   {i}. {clean_name}")
        if len(info['classes']) > 10:
            print(f"   ... and {len(info['classes']) - 10} more\n")
        else:
            print()
            
    else:
        print("❌ Model Status: NOT LOADED")
        print(f"   {info['message']}\n")
        print("To fix:")
        print("   1. Run: python train_disease_model.py")
        print("   2. Ensure dataset is in Backend/Data/plant_diseases/")
        return
    
    # Test with a sample image (if uploads exist)
    upload_dir = Path(__file__).parent / 'uploads'
    
    if upload_dir.exists():
        images = list(upload_dir.glob('*.jpg')) + list(upload_dir.glob('*.png'))
        
        if images:
            print(f"📸 Found {len(images)} images in uploads/\n")
            
            # Test first image
            test_image = images[0]
            print(f"🔍 Testing image: {test_image.name}")
            
            predictions = predictor.predict(test_image, top_k=3)
            
            print("\n📊 Prediction Results:")
            print("-" * 60)
            for i, pred in enumerate(predictions, 1):
                print(f"{i}. {pred['disease']}")
                print(f"   Confidence: {pred['confidence']}%")
                print(f"   Treatment: {pred['treatment'][:60]}...")
                print()
            
            # Display image
            try:
                img = Image.open(test_image)
                plt.figure(figsize=(8, 6))
                plt.imshow(img)
                plt.title(f"Diagnosis: {predictions[0]['disease']}\nConfidence: {predictions[0]['confidence']}%")
                plt.axis('off')
                plt.tight_layout()
                plt.savefig(Path(__file__).parent / 'Models' / 'test_prediction.png', dpi=150, bbox_inches='tight')
                print(f"✅ Visualization saved: Models/test_prediction.png")
            except:
                pass
                
        else:
            print("📁 No test images found in uploads/")
            print("   Upload an image via the web interface first!")
    
    print("\n" + "="*60)
    print("✅ TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == "__main__":
    test_model()
