import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Loader2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://127.0.0.1:5000/api/register', {
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            navigate('/login', { state: { message: 'Seed identity established. Please authenticate.' } });
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto py-32 px-6"
        >
            <div className="text-center mb-24 space-y-6">
                <span className="text-[11px] uppercase tracking-[0.5em] text-frost/70 block font-medium">New Establishment</span>
                <h2 className="text-7xl md:text-8xl font-serif text-white italic leading-none">Begin.</h2>
                <p className="text-ice-200/50 text-base font-light tracking-[0.3em] uppercase leading-relaxed mt-4">
                    INITIATE YOUR TERROIR JOURNEY
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-16">
                <div className="space-y-12">
                    <div className="group relative">
                        <label className="text-[11px] uppercase tracking-[0.4em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Identity Name</label>
                        <input
                            type="text"
                            name="username"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/10 py-5 text-ice-50 focus:outline-none focus:border-frost transition-all font-light text-lg tracking-wide"
                        />
                    </div>

                    <div className="group relative">
                        <label className="text-[11px] uppercase tracking-[0.4em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Network Identifier (Email)</label>
                        <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/10 py-5 text-ice-50 focus:outline-none focus:border-frost transition-all font-light text-lg tracking-wide"
                        />
                    </div>

                    <div className="group relative">
                        <label className="text-[11px] uppercase tracking-[0.4em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Encryption Key</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/10 py-5 text-ice-50 focus:outline-none focus:border-frost transition-all font-light text-lg tracking-wide"
                        />
                    </div>

                    <div className="group relative">
                        <label className="text-[11px] uppercase tracking-[0.4em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Confirm Encryption</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-transparent border-b border-white/10 py-5 text-ice-50 focus:outline-none focus:border-frost transition-all font-light text-lg tracking-wide"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-red-400/60 text-[11px] uppercase tracking-[0.3em] text-center font-medium">
                        — {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-8 border border-frost/30 text-frost uppercase text-[11px] tracking-[0.6em] hover:bg-frost hover:text-dark transition-all duration-1000 disabled:opacity-30 flex items-center justify-center font-bold"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Establish Identity"}
                </button>
            </form>

            <div className="mt-32 text-center">
                <Link to="/login" className="text-[11px] uppercase tracking-[0.4em] text-white/30 hover:text-frost transition-colors duration-700">
                    Already established? <span className="underline underline-offset-8 decoration-frost/20">Authenticate Identity</span>
                </Link>
            </div>
        </motion.div>
    );
};

export default Register;
