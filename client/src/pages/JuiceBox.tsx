import React, { useState, useEffect, useRef } from 'react';
import { exportToPdf, exportToCsv, printElement } from '../utils/exportUtils';
import JuiceBoxProductList from '../components/JuiceBoxProductList';
import MyJuiceBox from '../components/MyJuiceBox';
import AddCustomJuiceProduct from '../components/AddCustomJuiceProduct';
import CategoryProducts from '../components/CategoryProducts';
import SevenDayReset from '../components/SevenDayReset';
import DetailingKits from '../components/DetailingKits';
import TrainingVideos from '../components/TrainingVideos';
import GlossHistory from '../components/GlossHistory';
import JuiceBoxCodexViewer from '../components/JuiceBoxCodexViewer';
import { productCategories, sevenDaySchedule, detailingKits, trainingVideos, glossHistory } from '../data/detailingData';

interface Product {
  name: string;
  link: string;
  notes: string;
  affiliate?: boolean;
}

function JuiceBoxPage() {
  const [userProducts, setUserProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('myJuiceBox');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = useState<string>('categories');
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  
  // Function to handle clicking outside the dropdown menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Add an announcer div for screen reader notifications
  useEffect(() => {
    if (!document.getElementById('juiceBoxAnnouncer')) {
      const announcer = document.createElement('div');
      announcer.id = 'juiceBoxAnnouncer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    
    // Cleanup function to remove the announcer on component unmount
    return () => {
      const announcer = document.getElementById('juiceBoxAnnouncer');
      if (announcer && announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    };
  }, []);
  
  // Export handlers
  const handleExportToPDF = async () => {
    setShowExportMenu(false);
    const element = document.getElementById('juiceBoxSection');
    if (element) {
      await exportToPdf(element, 'GoTime Motorsports - Juice Box.pdf');
    }
  };
  
  const handleExportToGoogleSheets = async () => {
    setShowExportMenu(false);
    // Convert products to CSV-friendly format
    const exportData = productCategories.flatMap(category => 
      category.products.map(product => ({
        category: category.name,
        name: product.name,
        link: product.link || 'N/A',
        notes: product.notes || 'N/A'
      }))
    );
    await exportToCsv(exportData, 'GoTime Motorsports - Juice Box.csv');
  };
  
  const handleExportToGoogleDocs = async () => {
    setShowExportMenu(false);
    const element = document.getElementById('juiceBoxSection');
    if (element) {
      await printElement(element, 'GoTime Motorsports - Juice Box');
    }
  };

  const addProduct = (product: Product) => {
    const updated = [product, ...userProducts];
    setUserProducts(updated);
    localStorage.setItem('myJuiceBox', JSON.stringify(updated));
  };

  return (
    <div 
      className="p-10 min-h-screen bg-black bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/images/image (6).png')",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(0,0,0,0.8)",
      }}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h1 className="apex-header text-3xl text-center md:text-left">
          🧼 Juice Box
        </h1>
        
        <div ref={exportMenuRef} className="relative mt-4 md:mt-0 self-center md:self-auto">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="apex-button flex items-center"
            aria-label="Export Juice Box"
            aria-expanded={showExportMenu}
            aria-haspopup="true"
          >
            <span className="mr-2">📥</span> Export Options
          </button>
          
          {showExportMenu && (
            <div 
              className="absolute right-0 mt-2 w-60 bg-gray-900 border border-green-500 rounded-md shadow-lg z-50"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="export-menu"
            >
              <div className="py-1" role="none">
                <button
                  onClick={handleExportToPDF}
                  className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                  role="menuitem"
                >
                  <span className="mr-2">📄</span> Export to PDF
                </button>
                <button
                  onClick={handleExportToGoogleSheets}
                  className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                  role="menuitem"
                >
                  <span className="mr-2">📊</span> Export to Google Sheets
                </button>
                <button
                  onClick={handleExportToGoogleDocs}
                  className="flex items-center px-4 py-2 text-sm text-gray-100 hover:bg-gray-800 w-full text-left"
                  role="menuitem"
                >
                  <span className="mr-2">📝</span> Export to Google Docs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-white text-center mb-8">
        Your complete detailing product guide and management system.
      </p>
      
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'categories' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Product Categories
        </button>
        <button 
          onClick={() => setActiveTab('codex')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'codex' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Juice Box Products
        </button>
        <button 
          onClick={() => setActiveTab('my-box')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'my-box' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          My Juice Box
        </button>
        <button 
          onClick={() => setActiveTab('day-reset')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'day-reset' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          7-Day Reset Protocol
        </button>
        <button 
          onClick={() => setActiveTab('kits')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'kits' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Detailing Kits
        </button>
        <button 
          onClick={() => setActiveTab('videos')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'videos' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Training Videos
        </button>
        <button 
          onClick={() => setActiveTab('gloss-history')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'gloss-history' 
              ? 'bg-green-500 text-black' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          Gloss History
        </button>
      </div>
      
      {/* Tab Content - added juiceBoxSection ID for export functionality */}
      <div id="juiceBoxSection" className="relative" role="region" aria-label="Juice Box content">
        {activeTab === 'categories' && (
          <>
            <CategoryProducts categoryData={productCategories} onAddProduct={addProduct} />
            <AddCustomJuiceProduct onAddProduct={addProduct} />
          </>
        )}
        
        {activeTab === 'my-box' && (
          <>
            <MyJuiceBox />
            <AddCustomJuiceProduct onAddProduct={addProduct} />
          </>
        )}
        
        {activeTab === 'day-reset' && (
          <SevenDayReset schedule={sevenDaySchedule} />
        )}
        
        {activeTab === 'kits' && (
          <DetailingKits kits={detailingKits} />
        )}
        
        {activeTab === 'videos' && (
          <TrainingVideos videoCategories={trainingVideos} />
        )}
        
        {activeTab === 'gloss-history' && (
          <GlossHistory events={glossHistory} />
        )}
        
        {activeTab === 'codex' && (
          <>
            <JuiceBoxCodexViewer onAddProduct={addProduct} />
            <AddCustomJuiceProduct onAddProduct={addProduct} />
          </>
        )}
      </div>
    </div>
  );
}

export default JuiceBoxPage;