import pandas as pd 
import json
import re
import os

# Define paths relative to this script
current_dir = os.path.dirname(os.path.abspath(__file__))
raw_file_path = os.path.join(current_dir, '..', 'Data', 'Raw', 'complete_crop_cultivation_guide (1).csv')
output_file_path = os.path.join(current_dir, '..', 'Data', 'Processed', 'crop_rules.json')

def extract_npk(text):
    if not isinstance(text, str):
        return {"N": 0, "P": 0, "K": 0}
    
    n_match = re.search(r'N\s*:\s*(\d+)', text, re.IGNORECASE)
    p_match = re.search(r'P2[O0]5\s*:\s*(\d+)', text, re.IGNORECASE)
    k_match = re.search(r'K2[O0]\s*:\s*(\d+)', text, re.IGNORECASE)

    return {
        "N": int(n_match.group(1)) if n_match else 0,
        "P": int(p_match.group(1)) if p_match else 0,
        "K": int(k_match.group(1)) if k_match else 0
    }

def clean_data():
    try:
        if not os.path.exists(raw_file_path):
             print(f"Error: Could not find file at {raw_file_path}")
             return

        df = pd.read_csv(raw_file_path)
        print("Raw CSV Loaded Successfully")
    except Exception as e:
        print(f"Error loading CSV: {e}")
        return

    crop_rules = {}
    for index, row in df.iterrows():
        crop_name = row['Crop_Name'].strip()
        npk_values = extract_npk(row['Fertilizer_Application'])
        
        # Add other useful info for the frontend
        crop_rules[crop_name] = {
            "ideal_nitrogen": npk_values['N'],
            "ideal_phosphorus": npk_values['P'],
            "ideal_potassium": npk_values['K'],
            "duration": row['Growing_Duration'],
            "tips": row['Cultivation_Guide']
        }

    # Save to JSON
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
    
    with open(output_file_path, 'w') as f:
        json.dump(crop_rules, f, indent=4)
    
    print(f"Success! Cleaned data saved to: {output_file_path}")
    
    if crop_rules:
        print("Example Entry:")
        # Print the first item to verify
        first_key = list(crop_rules.keys())[0]
        print(f"{first_key}: {crop_rules[first_key]}")
    else:
        print("Warning: No crop rules extracted.")

if __name__ == "__main__":
    clean_data()