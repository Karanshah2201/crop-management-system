import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader } from 'lucide-react';

const Dashboard = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Colors for Pie Chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/history');
            // Limit to last 50 for analytics if needed, or backend already limits
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to load history for dashboard");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center text-white p-10"><Loader className="animate-spin inline mr-2" /> Loading Dashboard...</div>;

    // 1. Process Data for Crop Distribution (Pie Chart)
    const cropCount = {};
    history.forEach(item => {
        cropCount[item.predicted_crop] = (cropCount[item.predicted_crop] || 0) + 1;
    });
    const pieData = Object.keys(cropCount).map(key => ({
        name: key,
        value: cropCount[key]
    }));

    // 2. Process Data for Recent Confidence Levels (Bar Chart)
    // Take last 10
    const barData = history.slice(0, 10).map(item => ({
        name: item.predicted_crop,
        confidence: item.confidence,
        date: item.date
    })).reverse(); // Show oldest to newest left to right

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                📊 Analytics Dashboard
            </h2>

            {history.length === 0 ? (
                <div className="text-center text-slate-400 py-10 bg-slate-800/50 rounded-xl">
                    No data available yet. Make some predictions!
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Card 1: Crop Distribution */}
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <h3 className="text-xl font-semibold text-slate-200 mb-6">Crop Recommendations Distribution</h3>
                        <div className="h-64 md:h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Card 2: Confidence Trend */}
                    <div className="bg-slate-800/40 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <h3 className="text-xl font-semibold text-slate-200 mb-6">Recent Prediction Confidence</h3>
                        <div className="h-64 md:h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tick={{ fill: '#94a3b8' }} />
                                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Bar dataKey="confidence" fill="#34d399" radius={[4, 4, 0, 0]} name="Confidence %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Card 3: Summary Stats */}
                    <div className="lg:col-span-2 bg-gradient-to-r from-green-900/40 to-emerald-900/40 p-6 rounded-2xl border border-green-500/20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div>
                                <p className="text-slate-400 text-sm uppercase tracking-wider">Total Predictions</p>
                                <p className="text-4xl font-bold text-white mt-2">{history.length}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm uppercase tracking-wider">Most Recommended</p>
                                <p className="text-4xl font-bold text-green-400 mt-2">
                                    {pieData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm uppercase tracking-wider">Avg Confidence</p>
                                <p className="text-4xl font-bold text-blue-400 mt-2">
                                    {(history.reduce((acc, curr) => acc + curr.confidence, 0) / history.length).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default Dashboard;
