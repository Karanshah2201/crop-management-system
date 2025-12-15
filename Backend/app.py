from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import json
import os
from Utils.fertilizer_calc import calculate_fertilizer
from Utils.weather_api import get_weather

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# --- CONFIGURATION ---
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

if not WEATHER_API_KEY:
    print("WARNING: WEATHER_API_KEY not found in environment variables.")

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///farm_history.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- DATABASE MODEL ---
class PredictionHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    city = db.Column(db.String(100))
    nitrogen = db.Column(db.Integer)
    phosphorus = db.Column(db.Integer)
    potassium = db.Column(db.Integer)
    soil_type = db.Column(db.String(50))
    predicted_crop = db.Column(db.String(50))
    confidence = db.Column(db.Float)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d %H:%M'),
            'city': self.city,
            'predicted_crop': self.predicted_crop,
            'confidence': self.confidence
        }

# Initialize Database
with app.app_context():
    db.create_all()

# Load Model
model_data = joblib.load('models/crop_recommendation_model.pkl')
model = model_data['model']
model_columns = model_data['columns']

# Load Rules
with open('data/processed/crop_rules.json', 'r') as f:
    crop_rules = json.load(f)

# --- HELPER: NAME TRANSLATOR ---
def normalize_crop_name(predicted_name):
    """
    Translates AI Model names (from data_core.csv) 
    to Rule Book names (from cultivation_guide.csv)
    """
    # Keys must match crop_rules.json keys or be distinct enough for fuzzy search
    mapping = {
        "Paddy": "Rice",
        "Maize": "Maize",
        "Ground Nuts": "Groundnut",
        "Chickpea": "Chickpea",
        "Kidneybeans": "Kidney Beans",
        "Pigeonpeas": "Pigeon Peas",
        "Mothbeans": "Moth Beans",
        "Mungbean": "Mung Bean",
        "Blackgram": "Black Gram",
        "Lentil": "Lentil",
        "Jute": "Jute",
        "Coffee": "Coffee",
        "Cotton": "Cotton"
    }
    return mapping.get(predicted_name, predicted_name)

# --- ROUTE 1: PREDICT ---
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if not data:
             return jsonify({"error": "No input data provided"}), 400
        
        required_fields = ['N', 'P', 'K', 'soil_type']
        missing = [field for field in required_fields if field not in data]
        if missing:
             return jsonify({"error": f"Missing required fields: {missing}"}), 400
        
        # 1. Weather Logic
        city = data.get('city')
        weather = get_weather(city, WEATHER_API_KEY)
        
        if weather:
            current_temp = weather['temp']
            current_humidity = weather['humidity']
        else:
            current_temp = float(data.get('temp', 25))
            current_humidity = float(data.get('humidity', 50))

        # 2. Prepare Input
        input_df = pd.DataFrame(columns=model_columns)
        input_df.loc[0] = 0 
        input_df['Nitrogen'] = data.get('N')
        input_df['Phosphorous'] = data.get('P')
        input_df['Potassium'] = data.get('K')
        input_df['Temparature'] = current_temp
        input_df['Humidity'] = current_humidity
        input_df['Moisture'] = data.get('moisture')
        
        soil_col = f"Soil_{data.get('soil_type')}"
        if soil_col in input_df.columns:
            input_df[soil_col] = 1

        # 3. Predict & Get Alternatives
        probs = model.predict_proba(input_df)[0]
        classes = model.classes_
        top_3_indices = probs.argsort()[-3:][::-1]
        
        alternatives = []
        for index in top_3_indices:
            alternatives.append({
                "crop": classes[index],
                "confidence": round(probs[index] * 100, 1)
            })
            
        best_crop = alternatives[0]['crop']
        best_confidence = alternatives[0]['confidence']

        # 4. Save to Database
        try:
            new_entry = PredictionHistory(
                city=city if city else "Unknown",
                nitrogen=data.get('N'),
                phosphorus=data.get('P'),
                potassium=data.get('K'),
                soil_type=data.get('soil_type'),
                predicted_crop=best_crop,
                confidence=best_confidence
            )
            db.session.add(new_entry)
            db.session.commit()
        except Exception as db_err:
            print(f"Database Error: {db_err}")
            # Continue even if saving fails

        return jsonify({
            "recommended_crop": best_crop,
            "alternatives": alternatives,
            "weather_used": {
                "temp": current_temp,
                "humidity": current_humidity
            }
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 400

# --- ROUTE 2: FERTILIZER CALCULATOR ---
@app.route('/api/fertilizer', methods=['POST'])
def fertilizer():
    try:
        data = request.json
        raw_crop_name = data.get('crop')
        farm_size = float(data.get('size'))
        unit = data.get('unit')

        # 1. TRANSLATE THE NAME
        clean_name = normalize_crop_name(raw_crop_name)
        
        print(f"Calculating for raw: {raw_crop_name} -> clean: {clean_name}")

        # 2. Get Rules
        rules = crop_rules.get(clean_name)
        
        if not rules:
            # Fallback: Smart Fuzzy Search
            # Checks if 'Rice' is inside 'Rice (Chawal)'
            found_key = next((k for k in crop_rules.keys() if clean_name.lower() in k.lower()), None)
            
            if found_key:
                print(f"Fuzzy match found: {clean_name} -> {found_key}")
                rules = crop_rules[found_key]
            else:
                return jsonify({"error": f"Crop '{clean_name}' not found in database. Rules available for: {list(crop_rules.keys())[:5]}..."}), 404
            
        # 3. Calculate
        result = calculate_fertilizer(
            ideal_n=rules['ideal_nitrogen'],
            ideal_p=rules['ideal_phosphorus'],
            ideal_k=rules['ideal_potassium'],
            current_n=data.get('N'),
            current_p=data.get('P'),
            current_k=data.get('K'),
            farm_size=farm_size,
            unit=unit
        )
        
        return jsonify(result)

    except Exception as e:
        print(f"Fertilizer Error: {e}")
        return jsonify({"error": str(e)}), 500

# --- ROUTE 3: HISTORY ---
@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        # Get last 10 records, newest first
        history = PredictionHistory.query.order_by(PredictionHistory.date.desc()).limit(10).all()
        return jsonify([item.to_dict() for item in history])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)