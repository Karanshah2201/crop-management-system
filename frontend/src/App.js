import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sprout, ScanEye } from 'lucide-react';
import CropForm from './components/CropForm';
import Dashboard from './components/Dashboard';
import DiseaseDetection from './components/DiseaseDetection';

// Navigation Component
const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Crop Recommend', icon: Sprout },
    { path: '/dashboard', label: 'Analytics', icon: LayoutDashboard },
    { path: '/disease', label: 'Disease Detect', icon: ScanEye },
  ];

  return (
    <nav className="flex justify-center mb-12">
      <div className="bg-slate-800/50 backdrop-blur-md p-1.5 rounded-full border border-white/10 flex gap-2 shadow-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${isActive
                  ? 'bg-green-600 text-white shadow-lg shadow-green-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <Icon size={18} />
              <span className={`font-medium ${isActive ? 'block' : 'hidden md:block'}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white selection:bg-green-500 selection:text-white overflow-x-hidden">
        {/* Background Decorative Elements */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="min-h-screen backdrop-blur-[1px] px-4 py-8 md:py-12">
          <header className="max-w-6xl mx-auto mb-8 text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                Smart Farm
              </span> Management
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
              AI-Powered Precision Agriculture for better yields and sustainable farming.
            </p>
          </header>

          <Navigation />

          <main className="max-w-6xl mx-auto min-h-[60vh]">
            <Routes>
              <Route path="/" element={<CropForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/disease" element={<DiseaseDetection />} />
            </Routes>
          </main>

          <footer className="mt-20 text-center text-slate-500 text-sm border-t border-white/5 pt-8">
            <p>© {new Date().getFullYear()} Smart Farm Systems. Powered by Machine Learning.</p>
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;