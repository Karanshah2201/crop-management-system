# 🐍 Smart Farm Backend API

The core intelligence layer for the **Smart Farm Management System**. This Flask-based API handles machine learning inference, complex fertilizer calculations, weather data integration, and historical data persistence.

## ✨ Key Capabilities
*   **Predictive Engine**: Loads a pre-trained `scikit-learn` model to recommend optimal crops.
*   **Calculators**: Specialized logic to convert nutrient gaps into fertilizer bag requirements (Urea, DAP, MOP) for various land units (Acres, Hectares).
*   **External Integrations**: Fetches real-time environmental data via OpenWeatherMap API.
*   **Persistence**: Uses **SQLite** + **SQLAlchemy** to store prediction history.

## 🛠️ Technology Stack
*   **Framework**: Flask (Python)
*   **ML Libraries**: Scikit-Learn, Pandas, NumPy, Joblib
*   **Database**: SQLite (via Flask-SQLAlchemy)
*   **Tools**: Python-Dotenv (Environment mgmt), Flask-CORS

## 🚀 Getting Started

### 1. Prerequisites
*   Python 3.8+
*   Pip

### 2. Setup Environment
Create a `.env` file in this directory:
```env
WEATHER_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Server
```bash
python app.py
```
Server will start at `http://127.0.0.1:5000`.

## 📡 API Endpoints

### 1. Predict Crop
`POST /api/predict`
*   **Input**: JSON `{ N, P, K, temp, humidity, ph, rainfall, city }`
*   **Output**: Recommended crop, confidence scores, and weather data used.

### 2. Calculate Fertilizer
`POST /api/fertilizer`
*   **Input**: JSON `{ crop, N, P, K, size, unit }`
*   **Output**: Required kg of Urea, DAP, and MOP.

### 3. Get History
`GET /api/history`
*   **Output**: List of last 10 predictions.

## 📁 Folder Structure
*   `app.py`: Main entry point and route definitions.
*   `Models/`: Stores the serialized ML models (`.pkl`).
*   `Utils/`: Helper scripts for API calls and math calculations.
*   `Data/`: Reference data (e.g., crop rule definitions).
*   `instance/`: Contains the SQLite database file.

---

