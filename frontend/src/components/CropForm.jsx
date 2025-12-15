import React, { useState } from 'react';
import axios from 'axios';

const CropForm = () => {
  // 1. State for Inputs
  const [formData, setFormData] = useState({
    N: '',
    P: '',
    K: '',
    moisture: '',
    soil_type: 'Clayey',
    city: '',
    farmSize: '',
    landUnit: 'acre'
  });

  // 2. State for Results
  const [result, setResult] = useState(null);
  const [fertilizerResult, setFertilizerResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calcLoading, setCalcLoading] = useState(false);
  const [error, setError] = useState('');

  // 5. Fetch History
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:5000/api/history');
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  // Load history on mount and after a new prediction
  React.useEffect(() => {
    fetchHistory();
  }, [result]);

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
    setFertilizerResult(null);

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

  // 4. Step B: Calculate Fertilizer
  const handleCalculateFertilizer = async () => {
    if (!formData.farmSize) {
      alert("Please enter your farm size first!");
      return;
    }

    setCalcLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/fertilizer', {
        crop: result.recommended_crop,
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
    <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl">
      <h2 className="text-2xl font-semibold mb-8 text-green-400 border-b border-white/10 pb-4">
        🌱 Parameters & Prediction
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-400 uppercase tracking-wider font-semibold">City Name</label>
            <input
              type="text"
              name="city"
              placeholder="e.g. Mumbai"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Soil Type</label>
            <select
              name="soil_type"
              value={formData.soil_type}
              onChange={handleChange}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition appearance-none"
            >
              <option value="Clayey">Clayey</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Black">Black</option>
              <option value="Red">Red</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {['N', 'P', 'K'].map((nutrient) => (
            <div key={nutrient} className="space-y-2">
              <label className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{nutrient} Value</label>
              <input
                type="number"
                name={nutrient}
                value={formData[nutrient]}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-400 uppercase tracking-wider font-semibold">Moisture</label>
          <input
            type="number"
            name="moisture"
            value={formData.moisture}
            onChange={handleChange}
            required
            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg transform transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing Soil & Weather...' : 'Predict Optimal Crop'}
        </button>
      </form>

      {/* --- RESULTS SECTION --- */}
      {result && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-8 mb-8 text-center backdrop-blur-sm">
            <h3 className="text-slate-300 text-lg mb-2">Recommended Crop</h3>
            <p className="text-5xl font-bold text-white drop-shadow-sm capitalize">{result.recommended_crop}</p>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-4 text-slate-200">Alternative Options</h4>
            <div className="space-y-4">
              {result.alternatives.map((item, index) => (
                <div key={index} className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-200 bg-green-900/50">
                        {item.crop}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-green-200">
                        {item.confidence}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-900/30">
                    <div style={{ width: `${item.confidence}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-green-500 to-emerald-400"></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/10 text-sm text-blue-200 flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span>Based on live weather in <strong>{formData.city}</strong>: {result.weather_used.temp}°C, {result.weather_used.humidity}% Humidity</span>
            </div>
          </div>

          {/* --- FERTILIZER SECTION --- */}
          <div className="bg-slate-800/40 rounded-2xl p-8 border border-white/5">
            <h4 className="text-xl font-semibold mb-6 flex items-center gap-2 text-yellow-100">
              🚜 Fertilizer Calculator
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Farm Size</label>
                <input
                  type="number"
                  name="farmSize"
                  placeholder="2.5"
                  value={formData.farmSize}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-400">Unit</label>
                <select
                  name="landUnit"
                  value={formData.landUnit}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="acre">Acres</option>
                  <option value="hectare">Hectares</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleCalculateFertilizer}
              disabled={calcLoading || !formData.farmSize}
              className="w-full bg-yellow-600/80 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {calcLoading ? 'Calculating...' : `Calculate Fertilizer for ${result.recommended_crop}`}
            </button>

            {fertilizerResult && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                {['urea', 'dap', 'mop'].map((key) => (
                  <div key={key} className="bg-slate-900/50 p-4 rounded-xl text-center border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold mb-1">{key}</p>
                    <p className="text-xl font-bold text-yellow-400">{fertilizerResult[key]} <span className="text-sm text-slate-500">kg</span></p>
                  </div>
                ))}
              </div>
            )}
            {fertilizerResult && (
              <p className="text-xs text-center mt-4 text-slate-500 mb-8">
                *Calculated for {fertilizerResult.size_in_hectares} Hectares
              </p>
            )}

            {/* --- SPRAYS SECTION --- */}
            {fertilizerResult && fertilizerResult.sprays && (
              <div className="bg-blue-900/20 rounded-xl p-6 border border-blue-500/20 mt-6">
                <h5 className="text-lg font-semibold text-blue-200 mb-4 flex items-center gap-2">
                  💧 Foliar Spray Schedule
                </h5>
                <div className="space-y-4">
                  {fertilizerResult.sprays.map((spray, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-white/5">
                      <div>
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">{spray.stage}</span>
                        <span className="text-white font-medium">{spray.name}</span>
                      </div>
                      <div className="mt-2 md:mt-0 text-right">
                        <span className="bg-blue-600/20 text-blue-200 text-xs px-2 py-1 rounded inline-block mb-1">
                          {spray.dosage}
                        </span>
                        <p className="text-xs text-slate-400 italic max-w-xs ml-auto">
                          {spray.purpose}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- HISTORY SECTION --- */}
      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-xl font-semibold mb-6 text-slate-300">📋 Recent Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.map((record) => (
              <div key={record.id} className="bg-slate-800/40 p-4 rounded-xl border border-white/5 hover:border-green-500/30 transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-green-400">{record.predicted_crop}</h4>
                  <span className="text-xs text-slate-500">{record.date}</span>
                </div>
                <p className="text-sm text-slate-400">
                  📍 {record.city}
                </p>
                <div className="mt-2 text-xs text-slate-500 flex gap-2">
                  <span className="bg-slate-900 px-2 py-1 rounded">Conf: {record.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-8 p-4 bg-red-900/50 border border-red-500/50 text-red-200 rounded-xl text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default CropForm;