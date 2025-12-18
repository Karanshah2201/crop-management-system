"""
Download PlantVillage dataset using Kaggle API
"""
import os
import sys
from pathlib import Path

# Add user site-packages to path
import site
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.insert(0, user_site)

try:
    from kaggle.api.kaggle_api_extended import KaggleApi
    
    print("🔐 Initializing Kaggle API...")
    api = KaggleApi()
    api.authenticate()
    
    print("📥 Downloading PlantVillage dataset (this may take 10-20 minutes, ~3GB)...")
    print("   Dataset: vipoooool/new-plant-diseases-dataset\n")
    
    # Download to current directory
    api.dataset_download_files(
        'vipoooool/new-plant-diseases-dataset',
        path='.',
        unzip=True
    )
    
    print("\n✅ Download complete!")
    print(f"📁 Files extracted to: {os.getcwd()}")
    
except Exception as e:
    print(f"\n❌ Error: {e}\n")
    print("=" * 60)
    print("KAGGLE API SETUP REQUIRED")
    print("=" * 60)
    print("\n To use Kaggle API, you need to:")
    print("\n1. Go to https://www.kaggle.com/settings")  
    print("2. Scroll down to 'API' section")
    print("3. Click 'Create New Token'")
    print("4. This downloads 'kaggle.json'")
    print("5. Place it at: C:\\Users\\Karan Shah\\.kaggle\\kaggle.json")
    print("\nAlternatively, download manually from:")
    print("https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset")
    print("\nThen extract to: Data/plant_diseases/")
