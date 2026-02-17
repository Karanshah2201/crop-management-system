import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    Droplets,
    Clock,
    AlertCircle,
    ChevronRight,
    Bell,
    CheckCircle,
    MapPin,
    Trash2,
    Compass,
    Sparkles,
    X,
    Loader2
} from 'lucide-react';

const IrrigationPlanner = () => {
    const [tasks, setTasks] = useState([]);
    const [myCrops, setMyCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifPermission, setNotifPermission] = useState(Notification.permission);
    const [showForm, setShowForm] = useState(false);
    const [newCrop, setNewCrop] = useState({
        crop_name: '',
        city: '',
        planting_date: new Date().toISOString().split('T')[0]
    });
    const [selectedCrop, setSelectedCrop] = useState(null);

    const fetchData = useCallback(async () => {
        const token = sessionStorage.getItem('token');
        setLoading(true);

        try {
            const cropsRes = await axios.get('http://127.0.0.1:5000/api/my-crops', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyCrops(cropsRes.data);
        } catch (err) {
            console.error("Error fetching crops", err);
        }

        try {
            const tasksRes = await axios.get('http://127.0.0.1:5000/api/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(tasksRes.data);
            checkForUpcomingTasks(tasksRes.data);
        } catch (err) {
            console.error("Error fetching tasks", err);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(setNotifPermission);
        }
    }, [fetchData]);

    const checkForUpcomingTasks = (taskList) => {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = taskList.filter(t => !t.completed && t.due_date === today);

        if (todayTasks.length > 0 && Notification.permission === 'granted') {
            new Notification("Hydration Protocol", {
                body: `Attention required for ${todayTasks.length} terroir elements.`,
                icon: "/favicon.ico"
            });
        }
    };

    const handleComplete = async (taskId) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(`http://127.0.0.1:5000/api/tasks/${taskId}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error("Error completing task", err);
        }
    };

    const handlePlant = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post('http://127.0.0.1:5000/api/plant', newCrop, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowForm(false);
            setNewCrop({ crop_name: '', city: '', planting_date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (err) {
            console.error("Error planting crop", err);
        }
    };

    const handleDeleteCrop = async (cropId) => {
        if (!window.confirm("Are you sure you want to remove this crop and its schedule?")) return;
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:5000/api/my-crops/${cropId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedCrop(null);
            fetchData();
        } catch (err) {
            console.error("Error deleting crop", err);
        }
    };

    const calculateProgress = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const today = new Date();
        const total = endDate - startDate;
        const current = today - startDate;
        return Math.min(Math.max(Math.round((current / total) * 100), 0), 100);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin mb-6 text-frost/40" size={32} strokeWidth={1} />
                <p className="font-serif italic text-frost/60 tracking-widest uppercase text-xs">Synchronizing Hydration Matrix...</p>
            </div>
        );
    }

    const todayTasks = tasks.filter(t => !t.completed && new Date(t.due_date) <= new Date());
    const futureTasks = tasks.filter(t => !t.completed && new Date(t.due_date) > new Date());
    const completedTasks = tasks.filter(t => t.completed).slice(0, 5);

    return (
        <div className="max-w-7xl mx-auto px-6 py-20 space-y-32">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-end justify-between gap-12"
            >
                <div className="space-y-6">
                    <span className="text-[11px] uppercase tracking-[0.5em] text-frost/70 block font-medium">Atmospheric Management</span>
                    <h2 className="text-7xl md:text-8xl font-serif text-white italic leading-tight">Hydration Protocol.</h2>
                    <p className="max-w-xl text-ice-200/50 font-light text-lg tracking-widest uppercase leading-relaxed">
                        DYNAMIC WATERING SCHEDULES SYNCHRONIZED WITH THE PULSE OF YOUR LAND.
                    </p>
                </div>

                <div className="flex gap-10">
                    {notifPermission !== 'granted' && (
                        <button
                            onClick={() => Notification.requestPermission().then(setNotifPermission)}
                            className="text-[11px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors flex items-center gap-4"
                        >
                            <Bell size={16} strokeWidth={1} />
                            Enable Signal
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="py-6 px-12 border border-frost/20 text-frost uppercase text-[11px] tracking-[0.5em] hover:bg-frost hover:text-dark transition-all duration-700 font-medium"
                    >
                        Initiate Establishment
                    </button>
                </div>
            </motion.div>

            {/* Manual Planting Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-16 border-t border-white/5">
                            <form onSubmit={handlePlant} className="grid grid-cols-1 md:grid-cols-4 gap-16">
                                <FormInput label="VARIETY" name="crop_name" value={newCrop.crop_name} onChange={(val) => setNewCrop({ ...newCrop, crop_name: val })} />
                                <FormInput label="PROVENANCE" name="city" value={newCrop.city} onChange={(val) => setNewCrop({ ...newCrop, city: val })} />
                                <FormInput label="DATE" type="date" name="planting_date" value={newCrop.planting_date} onChange={(val) => setNewCrop({ ...newCrop, planting_date: val })} />
                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        className="w-full py-5 border border-frost/40 text-ice-50 uppercase text-[11px] tracking-[0.4em] hover:bg-frost hover:text-dark transition-all font-medium"
                                    >
                                        Establish Element
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-32">
                {/* To-Do List Column */}
                <div className="lg:col-span-8 space-y-32">
                    <div className="space-y-16">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-[1px] bg-frost/30" />
                            <span className="text-[11px] uppercase tracking-[0.5em] text-frost/90 font-medium">Immediate Interventions</span>
                        </div>

                        {todayTasks.length === 0 && futureTasks.length === 0 ? (
                            <div className="text-center py-32 border border-white/5 bg-white/[0.01] space-y-8">
                                <Compass size={64} strokeWidth={0.5} className="text-white/10 mx-auto" />
                                <p className="text-[11px] uppercase tracking-[0.6em] text-white/20">The terroir is in perfect equilibrium.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {todayTasks.map(task => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="group p-10 border border-frost/20 bg-frost/[0.03] flex items-center justify-between hover:border-frost/40 transition-all duration-500"
                                    >
                                        <div className="space-y-3">
                                            <h4 className="font-serif text-4xl italic text-white capitalize">{task.crop_name}</h4>
                                            <div className="flex items-center gap-6">
                                                <span className="text-[11px] uppercase tracking-[0.3em] text-frost animate-pulse font-medium">Critical Hydration</span>
                                                {task.weather_alert && (
                                                    <span className="text-[11px] uppercase tracking-[0.3em] text-red-400 italic font-light opacity-80">
                                                        — {task.weather_alert}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleComplete(task.id)}
                                            className="px-12 py-5 bg-frost text-dark text-[11px] uppercase tracking-[0.5em] hover:bg-white transition-all font-bold"
                                        >
                                            Hydrate
                                        </button>
                                    </motion.div>
                                ))}

                                {futureTasks.slice(0, 5).map(task => (
                                    <div key={task.id} className="p-10 border border-white/5 flex items-center justify-between opacity-50 hover:opacity-100 transition-all duration-700 bg-white/[0.02]">
                                        <div className="space-y-2">
                                            <h4 className="font-serif text-3xl italic text-white/80 capitalize">{task.crop_name}</h4>
                                            <span className="text-[11px] uppercase tracking-[0.3em] text-white/30 font-light">Scheduled: {task.due_date}</span>
                                        </div>
                                        <Clock size={20} strokeWidth={1} className="text-white/20" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recently Completed */}
                    {completedTasks.length > 0 && (
                        <div className="space-y-12 opacity-30 group hover:opacity-100 transition-opacity duration-1000">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-[1px] bg-white/20" />
                                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Log of Preservation</span>
                            </div>
                            <div className="space-y-4">
                                {completedTasks.map(task => (
                                    <div key={task.id} className="flex justify-between items-end border-b border-white/5 pb-4">
                                        <span className="font-serif text-lg italic text-white/60 capitalize">{task.crop_name} hydrated</span>
                                        <span className="text-[10px] font-light text-white/20 tracking-widest">{task.completed_at}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Column / My Crops */}
                <div className="lg:col-span-4 space-y-24">
                    <div className="space-y-12">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-[1px] bg-frost" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-frost">The Living Wardrobe</span>
                        </div>

                        {myCrops.length === 0 ? (
                            <p className="text-[10px] uppercase tracking-[0.5em] text-white/10 px-4">No elements established.</p>
                        ) : (
                            <div className="space-y-16">
                                {myCrops.map(crop => (
                                    <div key={crop.id} className="group space-y-6">
                                        <div className="space-y-1">
                                            <h4 className="font-serif text-2xl italic text-white capitalize group-hover:text-frost transition-colors">{crop.crop_name}</h4>
                                            <p className="text-[10px] text-white/20 tracking-[0.2em] font-light uppercase">{crop.city} // {crop.category || "Variety"}</p>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[9px] text-white/20 uppercase tracking-widest">Growth Arc</span>
                                                <span className="text-lg font-serif italic text-frost">{calculateProgress(crop.planting_date, crop.harvest_date)}%</span>
                                            </div>
                                            <div className="h-[1px] w-full bg-white/5 relative">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${calculateProgress(crop.planting_date, crop.harvest_date)}%` }}
                                                    className="absolute inset-y-0 left-0 bg-frost/30"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedCrop(crop)}
                                            className="text-[9px] uppercase tracking-[0.3em] text-white/40 hover:text-frost transition-colors flex items-center gap-2"
                                        >
                                            Details <ChevronRight size={12} strokeWidth={1} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pro Tip - Lore style */}
                    <div className="space-y-8 pt-12 border-t border-white/5">
                        <div className="flex items-center gap-3 text-frost/60">
                            <Sparkles size={16} strokeWidth={1} />
                            <span className="text-[10px] uppercase tracking-[0.4em]">Atmospheric Wisdom</span>
                        </div>
                        <p className="text-[11px] font-light leading-relaxed text-white/30 italic">
                            Your hydration cycle is dynamic—informed by the whispers of the wind and the temperature of the dawn. The system adjusts for Heatwaves and Humidity in real-time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Crop Details Modal */}
            <AnimatePresence>
                {selectedCrop && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/95 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-dark border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative"
                        >
                            <button
                                onClick={() => setSelectedCrop(null)}
                                className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors"
                            >
                                <X size={24} strokeWidth={1} />
                            </button>

                            <div className="p-16 overflow-y-auto space-y-16">
                                <div className="space-y-4">
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-frost/50 block">Detailed Dossier</span>
                                    <h3 className="text-6xl font-serif text-white italic capitalize">{selectedCrop.crop_name}.</h3>
                                    <p className="text-ice-200/40 text-sm font-light tracking-widest uppercase">
                                        Established in {selectedCrop.city} on {selectedCrop.planting_date}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-24 pt-12 border-t border-white/5">
                                    <div className="space-y-8">
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Protocol Details</span>
                                        <div className="space-y-6">
                                            <ModalMetric label="Hydration Frequency" value={`${selectedCrop.frequency} Days`} />
                                            <ModalMetric label="Category" value={selectedCrop.category || "General"} />
                                            <ModalMetric label="Status" value={selectedCrop.status} color="text-frost" />
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">Preservation Logs</span>
                                        <div className="space-y-4">
                                            {tasks.filter(t => t.crop_name === selectedCrop.crop_name).slice(0, 5).map((task, idx) => (
                                                <div key={task.id} className="flex justify-between items-center text-[10px] tracking-widest uppercase py-3 border-b border-white/5">
                                                    <span className={task.completed ? 'text-white/20' : 'text-ice-50'}>{task.due_date}</span>
                                                    <span className={task.completed ? 'text-frost/40 italic' : 'text-ice-50/10'}>{task.completed ? 'Synchronized' : 'Pending'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-12 flex justify-end">
                                    <button
                                        onClick={() => handleDeleteCrop(selectedCrop.id)}
                                        className="text-[10px] uppercase tracking-[0.4em] text-red-400/40 hover:text-red-400 transition-colors flex items-center gap-3"
                                    >
                                        <Trash2 size={14} strokeWidth={1} />
                                        Dissolve Establishment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FormInput = ({ label, name, type = "text", value, onChange }) => (
    <div className="group relative space-y-4">
        <label className="text-[10px] uppercase tracking-[0.3em] text-ice-50/20 group-focus-within:text-frost transition-colors">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-b border-white/10 py-3 text-ice-50 focus:outline-none focus:border-frost transition-all font-light"
        />
    </div>
);

const ModalMetric = ({ label, value, color = "text-ice-50" }) => (
    <div className="space-y-1">
        <span className="text-[8px] uppercase tracking-[0.2em] text-white/20 block">{label}</span>
        <p className={`font-serif text-2xl italic ${color}`}>{value}</p>
    </div>
);

export default IrrigationPlanner;
