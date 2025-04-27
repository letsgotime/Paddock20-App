import React, { useState, useEffect } from 'react';
import JuiceBoxProductList from '../components/JuiceBoxProductList';
import MyJuiceBox from '../components/MyJuiceBox';
import AddCustomJuiceProduct from '../components/AddCustomJuiceProduct';

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

  const addProduct = (product: Product) => {
    const updated = [product, ...userProducts];
    setUserProducts(updated);
    localStorage.setItem('myJuiceBox', JSON.stringify(updated));
  };

  return (
    <div className="p-10 bg-black min-h-screen">
      <h1 className="apex-header text-3xl mb-10 text-center">
        ApexVault™ Juice Box System
      </h1>
      
      <JuiceBoxProductList onAddProduct={addProduct} />
      <AddCustomJuiceProduct onAddProduct={addProduct} />
      <MyJuiceBox />
    </div>
  );
}

export default JuiceBoxPage;