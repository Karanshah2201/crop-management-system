# Plant Disease Detection Model - Training & Deployment Guide

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

This will install:
- TensorFlow 2.20.0 (Deep Learning framework)
- Pillow (Image processing)
- NumPy, Pandas (Data manipulation)
- Matplotlib, Seaborn (Visualization)
- OpenCV-Python (Image processing)

### Step 2: Download Dataset

The training script needs **real plant disease images**. You have 3 options:

**Option A: Kaggle API (Fastest - 5 mins)**

1. Install Kaggle CLI:
   ```bash
   pip install kaggle
   ```

2. Setup Kaggle credentials:
   - Visit https://www.kaggle.com/settings
   - Click **"Create New Token"** to download `kaggle.json`.
   - Place `kaggle.json` in `C:\Users\<YourName>\.kaggle\`.

3. Download and extract the dataset:
   ```bash
   kaggle datasets download -d vipoooool/new-plant-diseases-dataset
   # Use PowerShell to extract
   Expand-Archive new-plant-diseases-dataset.zip -DestinationPath Data/plant_diseases/
   ```

**Option B: Manual Download (10 mins)**

1. Visit: [New Plant Diseases Dataset on Kaggle](https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset)
2. Click **"Download"** and extract the zip to `Backend/Data/plant_diseases/`.
3. Ensure the folder structure matches:
   ```
   Backend/Data/plant_diseases/
   ├── train/
   │   ├── Tomato___Bacterial_spot/
   │   ├── Tomato___Early_blight/
   │   └── ... (38 classes total)
   └── valid/
       └── (same 38 classes)
   ```

**Option C: Smaller Demo Dataset**

If you want a faster test (~500MB instead of 3GB):
1. Download the [Tomato Leaf Dataset](https://www.kaggle.com/datasets/kaustubhb999/tomatoleaf).
2. Extract to `Data/plant_diseases/`. Note: This only contains 10 classes.

**Option D: Mock Mode (Instant)**

If you want to test the system WITHOUT training:
- The disease detection already works with a fallback mock.
- It returns realistic but simulated predictions.
- **To use:** Just run `python app.py` without training. The system will auto-fallback.

### Step 3: Train the Model

```bash
cd Backend
python train_disease_model.py
```

**What happens:**
- Loads MobileNetV2 pre-trained on ImageNet
- Trains custom top layers on plant disease data
- Uses data augmentation (rotation, flip, zoom)
- Saves best model based on validation accuracy
- Generates training plots

**Training Time:**
- **CPU**: 2-4 hours (25 epochs)
- **GPU**: 20-40 minutes
- **Google Colab** (Free GPU): 30-45 minutes

**Expected Performance:**
- Validation Accuracy: 85-95%
- Top-3 Accuracy: 95-98%

### Step 4: Verify Model

After training, check these files exist:
```
Backend/Models/
├── plant_disease_model.h5       (Trained model ~25MB)
├── class_names.json              (Disease class labels)
└── training_history.png          (Accuracy/Loss plots)
```

### Step 5: Test Integration

The model is automatically loaded when Flask starts.

1. Restart backend:
   ```bash
   python app.py
   ```

2. Check console for:
   ```
   📦 Loading model from Models/plant_disease_model.h5...
   ✅ Model loaded successfully!
   ✅ Loaded 38 disease classes
   ```

3. Upload an image via the frontend and verify real predictions!

---

## 📊 Model Architecture

```
Input Image (224x224x3)
        ↓
MobileNetV2 Base (Pre-trained)
        ↓
Global Average Pooling
        ↓
Dropout (0.3)
        ↓
Dense (128, ReLU)
        ↓
Dropout (0.2)
        ↓
Dense (num_classes, Softmax)
        ↓
Output Probabilities
```

**Parameters:**
- Total: ~3.5M
- Trainable: ~250K
- Model Size: ~25 MB

---

## 🔧 Advanced Configuration

### Custom Training Parameters

Edit `train_disease_model.py`:

```python
# Configuration
IMG_SIZE = 224          # Image resolution
BATCH_SIZE = 32         # Samples per batch
EPOCHS = 25             # Training iterations
LEARNING_RATE = 0.001   # Optimizer learning rate
```

### Using Google Colab (Free GPU)

1. Upload `train_disease_model.py` to Google Drive
2. Create new Colab notebook:
   ```python
   # Mount Google Drive
   from google.colab import drive
   drive.mount('/content/drive')
   
   # Navigate to project
   %cd /content/drive/MyDrive/crop-management-system/Backend
   
   # Install dependencies
   !pip install -q tensorflow pillow matplotlib seaborn
   
   # Run training
   !python train_disease_model.py
   ```

3. Download trained model and place in `Backend/Models/`

---

## 🧪 Testing & Evaluation

### Test Single Image

```python
from Utils.disease_predictor import DiseasePredictor

predictor = DiseasePredictor()
results = predictor.predict('path/to/leaf.jpg', top_k=3)

for result in results:
    print(f"{result['disease']}: {result['confidence']}%")
    print(f"Treatment: {result['treatment']}\n")
```

### Model Info

```python
info = predictor.get_model_info()
print(f"Classes: {info['num_classes']}")
print(f"Model: {info['model_path']}")
```

---

## 📈 Performance Optimization

### If Accuracy is Low (<80%)

1. **More Data**: Add more images per class (aim for 500+)
2. **Data Quality**: Remove blurry/unclear images
3. **More Epochs**: Increase to 30-50 epochs
4. **Fine-Tuning**: Unfreeze last layers of MobileNetV2:
   ```python
   base_model.trainable = True
   for layer in base_model.layers[:-30]:
       layer.trainable = False
   ```

### If Training is Too Slow

1. **Reduce Image Size**: Use 128x128 instead of 224x224
2. **Reduce Batch Size**: Use 16 instead of 32
3. **Use Colab GPU**: Free and 10-20x faster

### If Model File is Too Large

1. **Quantization**: Reduce model size by 4x:
   ```python
   converter = tf.lite.TFLiteConverter.from_keras_model(model)
   converter.optimizations = [tf.lite.Optimize.DEFAULT]
   tflite_model = converter.convert()
   ```

---

## 🐛 Troubleshooting

### "Model not found" Error

✅ Solution: Train the model first using `python train_disease_model.py`

### "Out of Memory" during training

✅ Solutions:
- Reduce `BATCH_SIZE` to 16 or 8
- Reduce `IMG_SIZE` to 128
- Close other applications
- Use Google Colab

### "No module named 'tensorflow'"

✅ Solution:
```bash
pip install tensorflow==2.18.0
```

### Poor predictions on real farm images

✅ Solutions:
- Retrain with real-world data (not just lab images)
- Add more diverse angles and lighting
- Use data augmentation aggressively

---

## 📚 Dataset Information

### PlantVillage Dataset

- **Size**: 54,000+ images
- **Classes**: 38 (14 crops, multiple diseases per crop)
- **Resolution**: 256x256 pixels
- **Format**: JPG
- **License**: Public Domain

### Supported Crops & Diseases

**Tomato** (10 classes):
- Bacterial spot
- Early blight
- Late blight
- Leaf mold
- Septoria leaf spot
- Spider mites
- Target spot
- Mosaic virus
- Yellow leaf curl virus
- Healthy

**Potato** (3 classes):
- Early blight
- Late blight
- Healthy

**Corn** (4 classes):
- Cercospora gray leaf spot
- Common rust
- Northern leaf blight
- Healthy

...and more

---

## 🚀 Production Deployment

### For Real-World Use

1. **Collect Local Data**: Retrain with images from your region
2. **Version Control**: Track model versions with metadata
3. **A/B Testing**: Compare predictions with expert diagnoses
4. **Monitoring**: Log predictions and confidence scores
5. **Feedback Loop**: Allow farmers to correct predictions
6. **Model Updates**: Retrain quarterly with new data

### Security Considerations

- Validate uploaded files (size, type)
- Scan for malware
- Rate limit API calls
- Use HTTPS for production

---

## 📝 Next Steps

1. ✅ Train initial model
2. ✅ Integrate into Flask backend
3. [ ] Collect feedback from real users
4. [ ] Expand to more crops (onion, wheat, etc.)
5. [ ] Add severity detection (mild/severe)
6. [ ] Implement treatment recommendations API
7. [ ] Create mobile app for offline use

---

## 📞 Support

For issues or questions:
- Check training logs in console
- Review `training_history.png` for convergence
- Ensure dataset structure matches expected format
- Verify TensorFlow version compatibility

**Model Performance Benchmarks:**
- Minimum acceptable accuracy: 80%
- Production target: 90%+
- Expert human accuracy: 85-95% (baseline)
