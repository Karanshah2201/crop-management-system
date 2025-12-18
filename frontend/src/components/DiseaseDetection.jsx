import React, { useState } from 'react';
import axios from 'axios';
import { Upload, CheckCircle, AlertTriangle, XCircle, Leaf } from 'lucide-react';

const DiseaseDetection = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedImage) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/detect-disease', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to analyze image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
                    <Leaf className="w-8 h-8 text-green-400" />
                    Plant Disease Detection
                </h2>
                <p className="text-slate-400">
                    Upload a clear photo of a plant leaf to detect potential diseases using AI.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* Upload Section */}
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-white/10 backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <label
                                htmlFor="image-upload"
                                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${preview ? 'border-green-500/50 bg-slate-900/50' : 'border-slate-600 hover:border-green-500 hover:bg-slate-800'}`}
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-full object-contain rounded-lg p-2" />
                                ) : (
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-12 h-12 text-slate-400 mb-3 group-hover:text-green-400 transition" />
                                        <p className="mb-2 text-sm text-slate-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF</p>
                                    </div>
                                )}
                                <input id="image-upload" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedImage || loading}
                            className="w-full py-4 text-white font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-1"
                        >
                            {loading ? 'Analyzing Leaf...' : 'Analyze Image'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-900/40 border border-red-500/20 text-red-200 rounded-lg flex items-center gap-2">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-800/30 rounded-2xl p-10 border border-white/5">
                            <div className="w-16 h-16 border-4 border-t-green-500 border-r-green-500/30 border-b-green-500/10 border-l-green-500/30 rounded-full animate-spin"></div>
                            <p className="mt-4 text-green-400 font-mono animate-pulse">Running AI Model...</p>
                        </div>
                    )}

                    {!loading && result && (
                        <div className={`rounded-2xl p-8 border backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-500 ${result.diagnosis === 'Healthy' ? 'bg-green-900/20 border-green-500/30' : 'bg-amber-900/20 border-amber-500/30'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-slate-400 uppercase tracking-widest text-sm font-semibold">Diagnosis Result</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.diagnosis === 'Healthy' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {result.confidence}% Confidence
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                {result.diagnosis === 'Healthy' ? (
                                    <CheckCircle className="w-16 h-16 text-green-400" />
                                ) : (
                                    <AlertTriangle className="w-16 h-16 text-amber-500" />
                                )}
                                <div>
                                    <p className="text-4xl font-bold text-white mb-1">{result.diagnosis}</p>
                                    <p className="text-slate-400 text-sm">Detected based on visual symptoms</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 rounded-xl p-5 border border-white/5">
                                <h4 className="text-slate-300 font-semibold mb-2">Recommended Action</h4>
                                <p className="text-slate-400 leading-relaxed text-sm">
                                    {result.treatment}
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading && !result && (
                        <div className="h-64 flex flex-col items-center justify-center bg-slate-800/10 rounded-2xl border border-white/5 border-dashed text-slate-500">
                            <Leaf className="w-12 h-12 mb-4 opacity-20" />
                            <p>Results will appear here</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default DiseaseDetection;
