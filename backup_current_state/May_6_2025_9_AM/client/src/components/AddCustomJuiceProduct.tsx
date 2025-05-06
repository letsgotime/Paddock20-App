import React, { useState } from 'react';

interface Product {
  name: string;
  link: string;
  notes: string;
}

interface AddCustomJuiceProductProps {
  onAddProduct: (product: Product) => void;
}

function AddCustomJuiceProduct({ onAddProduct }: AddCustomJuiceProductProps) {
  const [newProduct, setNewProduct] = useState<Product>({ 
    link: '', 
    name: '', 
    notes: '' 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name) {
      onAddProduct(newProduct);
      setNewProduct({ link: '', name: '', notes: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="apex-card mb-8">
      <h2 className="apex-header-green mb-6 text-center">Add Your Own Product</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          name="link"
          placeholder="Optional Product Link"
          value={newProduct.link}
          onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
        />
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
          required
        />
        <input
          type="text"
          name="notes"
          placeholder="Optional Notes"
          value={newProduct.notes}
          onChange={handleChange}
          className="p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
        />
      </div>

      <button type="submit" className="apex-button w-full mt-6">
        Add to My Juice Box
      </button>
    </form>
  );
}

export default AddCustomJuiceProduct;