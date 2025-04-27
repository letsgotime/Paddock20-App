import React, { useState, useEffect } from 'react';
import { fetchJuiceBox, addJuiceBoxProduct } from '../services/juiceboxService';
import supabase from '../services/supabaseClient';

interface Product {
  id?: number;
  name: string;
  link?: string;
  notes?: string;
  user_id?: string;
}

function MyJuiceBox() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchJuiceBox();
        setProducts(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching JuiceBox:', err);
        setError('Could not load your Juice Box products. Please try again later.');
        // Fallback to localStorage if API fails
        const savedProducts = localStorage.getItem('myJuiceBox');
        if (savedProducts) {
          setProducts(JSON.parse(savedProducts));
        }
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const removeProduct = async (id: number, index: number) => {
    try {
      // If the product has an ID, remove it from Supabase
      if (id) {
        await supabase.from('JuiceBox').delete().eq('id', id);
        const data = await fetchJuiceBox();
        setProducts(data || []);
      } else {
        // If no ID (local product), remove from local state
        const updatedProducts = products.filter((_, idx) => idx !== index);
        setProducts(updatedProducts);
        localStorage.setItem('myJuiceBox', JSON.stringify(updatedProducts));
      }
    } catch (err) {
      console.error('Error removing product:', err);
      // Fallback to local removal if API fails
      const updatedProducts = products.filter((_, idx) => idx !== index);
      setProducts(updatedProducts);
      localStorage.setItem('myJuiceBox', JSON.stringify(updatedProducts));
    }
  };

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">My Personal Juice Box™</h2>
      
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading your Juice Box products...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {!loading && products.length > 0 ? products.map((product, index) => (
          <div key={index} className="bg-black p-4 rounded-lg">
            {product.link ? (
              <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-orbitron text-md hover:underline">
                {product.name}
              </a>
            ) : (
              <h3 className="text-blue-400 font-orbitron text-md">{product.name}</h3>
            )}
            {product.notes && <p className="text-white mt-2">{product.notes}</p>}
            <button
              onClick={() => removeProduct(product.id || 0, index)}
              className="apex-button mt-4 w-full"
            >
              Remove
            </button>
          </div>
        )) : (
          !loading && (
            <p className="text-gray-400 col-span-2 text-center">
              No products added yet. Build your Juice Box!
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default MyJuiceBox;