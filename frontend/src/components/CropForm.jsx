import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Droplets, Wind, Thermometer, Info, Compass, Sparkles } from 'lucide-react';

const CropForm = () => {
  const [formData, setFormData] = useState({
    N: '', P: '', K: '',
    moisture: '',
    soil_type: 'Clayey',
    city: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [plantSuccess, setPlantSuccess] = useState('');

  const handlePlant = async (cropName) => {
    const token = sessionStorage.getItem('token');
    try {
      await axios.post('http://127.0.0.1:5000/api/plant', {
        crop_name: cropName,
        city: formData.city
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlantSuccess(`Establishment phase for ${cropName} initiated.`);
      setTimeout(() => setPlantSuccess(''), 5000);
    } catch (err) {
      setError("Establishment failed. Re-evaluate.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const token = sessionStorage.getItem('token');

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/predict', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Connection lost. Seek balance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex flex-col gap-32 lg:flex-row items-start">
        {/* Input Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-5/12 space-y-24"
        >
          <div className="space-y-6">
            <span className="text-[11px] uppercase tracking-[0.6em] text-frost/70 block font-medium">Analysis Interface</span>
            <h2 className="text-7xl md:text-8xl font-serif text-white italic leading-tight">The Terroir Consultation.</h2>
            <p className="max-w-md text-ice-200/50 text-base font-light leading-relaxed tracking-widest uppercase mb-12">
              PROVIDE THE SOIL'S NARRATIVE TO REVEAL ITS HIGHEST POTENTIAL.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-20 pt-12 border-t border-white/5">
            <div className="grid grid-cols-2 gap-16">
              <div className="group relative">
                <label className="text-[11px] uppercase tracking-[0.5em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Provenance</label>
                <input
                  type="text"
                  name="city"
                  placeholder="LOCATION"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-white/10 py-5 text-ice-50 focus:outline-none focus:border-frost transition-all font-light text-lg placeholder:text-white/10"
                />
              </div>

              <div className="group relative">
                <label className="text-[11px] uppercase tracking-[0.5em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Texture</label>
                <select
                  name="soil_type"
                  value={formData.soil_type}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/10 py-5 text-ice-50 focus:outline-none focus:border-frost transition-all font-light text-lg appearance-none cursor-pointer"
                >
                  <option value="Clayey" className="bg-dark text-white">Clayey</option>
                  <option value="Sandy" className="bg-dark text-white">Sandy</option>
                  <option value="Loamy" className="bg-dark text-white">Loamy</option>
                  <option value="Black" className="bg-dark text-white">Black</option>
                  <option value="Red" className="bg-dark text-white">Red</option>
                </select>
                <div className="absolute right-0 bottom-6 pointer-events-none opacity-20">
                  <Compass size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-16 text-center py-16 border-y border-white/5">
              {['N', 'P', 'K'].map((nutrient) => (
                <div key={nutrient} className="space-y-6">
                  <span className="text-[12px] uppercase tracking-[0.5em] text-frost/70 block font-bold">{nutrient}</span>
                  <input
                    type="number"
                    name={nutrient}
                    value={formData[nutrient]}
                    onChange={handleChange}
                    required
                    className="w-full bg-transparent text-center text-6xl font-serif text-white focus:text-frost focus:outline-none border-b border-transparent focus:border-frost/40 transition-colors"
                  />
                  <span className="text-[10px] text-white/20 font-medium tracking-[0.3em] block">MG / KG</span>
                </div>
              ))}
            </div>

            <div className="group relative">
              <label className="text-[11px] uppercase tracking-[0.5em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Hydration Ratio (%)</label>
              <input
                type="number"
                name="moisture"
                value={formData.moisture}
                onChange={handleChange}
                required
                className="w-full bg-transparent border-b border-white/10 py-5 text-ice-50 focus:outline-none focus:border-frost transition-all font-light text-lg"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-10 border border-frost/30 text-frost uppercase text-[11px] tracking-[0.7em] hover:bg-frost hover:text-dark transition-all duration-1000 disabled:opacity-30 backdrop-blur-sm font-bold"
            >
              {loading ? "Decrypting Soil..." : "Consult the Terroir"}
            </motion.button>
          </form>
        </motion.div>

        {/* Results Column */}
        <div className="w-full lg:w-7/12 min-h-[600px] lg:pl-32 border-l border-white/5">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-20"
              >
                <Compass size={80} strokeWidth={0.5} className="animate-pulse" />
                <p className="text-[11px] uppercase tracking-[0.7em] px-12 font-light">Awaiting the narrative of the earth.</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-24"
              >
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-[1px] bg-frost/50" />
                    <span className="text-[11px] uppercase tracking-[0.5em] text-frost/80 font-medium">The Revelation</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] uppercase tracking-[0.4em] text-white/30 italic font-medium">Destined Variety</h3>
                    <p className="text-8xl md:text-9xl font-serif text-white italic tracking-tighter capitalize leading-none">
                      {result.recommended_crop}.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-16 pt-12">
                    <div className="space-y-3">
                      <span className="text-[11px] uppercase tracking-[0.4em] text-white/20 block font-light">Climate Vitality</span>
                      <div className="flex items-center gap-4 text-frost font-serif text-4xl italic">
                        <Thermometer size={24} strokeWidth={1} />
                        {result.weather_used.temp.toFixed(1)}°
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[11px] uppercase tracking-[0.4em] text-white/20 block font-light">Atmosphere</span>
                      <div className="flex items-center gap-4 text-frost font-serif text-4xl italic">
                        <Wind size={24} strokeWidth={1} />
                        {result.weather_used.humidity.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-10 pt-16 border-t border-white/5">
                  <span className="text-[11px] uppercase tracking-[0.4em] text-white/30 font-medium">Lesser Archetypes</span>
                  <div className="space-y-12">
                    {result.alternatives.map((item, index) => (
                      <div key={index} className="group space-y-6">
                        <div className="flex justify-between items-end">
                          <h4 className="font-serif text-3xl italic text-white/70 capitalize group-hover:text-white transition-colors duration-500">{item.crop}</h4>
                          <span className="text-[11px] font-light text-frost italic tracking-[0.2em]">{item.confidence}% Harmony Index</span>
                        </div>
                        <div className="h-[2px] w-full bg-white/5 relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.confidence}%` }}
                            transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="absolute inset-0 bg-frost/40"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-16">
                  <button
                    onClick={() => handlePlant(result.recommended_crop)}
                    className="group relative inline-flex items-center gap-6 text-[11px] uppercase tracking-[0.5em] text-frost hover:text-white transition-all duration-700"
                  >
                    <span className="font-bold">Establish {result.recommended_crop}</span>
                    <div className="w-16 h-[1px] bg-frost/30 group-hover:w-32 group-hover:bg-white transition-all duration-700" />
                  </button>
                  {plantSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] uppercase tracking-[0.3em] text-frost mt-8 italic animate-pulse font-medium"
                    >
                      — {plantSuccess}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CropForm;