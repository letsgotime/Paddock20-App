import React, { useState, useEffect } from 'react';

interface Product {
  name: string;
  link?: string;
  notes?: string;
}

function MyJuiceBox() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('myJuiceBox');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, idx) => idx !== index);
    setProducts(updatedProducts);
    localStorage.setItem('myJuiceBox', JSON.stringify(updatedProducts));
  };

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">My Personal Juice Box™</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.length > 0 ? products.map((product, index) => (
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
              onClick={() => removeProduct(index)}
              className="apex-button mt-4 w-full"
            >
              Remove
            </button>
          </div>
        )) : (
          <p className="text-gray-400 col-span-2 text-center">No products added yet. Build your Juice Box!</p>
        )}
      </div>
    </div>
  );
}

export default MyJuiceBox;