import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Droplets, Zap, Globe, TrendingUp, Sprout } from 'lucide-react';

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const heroY = useSpring(useTransform(scrollYProgress, [0, 0.4], [0, -150]), {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="flex flex-col gap-40 pb-40">
            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                {/* Cinematic Background Image */}
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.8 }}
                    transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ y: heroY }}
                >
                    {/* Dark overlay with better transparency to let image through */}
                    <div className="absolute inset-0 bg-dark/40 z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark z-20" />

                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.9, 1, 0.9]
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-full h-full will-change-transform"
                        style={{
                            backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=2600")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center gap-12 relative z-30"
                >
                    <div className="overflow-hidden">
                        <motion.span
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="block text-[10px] uppercase tracking-[0.6em] text-frost/80 mb-8 font-medium"
                        >
                            Distilled by Intelligence
                        </motion.span>
                    </div>

                    <div className="relative">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, delay: 0.4 }}
                            className="text-8xl md:text-[10rem] font-serif italic text-white leading-[0.85] tracking-tighter"
                        >
                            Terroir <br />
                            <span className="not-italic opacity-40 block mt-4">Augmented.</span>
                        </motion.h1>
                    </div>

                    <p className="max-w-xl mx-auto text-ice-200/50 font-light text-lg md:text-xl tracking-wide leading-relaxed mt-4">
                        A modern dialogue between ancient soil and predictive algorithms.
                        Revealing the true potential of your land, one byte at a time.
                    </p>

                    <div className="flex items-center gap-12 mt-12">
                        <Link to="/register" className="group relative px-12 py-5 overflow-hidden border border-frost/20 rounded-full transition-all duration-700">
                            <div className="absolute inset-0 bg-frost/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                            <span className="relative z-10 text-[10px] uppercase tracking-[0.4em] text-frost group-hover:text-white transition-colors">Begin Exploration</span>
                        </Link>
                    </div>
                </motion.div>

                {/* Vertical Decorative Line */}
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 100 }}
                    transition={{ duration: 1.5, delay: 1 }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-t from-frost/40 to-transparent"
                />
            </section>

            {/* Philosophy Section */}
            <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-32 items-center py-24">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="space-y-10"
                >
                    <span className="text-[11px] uppercase tracking-[0.5em] text-frost/70 font-medium">Our Philosophy</span>
                    <h2 className="text-6xl md:text-7xl font-serif text-white italic leading-tight">
                        Nature doesn't <br />
                        guess. Neither <br />
                        should you.
                    </h2>
                    <p className="text-ice-200/50 font-light text-lg leading-loose max-w-lg tracking-wide">
                        We go back to basics, only real data. We analyze the landscape carved for thousands of years
                        and reveal its secrets through computational precision.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-20">
                    <FeatureItem
                        label="Provenance"
                        title="AI Analysis"
                        desc="Advanced ML models that respect the biological history of your soil."
                    />
                    <FeatureItem
                        label="Vitality"
                        title="Smart Hydration"
                        desc="Satellite telemetry ensuring perfect equilibrium for every sprout."
                    />
                </div>
            </section>

            {/* Visual Tribute */}
            <section className="w-full aspect-[21/9] relative overflow-hidden bg-white/5 border-y border-white/5 flex items-center justify-center group my-32">
                <div className="absolute inset-0 bg-gradient-to-b from-dark via-transparent to-dark z-10" />
                <motion.div
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-1000"
                    style={{
                        backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2600")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />
                <div className="relative z-20 text-center space-y-6">
                    <span className="text-[11px] uppercase tracking-[1.2em] text-white/40 block font-light">The Experience</span>
                    <h3 className="text-6xl md:text-8xl font-serif italic text-white leading-none">Cultivating Elegance</h3>
                </div>
            </section>

            {/* Stats */}
            <section className="max-w-7xl mx-auto px-6 w-full py-32">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-32 py-32 border-t border-white/5">
                    <StatItem label="Estates Secured" value="12k" />
                    <StatItem label="Average Purity" value="98%" />
                    <StatItem label="Water Preserved" value="3.2M" />
                </div>
            </section>

            {/* CTA */}
            <section className="pb-60 text-center space-y-16">
                <h2 className="text-7xl font-serif text-white italic">Join the Circle.</h2>
                <Link to="/register" className="inline-block px-16 py-6 border border-frost/30 text-frost uppercase text-[11px] tracking-[0.5em] hover:bg-frost hover:text-dark transition-all duration-700 font-medium rounded-full">
                    Get Invitation
                </Link>
            </section>
        </div>
    );
};

const FeatureItem = ({ label, title, desc }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-6 group cursor-default"
    >
        <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.4em] text-frost/50 font-medium">{label}</span>
            <div className="w-12 h-[1px] bg-white/10 group-hover:w-20 group-hover:bg-frost transition-all duration-700" />
        </div>
        <h4 className="text-3xl font-serif text-white/90 italic">{title}</h4>
        <p className="text-base font-light text-ice-200/40 leading-relaxed max-w-sm tracking-wide">
            {desc}
        </p>
    </motion.div>
);

const StatItem = ({ label, value }) => (
    <div className="text-center space-y-6">
        <span className="text-[11px] uppercase tracking-[0.5em] text-ice-200/30 block font-light">{label}</span>
        <div className="text-8xl font-serif text-white tracking-tighter leading-none">{value}</div>
    </div>
);

export default LandingPage;
