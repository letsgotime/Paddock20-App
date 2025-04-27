import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import GarageVaultPage from './pages/GarageVaultPage';
import ManifestationStation from './pages/ManifestationStation';
import ModPlanner from './pages/ModPlanner';
import Concierge from './pages/Concierge';
import RedlineReport from './pages/RedlineReport';
import HustlePlanner from './pages/HustlePlanner';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-black text-white font-openSans">
        <Sidebar />
        <div className="flex flex-col flex-grow">
          <Navbar />
          <main className="flex-grow p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/garage-vault" element={<GarageVaultPage />} />
              <Route path="/manifestation-station" element={<ManifestationStation />} />
              <Route path="/mod-planner" element={<ModPlanner />} />
              <Route path="/concierge" element={<Concierge />} />
              <Route path="/redline-report" element={<RedlineReport />} />
              <Route path="/hustle-planner" element={<HustlePlanner />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;