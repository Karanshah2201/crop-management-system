import React from 'react';
import CropForm from './components/CropForm';

function App() {
  return (
    <div className="App">
      <header style={{ backgroundColor: '#2c3e50', padding: '20px', color: 'white' }}>
        <h1 style={{ textAlign: 'center', margin: 0, fontSize: '24px' }}>
          🌾 Smart Farm Management System
        </h1>
      </header>

      <main style={{ minHeight: '100vh', backgroundColor: '#ecf0f1', padding: '20px' }}>
        <CropForm />
      </main>
    </div>
  );
}

export default App;