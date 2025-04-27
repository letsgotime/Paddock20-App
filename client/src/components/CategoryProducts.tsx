import React from 'react';

interface Product {
  name: string;
  link: string;
  notes: string;
}

interface CategoryData {
  category: string;
  products: Product[];
}

interface CategoryProductsProps {
  categoryData: CategoryData[];
  onAddProduct: (product: Product) => void;
}

function CategoryProducts({ categoryData, onAddProduct }: CategoryProductsProps) {
  return (
    <div className="mb-12">
      {categoryData.map((category, catIndex) => (
        <div key={catIndex} className="apex-card mb-8">
          <h2 className="apex-header-green mb-6 text-center">{category.category}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {category.products.map((product, index) => (
              <div key={index} className="bg-black p-4 rounded-lg">
                <a 
                  href={product.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 font-orbitron text-md hover:underline"
                >
                  {product.name}
                </a>
                <p className="text-white mt-2">{product.notes}</p>
                <button
                  onClick={() => onAddProduct(product)}
                  className="apex-button mt-4 w-full"
                >
                  Add to My Juice Box
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default CategoryProducts;