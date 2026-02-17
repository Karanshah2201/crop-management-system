import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';

const Login = ({ setAuth }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:5000/api/login', formData);
            const { token, user } = response.data;

            sessionStorage.setItem('token', token);
            sessionStorage.setItem('user', JSON.stringify(user));

            setAuth(user);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || "Credentials invalid. Seek alignment.");
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
                <span className="text-[11px] uppercase tracking-[0.5em] text-frost/70 block font-medium">Restricted Access</span>
                <h2 className="text-7xl md:text-8xl font-serif text-white italic leading-none">Welcome.</h2>
                <p className="text-ice-200/50 text-base font-light tracking-[0.3em] uppercase leading-relaxed mt-4">
                    RE-ESTABLISH YOUR SEED CONNECTION
                </p>
            </div>

            {message && (
                <div className="text-frost text-[11px] uppercase tracking-[0.4em] text-center mb-12 animate-pulse font-medium">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-16">
                <div className="space-y-12">
                    <div className="group relative">
                        <label className="text-[11px] uppercase tracking-[0.4em] text-ice-50/40 group-focus-within:text-frost transition-colors mb-4 block font-medium">Network Identifier</label>
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
                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Authenticate"}
                </button>
            </form>

            <div className="mt-32 text-center">
                <Link to="/register" className="text-[11px] uppercase tracking-[0.4em] text-white/30 hover:text-frost transition-colors duration-700">
                    No access? <span className="underline underline-offset-8 decoration-frost/20">Apply for Seed Establishment</span>
                </Link>
            </div>
        </motion.div>
    );
};

export default Login;
