import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from './pages/Home';

function App() {
  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <header className="bg-gray-900 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-blue-400">Weather Dashboard</h1>
        </div>
      </header>
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <footer className="bg-gray-900 mt-12 py-6">
        <div className="container mx-auto px-4">
          <p className="text-gray-400 text-center">
            Weather Dashboard &copy; {new Date().getFullYear()} | Using OpenWeatherMap API
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;