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
import DetailingActivitiesForm from '../components/DetailingActivitiesForm';
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
  const [showDetailingForm, setShowDetailingForm] = useState<boolean>(false);
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
  
  // Handler for DetailingActivitiesForm submission
  const handleDetailingActivitySubmit = (activity: any) => {
    console.log('Detailing activity submitted:', activity);
    
    // In a real app, you would save this to a database
    // For now, we'll show a success modal with rewards
    setActivity(activity);
    setIsSuccessModalOpen(true);
    setShowDetailingForm(false);
  };
  
  // State for success modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  
  // Handler for closing the success modal
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setActiveTab('categories'); // Return to the main tab after submission
  };
  
  // Handler for canceling DetailingActivitiesForm
  const handleDetailingActivityCancel = () => {
    setShowDetailingForm(false);
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
      {/* Introduction Section */}
      <div className="bg-gradient-to-r from-[#111111] to-[#1a1a1a] p-6 rounded-lg border border-gray-800 mb-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-orbitron text-blue-400 mb-2">🧼 GoTime Juice Box™</h1>
          <p className="text-white text-lg italic mb-2">The curated, real-world-tested, gloss-backed, Gavin-approved detailing arsenal.</p>
          <p className="text-gray-300">Your complete detailing product guide and management system.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-xl font-orbitron text-blue-400 mb-3">Why You're Here</h3>
            <p className="text-gray-300 mb-2">Because you care about your ride's appearance as much as its performance.</p>
            <p className="text-gray-300 mb-2">To learn what products actually work, save time on research, and build a proven detailing arsenal.</p>
            <p className="text-gray-300">To track your detailing activities and build value into your vehicle.</p>
          </div>
          
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-xl font-orbitron text-blue-400 mb-3">What You Get</h3>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span> 
                <span>Curated product recommendations tested on supercars and daily drivers</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span> 
                <span>Detailing activity tracker with points system</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span> 
                <span>Complete gloss reset system and seasonal maintenance guides</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
            <h3 className="text-xl font-orbitron text-blue-400 mb-3">How To Use It</h3>
            <ol className="text-gray-300 space-y-2 list-decimal pl-5">
              <li>Record your detailing sessions and product purchases</li>
              <li>Build your personal detailing inventory</li>
              <li>Follow the 7-Day Gloss Reset for maximum results</li>
              <li>Track your detailing history for resale documentation</li>
              <li>Earn points and track your detailing discipline</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="apex-header text-2xl text-center md:text-left">
          Juice Box Dashboard
        </h2>
        
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
      
      {/* Prominent Add Detailing Activity Button */}
      <div className="flex justify-center mb-8">
        <button 
          onClick={() => {
            setActiveTab('detailing-activity');
            setShowDetailingForm(true);
          }}
          className="apex-button bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-orbitron flex items-center text-lg shadow-lg transform hover:scale-105 transition-transform"
        >
          <span className="mr-2">+</span> Add Detailing Activity or Purchase
        </button>
      </div>
      
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
          onClick={() => setActiveTab('detailing-activity')}
          className={`px-5 py-2 rounded-lg font-orbitron text-sm
            ${activeTab === 'detailing-activity' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          New Detailing Activity or Purchase
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
        
        {activeTab === 'detailing-activity' && (
          <div className="bg-black bg-opacity-70 p-6 rounded-lg border border-blue-900">
            <h2 className="text-blue-400 font-orbitron text-2xl mb-6 text-center">New Detailing Activity or Purchase</h2>
            <p className="text-white text-center mb-6">
              Document your detailing activities with comprehensive details including products, steps, and media. 
              This helps track your gloss journey and share your expertise with the community.
            </p>
            
            {showDetailingForm ? (
              <DetailingActivitiesForm 
                onSubmit={handleDetailingActivitySubmit} 
                onCancel={handleDetailingActivityCancel} 
              />
            ) : (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => setShowDetailingForm(true)}
                  className="apex-button bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-orbitron flex items-center"
                >
                  <span className="mr-2">+</span> New Detailing Activity or Purchase
                </button>
                <p className="text-gray-400 text-sm mt-4 text-center max-w-2xl">
                  Log washes, polishing sessions, ceramic coatings and more with our comprehensive detailing activity form. 
                  Include photos, videos, product lists and detailed notes for your records.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Success Modal */}
      {isSuccessModalOpen && activity && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-green-500 rounded-lg w-full max-w-md p-6 text-center">
            <div className="mb-6 text-center">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-500 mb-4">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-orbitron text-green-400 mb-2">Success!</h2>
              <p className="text-gray-300 mb-4">
                Your detailing activity "{activity.title}" has been recorded successfully.
              </p>
              
              <div className="bg-blue-900/20 border border-blue-800/30 rounded-md p-4 mb-6">
                <h3 className="text-amber-400 font-orbitron mb-2 text-lg">Rewards Earned</h3>
                <div className="flex justify-center items-center gap-2 mb-3">
                  <span className="text-2xl text-amber-300 font-bold">+{activity.pointsEarned}</span>
                  <span className="text-amber-400">gloss points</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Keep up the great work! You're on your way to reaching the next level.
                </p>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={handleCloseSuccessModal}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium"
                >
                  Done
                </button>
                <button 
                  onClick={() => {
                    handleCloseSuccessModal();
                    setActiveTab('detailing-activity');
                    setShowDetailingForm(true);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                >
                  Add Another
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JuiceBoxPage;