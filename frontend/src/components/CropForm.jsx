import React, { useState } from 'react';
import axios from 'axios';
import './CropForm.css';

const CropForm = () => {
  // 1. State for Inputs
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    moisture: '',
    soil_type: 'Clayey',
    city: '',
    // New fields for Fertilizer
    farmSize: '',
    landUnit: 'acre' // default
  });

  // 2. State for Results
  const [result, setResult] = useState(null);
  const [fertilizerResult, setFertilizerResult] = useState(null); // Store calc results

  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Step A: Predict Crop
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setFertilizerResult(null); // Reset previous calc

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/predict', {
        N: formData.N,
        P: formData.P,
        K: formData.K,
        moisture: formData.moisture,
        soil_type: formData.soil_type,
        city: formData.city
      });
      setResult(response.data);
    } catch (err) {
      setError("Error connecting to server. Is the backend running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 4. Step B: Calculate Fertilizer (New Function)
  const handleCalculateFertilizer = async () => {
    if (!formData.farmSize) {
      alert("Please enter your farm size first!");
      return;
    }

    setCalcLoading(true);
    try {
      // We send the PREDICTED crop, plus user's soil data
      const response = await axios.post('http://127.0.0.1:5000/api/fertilizer', {
        crop: result.recommended_crop, // Use the winner
        N: formData.N,
        P: formData.P,
        K: formData.K,
        size: formData.farmSize,
        unit: formData.landUnit
      });
      setFertilizerResult(response.data);
    } catch (err) {
      console.error(err);
      alert("Could not calculate fertilizer. Check console.");
    } finally {
      setCalcLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>🌱 Crop & Fertilizer System</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>City (for Weather)</label>
          <input
            type="text"
            name="city"
            placeholder="e.g. Mumbai"
            value={formData.city}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row">
          <div className="input-group">
            <label>Nitrogen (N)</label>
            <input type="number" name="N" value={formData.N} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Phosphorus (P)</label>
            <input type="number" name="P" value={formData.P} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Potassium (K)</label>
            <input type="number" name="K" value={formData.K} onChange={handleChange} required />
          </div>
        </div>

        <div className="row">
          <div className="input-group">
            <label>Soil Moisture</label>
            <input type="number" name="moisture" value={formData.moisture} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Soil Type</label>
            <select name="soil_type" value={formData.soil_type} onChange={handleChange}>
              <option value="Clayey">Clayey</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Black">Black</option>
              <option value="Red">Red</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing Soil & Weather...' : 'Predict Best Crop'}
        </button>
      </form>

      {/* --- RESULTS SECTION --- */}
      {result && (
        <div className="result-card">
          <div className="winner-section">
            <h3>🏆 Best Crop: <span>{result.recommended_crop}</span></h3>
          </div>

          <div className="alternatives-section">
            <h4>🔄 Diversification Options (Alternatives)</h4>
            <ul className="alt-list">
              {result.alternatives.map((item, index) => (
                <li key={index} className={index === 0 ? "highlight-item" : ""}>
                  <span className="crop-name">{item.crop}</span>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${item.confidence}%` }}
                    ></div>
                  </div>
                  <span className="confidence-score">{item.confidence}%</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="weather-info">
            <small>
              📍 Analysis based on live weather in <strong>{formData.city}</strong>:<br />
              Temp: {result.weather_used.temp}°C | Humidity: {result.weather_used.humidity}%
            </small>
          </div>

          {/* --- NEW FERTILIZER SECTION --- */}
          <div className="fertilizer-section">
            <h4>🚜 Fertilizer Calculator</h4>
            <div className="row">
              <div className="input-group">
                <label>Farm Size</label>
                <input
                  type="number"
                  name="farmSize"
                  placeholder="e.g. 2.5"
                  value={formData.farmSize}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Unit</label>
                <select name="landUnit" value={formData.landUnit} onChange={handleChange}>
                  <option value="acre">Acres</option>
                  <option value="hectare">Hectares</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculateFertilizer}
              className="calc-btn"
              disabled={calcLoading || !formData.farmSize}
            >
              {calcLoading ? 'Calculating...' : `Calculate Fertilizer for ${result.recommended_crop}`}
            </button>

            {fertilizerResult && (
              <div className="fertilizer-result">
                <h5>You need to apply:</h5>
                <div className="fert-grid">
                  <div className="fert-item">
                    <span className="label">Urea</span>
                    <span className="value">{fertilizerResult.urea} kg</span>
                  </div>
                  <div className="fert-item">
                    <span className="label">DAP</span>
                    <span className="value">{fertilizerResult.dap} kg</span>
                  </div>
                  <div className="fert-item">
                    <span className="label">MOP</span>
                    <span className="value">{fertilizerResult.mop} kg</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.8em', marginTop: '10px', color: '#666' }}>
                  *Calculated for {fertilizerResult.size_in_hectares} Hectares of {result.recommended_crop}.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default CropForm;