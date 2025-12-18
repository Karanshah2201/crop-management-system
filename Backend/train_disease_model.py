"""
Plant Disease Detection Model Training Script
Uses Transfer Learning with MobileNetV2 on PlantVillage Dataset

This script will:
1. Download and prepare the dataset
2. Build a CNN model using transfer learning
3. Train the model
4. Save the trained model for deployment
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import matplotlib.pyplot as plt
from pathlib import Path

# Configuration
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 25
LEARNING_RATE = 0.001

# Paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'Data' / 'plant_diseases'
MODEL_DIR = BASE_DIR / 'Models'
MODEL_PATH = MODEL_DIR / 'plant_disease_model.h5'

# Create directories
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

def download_dataset():
    """
    Download PlantVillage dataset subset (Tomato diseases)
    For full dataset, use Kaggle API or manual download
    """
    print("📥 Checking for dataset...")
    
    # Check if data already exists
    if (DATA_DIR / 'train').exists() and len(list((DATA_DIR / 'train').iterdir())) > 0:
        print("✅ Dataset already exists!")
        return
    
    print("⚠️  Dataset not found!")
    print("\n" + "="*60)
    print("MANUAL DATASET SETUP REQUIRED")
    print("="*60)
    print("\nPlease download the PlantVillage dataset:")
    print("1. Visit: https://www.kaggle.com/datasets/emmarex/plantdisease")
    print("2. Download 'PlantVillage' dataset")
    print("3. Extract to: " + str(DATA_DIR))
    print("\nExpected structure:")
    print(f"  {DATA_DIR}/")
    print("    ├── train/")
    print("    │   ├── Tomato___Bacterial_spot/")
    print("    │   ├── Tomato___Early_blight/")
    print("    │   ├── Tomato___Late_blight/")
    print("    │   ├── Tomato___healthy/")
    print("    │   └── ...")
    print("    └── valid/")
    print("        └── (same structure)")
    print("\n" + "="*60)
    
    # Alternative: Auto-create sample structure
    choice = input("\nWould you like to create a DEMO structure with sample data? (y/n): ")
    if choice.lower() == 'y':
        create_demo_dataset()
    else:
        print("\n⏸️  Paused. Please set up the dataset and run again.")
        exit(0)

def create_demo_dataset():
    """Create a minimal demo dataset structure for testing"""
    print("🎨 Creating demo dataset structure...")
    
    classes = [
        'Tomato___Bacterial_spot',
        'Tomato___Early_blight', 
        'Tomato___Late_blight',
        'Tomato___Leaf_Mold',
        'Tomato___Septoria_leaf_spot',
        'Tomato___healthy'
    ]
    
    for split in ['train', 'valid']:
        for class_name in classes:
            class_dir = DATA_DIR / split / class_name
            class_dir.mkdir(parents=True, exist_ok=True)
            
            # Create a placeholder
            placeholder = class_dir / 'README.txt'
            placeholder.write_text(f"Place {class_name} images here for {split} set.")
    
    print("✅ Demo structure created!")
    print(f"📁 Location: {DATA_DIR}")
    print("\n⚠️  Add real images to train the model properly!")
    print("   Minimum: 50-100 images per class")

def create_data_generators():
    """Create augmented data generators"""
    print("🔄 Creating data generators...")
    
    # Training data with augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # Validation data (only rescaling)
    valid_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        DATA_DIR / 'train',
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    valid_generator = valid_datagen.flow_from_directory(
        DATA_DIR / 'valid',
        target_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    return train_generator, valid_generator

def build_model(num_classes):
    """Build transfer learning model with MobileNetV2"""
    print(f"🏗️  Building model for {num_classes} classes...")
    
    # Load pre-trained MobileNetV2
    base_model = MobileNetV2(
        input_shape=(IMG_SIZE, IMG_SIZE, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze base model
    base_model.trainable = False
    
    # Build custom top layers
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    # Compile
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', keras.metrics.TopKCategoricalAccuracy(k=3, name='top_3_accuracy')]
    )
    
    print("✅ Model built successfully!")
    model.summary()
    
    return model

def plot_history(history):
    """Plot training history"""
    print("📊 Generating training plots...")
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    
    # Accuracy
    ax1.plot(history.history['accuracy'], label='Train Accuracy')
    ax1.plot(history.history['val_accuracy'], label='Val Accuracy')
    ax1.set_title('Model Accuracy')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True)
    
    # Loss
    ax2.plot(history.history['loss'], label='Train Loss')
    ax2.plot(history.history['val_loss'], label='Val Loss')
    ax2.set_title('Model Loss')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig(MODEL_DIR / 'training_history.png', dpi=150, bbox_inches='tight')
    print(f"✅ Plot saved: {MODEL_DIR / 'training_history.png'}")

def train_model():
    """Main training function"""
    print("\n" + "="*60)
    print("🌱 PLANT DISEASE DETECTION MODEL TRAINING")
    print("="*60 + "\n")
    
    # Step 1: Download/check dataset
    download_dataset()
    
    # Step 2: Create data generators
    train_gen, valid_gen = create_data_generators()
    
    num_classes = len(train_gen.class_indices)
    class_names = list(train_gen.class_indices.keys())
    
    print(f"\n📋 Training Configuration:")
    print(f"   Classes: {num_classes}")
    print(f"   Class Names: {', '.join(class_names[:3])}...")
    print(f"   Training Samples: {train_gen.samples}")
    print(f"   Validation Samples: {valid_gen.samples}")
    print(f"   Batch Size: {BATCH_SIZE}")
    print(f"   Epochs: {EPOCHS}\n")
    
    # Step 3: Build model
    model = build_model(num_classes)
    
    # Step 4: Setup callbacks
    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        ModelCheckpoint(
            str(MODEL_PATH),
            monitor='val_accuracy',
            save_best_only=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        )
    ]
    
    # Step 5: Train
    print("\n🚀 Starting training...\n")
    
    history = model.fit(
        train_gen,
        validation_data=valid_gen,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    # Step 6: Save class names
    import json
    class_map_path = MODEL_DIR / 'class_names.json'
    with open(class_map_path, 'w') as f:
        json.dump(class_names, f, indent=2)
    
    print(f"\n✅ Class names saved: {class_map_path}")
    
    # Step 7: Plot results
    plot_history(history)
    
    # Step 8: Final evaluation
    print("\n📊 Final Evaluation:")
    results = model.evaluate(valid_gen)
    print(f"   Validation Loss: {results[0]:.4f}")
    print(f"   Validation Accuracy: {results[1]:.4f}")
    print(f"   Top-3 Accuracy: {results[2]:.4f}")
    
    print("\n" + "="*60)
    print("✅ TRAINING COMPLETE!")
    print("="*60)
    print(f"\n📦 Model saved to: {MODEL_PATH}")
    print(f"📦 Class names saved to: {class_map_path}")
    print(f"📊 Training plot saved to: {MODEL_DIR / 'training_history.png'}")
    print("\n🔗 Next Step: Integrate this model into app.py")

if __name__ == "__main__":
    # Set random seeds for reproducibility
    np.random.seed(42)
    tf.random.set_seed(42)
    
    # Run training
    train_model()
