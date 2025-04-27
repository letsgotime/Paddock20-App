import React, { useState, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function GarageVaultPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decodedData, setDecodedData] = useState({});
  const [decoding, setDecoding] = useState(false);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase
          .from('Vehicles')
          .select('*');
        if (error) throw error;
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error.message);
      }
      setLoading(false);
    }
    fetchVehicles();
  }, []);
  
  // Function to handle VIN decoding
  const handleVinDecode = async (vin) => {
    setDecoding(true);
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/${vin}?format=json`);
      const result = await response.json();
      const usefulData = result.Results.filter(item => item.Value && item.Variable !== "Error Code");
      
      setDecodedData(prev => ({
        ...prev,
        [vin]: usefulData
      }));
      
      // Announce to screen readers
      const announcer = document.getElementById('announcer');
      if (announcer) {
        const makeModel = usefulData.find(item => item.Variable === "Make")?.Value + ' ' + 
                         usefulData.find(item => item.Variable === "Model")?.Value;
        announcer.textContent = `VIN has been successfully decoded for ${makeModel || 'your vehicle'}`;
      }
    } catch (error) {
      console.error('Error decoding VIN:', error.message);
      // Announce error to screen readers
      const announcer = document.getElementById('announcer');
      if (announcer) {
        announcer.textContent = `Error decoding VIN. Please try again later.`;
      }
    } finally {
      setDecoding(false);
    }
  };
  
  // Function to export garage data to PDF
  const exportToPDF = async () => {
    // Notify user the export is starting
    const announcer = document.getElementById('announcer');
    if (announcer) {
      announcer.textContent = "Preparing PDF export. This may take a moment...";
    }
    
    try {
      const input = document.getElementById('garageVaultSection');
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // ✅ Load your logo
      const logoUrl = '/assets/Logos/GoTime-White.png'; // Default logo path
      
      // Get page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Add title to PDF
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(127, 200, 68); // Green color
      pdf.text('GoTime Motorsports - GarageVault', pdfWidth / 2, 20, {align: 'center'});
      
      // Add generation date
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150); // Gray color
      const dateStr = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${dateStr}`, pdfWidth / 2, 30, {align: 'center'});
      
      // Now add the main garage vault content
      const imgProps = pdf.getImageProperties(imgData);
      const vaultImgWidth = pdfWidth - 20;
      const vaultImgHeight = (imgProps.height * vaultImgWidth) / imgProps.width;
      
      // Add the image below the text
      pdf.addImage(imgData, 'PNG', 10, 40, vaultImgWidth, vaultImgHeight);
      
      // Add footer
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('© GoTime Motorsports - ApexVault™ - Confidential Vehicle Information', pdfWidth / 2, 285, {align: 'center'});
      
      // Save the PDF
      pdf.save('GarageVault.pdf');
      
      // Notify user the export is complete
      if (announcer) {
        announcer.textContent = "PDF export completed successfully.";
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error.message);
      // Notify user of the error
      if (announcer) {
        announcer.textContent = "Error creating PDF. Please try again later.";
      }
    }
  };

  return (
    <div className="p-10 bg-black min-h-screen" aria-labelledby="garageVaultHeading">
      <div className="flex justify-between items-center mb-8">
        <h2 id="garageVaultHeading" className="apex-header-green">
          Garage Vault | Vehicles & Builds
        </h2>
        
        <button 
          onClick={exportToPDF}
          className="apex-button flex items-center"
          aria-label="Export Garage Vault to PDF"
        >
          <span className="mr-2">📄</span> Export to PDF
        </button>
      </div>
      
      {/* Screen reader announcer */}
      <div id="announcer" className="sr-only" aria-live="polite"></div>

      {loading ? (
        <p className="text-gray-400 text-center" role="status" aria-live="polite">
          Loading your garage...
        </p>
      ) : (
        <div id="garageVaultSection" className="grid grid-cols-1 md:grid-cols-2 gap-8" role="region" aria-label="List of vehicles in your garage">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="apex-card p-6" role="group" aria-labelledby={`vehicle-${index}-heading`}>
              <h3 id={`vehicle-${index}-heading`} className="text-blue-400 font-orbitron text-lg mb-2">
                {vehicle.car_name}
              </h3>
              <p className="text-white mb-1">
                VIN: {vehicle.vin || "N/A"}
                {vehicle.vin && (
                  <button
                    onClick={() => handleVinDecode(vehicle.vin)}
                    className="apex-button ml-3 text-sm py-1"
                    aria-label={`Decode VIN for ${vehicle.car_name}`}
                    disabled={decoding}
                  >
                    {decoding ? 'Decoding...' : 'Decode VIN'}
                  </button>
                )}
              </p>
              
              {/* VIN Decoded Information */}
              {decodedData[vehicle.vin] && (
                <div className="mt-4 text-sm text-white bg-black p-4 rounded-lg" aria-label="Decoded VIN Information">
                  <h4 className="text-blue-400 font-orbitron mb-2">VIN Decoded Details:</h4>
                  {decodedData[vehicle.vin].slice(0, 8).map((field, index) => (
                    <div key={index} className="mb-1">
                      <strong>{field.Variable}:</strong> {field.Value}
                    </div>
                  ))}
                  {decodedData[vehicle.vin].length > 8 && (
                    <p className="text-blue-400 text-xs mt-2">More available, expand feature coming Phase 7!</p>
                  )}
                </div>
              )}
              
              <p className="text-white mb-1">Tire Pressure (F): {vehicle.tire_pressure_front} psi</p>
              <p className="text-white mb-1">Tire Pressure (R): {vehicle.tire_pressure_rear} psi</p>
              <p className="text-white mb-1">Torque Spec: {vehicle.torque_spec} lb-ft</p>
              <p className="text-white mb-1">Mileage: {vehicle.mileage} miles</p>
              <p className="text-gray-400 mt-4">Service History: {vehicle.service_history}</p>
              <p className="text-gray-400">Insurance Docs: {vehicle.insurance_docs}</p>
              <p className="text-gray-400">Ownership Docs: {vehicle.ownership_docs}</p>

              {/* View/Add Mods Link */}
              <div className="mt-6">
                <Link
                  to={`/vehicle-mods/${vehicle.id}`}
                  className="apex-button w-full"
                  aria-label={`View and Add Modifications for ${vehicle.car_name}`}
                >
                  View / Add Mods
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GarageVaultPage;