import os
import json
import jwt
from functools import wraps
from datetime import datetime, timedelta
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from Utils.weather_api import get_weather

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- CONFIGURATION ---
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "your-super-secret-key")

# Database Configuration
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASS = os.getenv("DB_PASS", "1234")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "Cropmanagment")

# URI for PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql+psycopg2://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# Model Global Cache (Lazy Loading)
_MODEL_CACHE = {
    'model': None,
    'columns': None
}

# --- DATABASE MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    predictions = db.relationship('PredictionHistory', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class PredictionHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    city = db.Column(db.String(100))
    nitrogen = db.Column(db.Integer)
    phosphorus = db.Column(db.Integer)
    potassium = db.Column(db.Integer)
    moisture = db.Column(db.Float)
    soil_type = db.Column(db.String(50))
    predicted_crop = db.Column(db.String(50))
    confidence = db.Column(db.Float)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.strftime('%Y-%m-%d %H:%M'),
            'city': self.city,
            'predicted_crop': self.predicted_crop,
            'confidence': self.confidence,
            'moisture': self.moisture,
            'nutrients': {'N': self.nitrogen, 'P': self.phosphorus, 'K': self.potassium}
        }

class PlantedCrop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    crop_name = db.Column(db.String(50), nullable=False)
    planting_date = db.Column(db.DateTime, default=datetime.utcnow)
    harvest_date = db.Column(db.DateTime)
    irrigation_frequency_days = db.Column(db.Integer, default=3)
    city = db.Column(db.String(100), default="Mumbai")
    category = db.Column(db.String(50), default="General")
    status = db.Column(db.String(20), default='growing')
    tasks = db.relationship('IrrigationTask', backref='planted_crop', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'crop_name': self.crop_name,
            'city': self.city,
            'category': self.category,
            'planting_date': self.planting_date.strftime('%Y-%m-%d'),
            'harvest_date': self.harvest_date.strftime('%Y-%m-%d') if self.harvest_date else None,
            'frequency': self.irrigation_frequency_days,
            'status': self.status
        }

class IrrigationTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    planted_crop_id = db.Column(db.Integer, db.ForeignKey('planted_crop.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    due_date = db.Column(db.DateTime, nullable=False)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'crop_name': self.planted_crop.crop_name,
            'due_date': self.due_date.strftime('%Y-%m-%d'),
            'completed': self.completed,
            'completed_at': self.completed_at.strftime('%Y-%m-%d %H:%M') if self.completed_at else None
        }

# Initialize Database
with app.app_context():
    db.create_all()

# --- HELPER: LAZY MODEL LOADER ---
def load_ml_model():
    if _MODEL_CACHE['model'] is None:
        print("🚀 [System] Loading AI Model (96MB)... This happens only once.")
        try:
            model_data = joblib.load('Models/crop_recommendation_model.pkl')
            _MODEL_CACHE['model'] = model_data['model']
            _MODEL_CACHE['columns'] = model_data['columns']
            print("✅ [System] Model loaded successfully.")
        except Exception as e:
            print(f"❌ [System] Error loading model: {e}")
            raise e
    return _MODEL_CACHE['model'], _MODEL_CACHE['columns']

# --- PEST & DISEASE KNOWLEDGE BASE ---
def assess_pest_risk(crop, temp, hum):
    risk = {"level": "Low", "msg": "No immediate threats detected."}
    crop = crop.lower()
    
    if 'rice' in crop:
        if hum > 85 and 25 <= temp <= 32:
            risk = {"level": "High", "msg": "Potential Blast Disease risk due to extreme humidity."}
    elif 'maize' in crop:
        if temp > 32 and hum > 70:
            risk = {"level": "Moderate", "msg": "Watch for Stem Borer activity in warm weather."}
    elif 'wheat' in crop:
        if 15 <= temp <= 25 and hum > 80:
            risk = {"level": "Moderate", "msg": "Check for Leaf Rust development in damp conditions."}
    elif 'cotton' in crop:
        if temp > 30 and hum > 60:
            risk = {"level": "Moderate", "msg": "Potential Pink Bollworm threat in heat."}
    elif 'grapes' in crop or 'mango' in crop:
        if hum > 75:
            risk = {"level": "Moderate", "msg": "Downy Mildew risk: Avoid leaf moisture."}
    elif 'ground nut' in crop or 'peanut' in crop:
        if hum > 80 and temp < 25:
            risk = {"level": "Moderate", "msg": "Risk of Tikka Leaf Spot in cool, damp weather."}
    elif 'lentil' in crop or 'chickpea' in crop:
        if hum > 70:
            risk = {"level": "Moderate", "msg": "Monitor for Root Rot in overly moist soil."}
            
    return risk

# --- AUTH DECORATOR ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
        
        try:
            if "Bearer " in token:
                token = token.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except Exception as e:
            return jsonify({'error': 'Token is invalid!', 'msg': str(e)}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

# --- ROUTES ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing required fields"}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
    
    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Missing credentials"}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            "token": token,
            "user": { "username": user.username, "email": user.email }
        }), 200
    
    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/history', methods=['GET'])
@token_required
def get_user_history(current_user):
    history = PredictionHistory.query.filter_by(user_id=current_user.id).order_by(PredictionHistory.date.desc()).all()
    return jsonify([h.to_dict() for h in history])

@app.route('/api/stats', methods=['GET'])
@token_required
def get_user_stats(current_user):
    user_predictions = PredictionHistory.query.filter_by(user_id=current_user.id).all()
    count = len(user_predictions)
    
    if count == 0:
        return jsonify({"count": 0, "most_recommended": "N/A", "avg_confidence": 0})
    
    crop_counts = {}
    total_conf = 0
    for p in user_predictions:
        crop_counts[p.predicted_crop] = crop_counts.get(p.predicted_crop, 0) + 1
        total_conf += p.confidence
    
    most_recommended = max(crop_counts, key=crop_counts.get)
    return jsonify({
        "count": count,
        "most_recommended": most_recommended,
        "avg_confidence": round(total_conf / count, 1)
    })

@app.route('/api/predict', methods=['POST'])
@token_required
def predict(current_user):
    try:
        data = request.json
        if not data:
             return jsonify({"error": "No input data provided"}), 400
        
        # Lazy load model only when needed
        model, model_columns = load_ml_model()

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

        # 3. Predict
        probs = model.predict_proba(input_df)[0]
        classes = model.classes_
        top_3_indices = probs.argsort()[-3:][::-1]
        
        alternatives = []
        for index in top_3_indices:
            alternatives.append({
                "crop": classes[index],
                "confidence": float(round(probs[index] * 100, 1))
            })
            
        best_crop = alternatives[0]['crop']
        best_confidence = alternatives[0]['confidence']

        # 4. Save to History
        new_history = PredictionHistory(
            user_id=current_user.id,
            city=city,
            nitrogen=data['N'],
            phosphorus=data['P'],
            potassium=data['K'],
            moisture=data['moisture'],
            soil_type=data['soil_type'],
            predicted_crop=best_crop,
            confidence=best_confidence
        )
        db.session.add(new_history)
        db.session.commit()

        return jsonify({
            "recommended_crop": best_crop,
            "alternatives": alternatives,
            "weather_used": { "temp": current_temp, "humidity": current_humidity }
        })

    except Exception as e:
        print(f"Prediction Error: {e}")
        return jsonify({"error": str(e)}), 400

# --- IRRIGATION & PLANTING ROUTES ---

@app.route('/api/plant', methods=['POST'])
@token_required
def plant_crop(current_user):
    try:
        data = request.json
        crop_name = data.get('crop_name')
        city = data.get('city', 'Mumbai')
        custom_date = data.get('planting_date')
        
        # Enhanced Crop Metadata
        crop_metadata = {
            'rice': {'duration': 120, 'freq': 2, 'cat': 'Cereals'},
            'maize': {'duration': 100, 'freq': 4, 'cat': 'Cereals'},
            'wheat': {'duration': 130, 'freq': 7, 'cat': 'Cereals'},
            'cotton': {'duration': 180, 'freq': 10, 'cat': 'Fiber'},
            'jute': {'duration': 120, 'freq': 5, 'cat': 'Fiber'},
            'coffee': {'duration': 365, 'freq': 14, 'cat': 'Beverage'},
            'banana': {'duration': 300, 'freq': 3, 'cat': 'Fruits'},
            'mango': {'duration': 180, 'freq': 12, 'cat': 'Fruits'},
            'grapes': {'duration': 150, 'freq': 4, 'cat': 'Fruits'},
            'watermelon': {'duration': 90, 'freq': 2, 'cat': 'Fruits'},
            'lentil': {'duration': 110, 'freq': 8, 'cat': 'Pulses'},
            'chickpea': {'duration': 120, 'freq': 10, 'cat': 'Pulses'},
        }
        
        info = crop_metadata.get(crop_name.lower(), {'duration': 90, 'freq': 3, 'cat': 'General'})
        
        planting_date = datetime.strptime(custom_date, '%Y-%m-%d') if custom_date else datetime.utcnow()
        harvest_date = planting_date + timedelta(days=info['duration'])
        
        new_plant = PlantedCrop(
            user_id=current_user.id,
            crop_name=crop_name,
            city=city,
            category=info['cat'],
            planting_date=planting_date,
            harvest_date=harvest_date,
            irrigation_frequency_days=info['freq']
        )
        db.session.add(new_plant)
        db.session.commit()
        
        # Generate Irrigation Tasks
        current_task_date = planting_date + timedelta(days=info['freq'])
        while current_task_date < harvest_date:
            task = IrrigationTask(
                planted_crop_id=new_plant.id,
                user_id=current_user.id,
                due_date=current_task_date
            )
            db.session.add(task)
            current_task_date += timedelta(days=info['freq'])
        
        db.session.commit()
        return jsonify({"message": f"Successfully planted {crop_name} in {city}!", "crop": new_plant.to_dict()}), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user):
    # Get uncompleted tasks
    tasks = IrrigationTask.query.filter_by(user_id=current_user.id).all()
    
    # Simple Smart Adjustment based on current weather
    # In a real app, we'd cache this or run it as a background worker
    adjusted_tasks = []
    
    # Keep track of cities we've already checked weather for in this request
    weather_cache = {}

    for t in tasks:
        if not t.planted_crop:
            continue
            
        task_dict = t.to_dict()
        city = t.planted_crop.city
        
        if city not in weather_cache:
            weather = get_weather(city, WEATHER_API_KEY)
            weather_cache[city] = weather
            
        weather = weather_cache[city]
        
        # Logic: If it's raining or very humid, suggest a delay
        if weather:
            desc = weather.get('description', '').lower()
            humidity = weather.get('humidity', 0)
            
            if 'rain' in desc or humidity > 85:
                task_dict['weather_alert'] = f"Suggested Skip: {desc.capitalize()} detected in {city}"
                task_dict['priority'] = 'low'
            elif weather.get('temp', 0) > 35:
                task_dict['weather_alert'] = "High Heat: Increase water volume"
                task_dict['priority'] = 'high'
            else:
                task_dict['priority'] = 'normal'
            
            # Integrated Pest Warning
            pest_info = assess_pest_risk(t.planted_crop.crop_name, weather.get('temp', 0), humidity)
            task_dict['pest_risk'] = pest_info
        
        adjusted_tasks.append(task_dict)

    # Sort by date
    adjusted_tasks.sort(key=lambda x: x['due_date'])
    return jsonify(adjusted_tasks)

@app.route('/api/tasks/<int:task_id>/complete', methods=['POST'])
@token_required
def complete_task(current_user, task_id):
    task = IrrigationTask.query.filter_by(id=task_id, user_id=current_user.id).first()
    if not task:
        return jsonify({"error": "Task not found"}), 404
        
    task.completed = True
    task.completed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Task marked as complete", "task": task.to_dict()})

@app.route('/api/my-crops', methods=['GET'])
@token_required
def get_my_crops(current_user):
    crops = PlantedCrop.query.filter_by(user_id=current_user.id).all()
    return jsonify([c.to_dict() for c in crops])

@app.route('/api/my-crops/<int:crop_id>', methods=['DELETE'])
@token_required
def delete_crop(current_user, crop_id):
    crop = PlantedCrop.query.filter_by(id=crop_id, user_id=current_user.id).first()
    if not crop:
        return jsonify({"error": "Crop not found"}), 404
        
    db.session.delete(crop)
    db.session.commit()
    return jsonify({"message": "Crop and its schedule removed successfully"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
