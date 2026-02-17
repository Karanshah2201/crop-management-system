import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    TrendingUp,
    History,
    Calendar,
    MapPin,
    CheckCircle2,
    Loader2,
    Compass,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState({
        count: 0,
        most_recommended: 'N/A',
        avg_confidence: 0
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = sessionStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const [statsRes, historyRes] = await Promise.all([
                    axios.get('http://127.0.0.1:5000/api/stats', { headers }),
                    axios.get('http://127.0.0.1:5000/api/history', { headers })
                ]);

                setStats(statsRes.data);
                setHistory(historyRes.data);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin mb-6 text-frost/40" size={32} strokeWidth={1} />
                <p className="font-serif italic text-frost/60 tracking-widest uppercase text-xs">Decrypting Archive...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-24 space-y-40">
            {/* Header / Profile Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-end gap-16"
            >
                <div className="space-y-6">
                    <span className="text-[11px] uppercase tracking-[0.5em] text-frost/70 block font-medium">Territory Metrics</span>
                    <h2 className="text-7xl md:text-8xl font-serif text-white italic leading-tight">The Archive.</h2>
                    <p className="max-w-xl text-ice-200/50 font-light text-lg tracking-widest uppercase leading-relaxed">
                        HISTORICAL DATA ANALYSIS FOR <span className="text-frost">{userData.username?.toUpperCase()}</span>'S LANDHOLDINGS.
                    </p>
                </div>

                <div className="flex gap-12">
                    <div className="text-right space-y-3">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-white/30 block font-light">Active Since</span>
                        <p className="font-serif text-2xl italic text-ice-50">Jan 2026</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-32 py-32 border-y border-white/5">
                <StatMetric label="Consultations" value={stats.count} />
                <StatMetric label="Dominant Variety" value={stats.most_recommended} capitalize />
                <StatMetric label="Harmony Index" value={`${stats.avg_confidence}%`} />
            </div>

            {/* Soil Intelligence Charts */}
            <div className="space-y-16">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-[1px] bg-frost/30" />
                    <span className="text-[11px] uppercase tracking-[0.5em] text-frost/90 font-medium">Terroir Fluctuations</span>
                </div>

                <div className="h-[500px] w-full grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                    {history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[...history].reverse()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorFrost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#B9D9C3" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#B9D9C3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#ffffff15"
                                    fontSize={10}
                                    tickFormatter={(val) => val.split(' ')[0]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#ffffff30', letterSpacing: '0.1em' }}
                                />
                                <YAxis stroke="#ffffff15" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#ffffff30' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0a0c0b',
                                        borderRadius: '0px',
                                        border: '1px solid #ffffff10',
                                        fontSize: '11px',
                                        fontFamily: 'Inter',
                                        letterSpacing: '0.15em',
                                        padding: '12px'
                                    }}
                                />
                                <Area type="monotone" dataKey="nutrients.N" name="NITROGEN" stroke="#B9D9C3" strokeWidth={1.5} fillOpacity={1} fill="url(#colorFrost)" />
                                <Area type="monotone" dataKey="nutrients.P" name="PHOSPHORUS" stroke="#D4E6D9" strokeWidth={1.5} fillOpacity={1} fill="url(#colorFrost)" />
                                <Area type="monotone" dataKey="nutrients.K" name="POTASSIUM" stroke="#9BB7A1" strokeWidth={1.5} fillOpacity={1} fill="url(#colorFrost)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full border border-white/5 bg-white/[0.01] space-y-8">
                            <Compass size={64} strokeWidth={0.5} className="text-white/10" />
                            <p className="text-[11px] uppercase tracking-[0.6em] text-white/20 font-light">Data streams await cultivation.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis History */}
            <div className="space-y-16">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-[1px] bg-frost/30" />
                    <span className="text-[11px] uppercase tracking-[0.5em] text-frost/90 font-medium">The Narrative Logs</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left border-b border-white/5">
                                <th className="pb-10 text-[11px] uppercase tracking-[0.4em] text-white/30 font-light">Seed Variety</th>
                                <th className="pb-10 text-[11px] uppercase tracking-[0.4em] text-white/30 font-light">Provenance</th>
                                <th className="pb-10 text-[11px] uppercase tracking-[0.4em] text-white/30 font-light">Chronicle</th>
                                <th className="pb-10 text-[11px] uppercase tracking-[0.4em] text-white/30 font-light text-right">Confidence Index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {history.slice(0, 10).map((record) => (
                                <tr key={record.id} className="group hover:bg-white/[0.03] transition-colors">
                                    <td className="py-10 font-serif text-3xl italic text-white capitalize">{record.predicted_crop}</td>
                                    <td className="py-10 font-light text-base text-white/40">{record.city}</td>
                                    <td className="py-10 font-light text-[11px] text-white/20 tracking-widest uppercase">{record.date}</td>
                                    <td className="py-10 text-right font-serif text-2xl italic text-frost opacity-80">{record.confidence}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {history.length === 0 && (
                    <div className="text-center py-32">
                        <Link to="/predict" className="group relative px-12 py-5 overflow-hidden border border-frost/20 rounded-full transition-all duration-700">
                            <div className="absolute inset-0 bg-frost/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                            <span className="relative z-10 text-[11px] uppercase tracking-[0.5em] text-frost group-hover:text-white transition-colors">Begin First Consultation</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* Practical Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 pt-40 border-t border-white/5">
                <div className="space-y-10">
                    <span className="text-[11px] uppercase tracking-[0.5em] text-frost/50 block font-medium">Practical Lore</span>
                    <h3 className="text-5xl font-serif text-white italic">Wisdom of the Soil.</h3>
                    <p className="max-w-lg text-ice-200/50 text-base font-light leading-relaxed tracking-wide">
                        For root-bound varieties, ensure periodic aeration. The morning mist holds the most data—observe your terroir at dawn for the truest perspective.
                    </p>
                </div>

                <div className="bg-white/5 p-16 space-y-12 relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                        <Sparkles size={140} />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.6em] text-frost font-medium">Identity Status</span>
                    <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-[11px] font-light text-white/30 uppercase tracking-[0.3em]">Network Alignment</span>
                            <span className="text-[11px] text-frost uppercase tracking-[0.3em] animate-pulse font-medium">Synchronized</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/10 pb-4">
                            <span className="text-[11px] font-light text-white/30 uppercase tracking-[0.3em]">Credentials Tier</span>
                            <span className="text-[11px] text-white/60 uppercase tracking-[0.3em] font-serif italic">Administrator</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatMetric = ({ label, value, capitalize }) => (
    <div className="text-center space-y-6">
        <span className="text-[11px] uppercase tracking-[0.5em] text-ice-200/40 block font-light">{label}</span>
        <div className={`text-7xl font-serif text-white tracking-widest leading-none ${capitalize ? 'capitalize italic' : ''}`}>{value}</div>
    </div>
);

export default Dashboard;
