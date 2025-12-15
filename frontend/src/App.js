import React from 'react';
import CropForm from './components/CropForm';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white selection:bg-green-500 selection:text-white">
      <div className="min-h-screen backdrop-blur-[2px] px-4 py-8 md:py-12">
        <header className="max-w-5xl mx-auto mb-12 text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
              Smart Farm
            </span> Management
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto">
            AI-Powered Precision Agriculture for better yields and sustainable farming.
          </p>
        </header>

        <main className="max-w-5xl mx-auto">
          <CropForm />
        </main>

        <footer className="mt-16 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} Smart Farm Systems. Powered by Machine Learning.
        </footer>
      </div>
    </div>
  );
}

export default App;