import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sprout, LogIn, UserPlus, LogOut, User, LayoutDashboard, Loader2, Droplets, Menu, X } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

// Lazy loading components
const CropForm = lazy(() => import('./components/CropForm'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const IrrigationPlanner = lazy(() => import('./components/IrrigationPlanner'));
const LandingPage = lazy(() => import('./components/LandingPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-6"
    >
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-frost/20 rounded-full" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-t-2 border-frost rounded-full"
        />
      </div>
      <p className="font-serif text-lg tracking-widest text-frost/60 italic">Refreshing Terroir...</p>
    </motion.div>
  </div>
);

const Navigation = ({ auth, handleLogout }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Origins', private: false },
    { path: '/predict', label: 'Recommendation', private: true },
    { path: '/irrigation', label: 'Hydration', private: true },
    { path: '/dashboard', label: 'Archive', private: true },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${scrolled
      ? 'py-4 bg-dark/80 backdrop-blur-xl border-b border-white/5'
      : 'py-8 bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif tracking-widest text-ice-50 hover:text-frost transition-colors duration-500 uppercase">
          CropPulse
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => {
            if (item.private && !auth) return null;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[10px] uppercase tracking-[0.3em] font-light transition-all duration-500 hover:text-frost relative group ${isActive ? 'text-frost' : 'text-ice-50/40'
                  }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-[1px] bg-frost transition-all duration-500 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
              </Link>
            );
          })}

          {!auth ? (
            <div className="flex items-center gap-8 pl-8 border-l border-white/10">
              <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] text-ice-50/40 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="px-6 py-2 border border-frost/20 text-[10px] uppercase tracking-[0.3em] text-frost hover:bg-frost hover:text-dark transition-all duration-700">
                Join
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6 pl-8 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-[8px] uppercase tracking-[0.2em] text-white/20">Identified as</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-frost font-medium">{auth.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full border border-white/5 hover:border-red-400/20 hover:bg-red-400/5 text-ice-50/40 hover:text-red-400 transition-all duration-500"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-ice-50 p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 w-full h-screen bg-dark flex flex-col items-center justify-center gap-12 z-40 px-6"
          >
            <div className="absolute top-12 left-6 text-2xl font-serif tracking-widest text-ice-50 uppercase opacity-20">
              CropPulse
            </div>
            {navItems.map((item) => {
              if (item.private && !auth) return null;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="text-5xl font-serif italic text-ice-50 hover:text-frost transition-all duration-500"
                >
                  {item.label}
                </Link>
              );
            })}
            {!auth && (
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-4xl font-serif text-frost italic border-b border-frost/20 pb-4">Get Access</Link>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-12 text-[10px] uppercase tracking-[0.5em] text-white/20 hover:text-white transition-colors"
            >
              Close Archive
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const ProtectedRoute = ({ children, auth }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth && !sessionStorage.getItem('token')) {
      navigate('/login');
    }
  }, [auth, navigate]);

  return (auth || sessionStorage.getItem('token')) ? children : null;
};

const PublicRoute = ({ children, auth }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (auth || sessionStorage.getItem('token')) {
      navigate('/');
    }
  }, [auth, navigate]);

  return (!auth && !sessionStorage.getItem('token')) ? children : null;
};

const AmbientBackground = () => {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const y1 = useTransform(smoothProgress, [0, 1], [0, -200]);
  const y2 = useTransform(smoothProgress, [0, 1], [0, 200]);
  const rotateS = useTransform(smoothProgress, [0, 1], [0, 45]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0a0c0b]">
      {/* Primary Blob */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ y: y1, rotate: rotateS }}
        className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-frost/5 rounded-full blur-[160px] will-change-transform"
      />

      {/* Secondary Blob */}
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ y: y2 }}
        className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-moss/10 rounded-full blur-[140px] will-change-transform"
      />

      {/* Accent Blob */}
      <motion.div
        animate={{
          x: [-20, 20, -20],
          y: [-20, 20, -20],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-frost/5 rounded-full blur-[100px]"
      />

      {/* Grainy Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

function App() {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setAuth(null);
  }, []);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
    if (savedUser && token) {
      try {
        setAuth(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [handleLogout]);

  if (loading) return null;

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0c0b] text-ice-50 selection:bg-frost/20 overflow-x-hidden">
        <AmbientBackground />
        <Navigation auth={auth} handleLogout={handleLogout} />

        <main className="pt-32 min-h-screen">
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/predict" element={
                  <ProtectedRoute auth={auth}>
                    <CropForm />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute auth={auth}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/irrigation" element={
                  <ProtectedRoute auth={auth}>
                    <IrrigationPlanner />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={
                  <PublicRoute auth={auth}>
                    <Login setAuth={setAuth} />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute auth={auth}>
                    <Register />
                  </PublicRoute>
                } />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>

        <footer className="py-24 px-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="font-serif text-2xl tracking-widest uppercase opacity-40">CropPulse</div>
            <div className="flex gap-12 text-[10px] uppercase tracking-[0.3em] opacity-40">
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Philosophy</span>
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Terroir</span>
              <span className="hover:opacity-100 cursor-pointer transition-opacity">Sustainability</span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] opacity-30">
              © {new Date().getFullYear()} Intellectual Agriculture
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;