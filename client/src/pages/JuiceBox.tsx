import React, { useState, useEffect } from 'react';
import JuiceBoxProductList from '../components/JuiceBoxProductList';
import MyJuiceBox from '../components/MyJuiceBox';
import AddCustomJuiceProduct from '../components/AddCustomJuiceProduct';
import CategoryProducts from '../components/CategoryProducts';
import SevenDayReset from '../components/SevenDayReset';
import DetailingKits from '../components/DetailingKits';
import TrainingVideos from '../components/TrainingVideos';
import GlossHistory from '../components/GlossHistory';
import { productCategories, sevenDaySchedule, detailingKits, trainingVideos, glossHistory } from '../data/detailingData';

interface Product {
  name: string;
  link: string;
  notes: string;
}

function JuiceBoxPage() {
  const [userProducts, setUserProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('myJuiceBox');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = useState<string>('categories');

  const addProduct = (product: Product) => {
    const updated = [product, ...userProducts];
    setUserProducts(updated);
    localStorage.setItem('myJuiceBox', JSON.stringify(updated));
  };

  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-6 text-center">
        ApexVault™ Juice Box System
      </h1>
      
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
      </div>
      
      {/* Tab Content */}
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
    </div>
  );
}

export default JuiceBoxPage;