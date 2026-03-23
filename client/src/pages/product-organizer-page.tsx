import React from 'react';
import DraggableProductOrganizer from '../components/DraggableProductOrganizer';

const ProductOrganizerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">
            Product Organization
          </h1>
          <p className="text-gray-400 max-w-3xl">
            Drag and drop to rearrange your product categories and items. Organize your inventory
            intuitively with our visual interface. Changes are automatically saved and reflected in your
            store or inventory system.
          </p>
        </div>

        <div className="grid gap-8">
          <DraggableProductOrganizer />
          
          <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800 bg-gray-900/70">
              <h2 className="text-xl font-semibold text-blue-400">
                Inventory Management Tips
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Group Related Products</h3>
                <p className="text-gray-400">
                  Organize products into logical categories that follow your customer's buying journey. 
                  Place complementary products near each other to encourage additional purchases.
                </p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Highlight Best Sellers</h3>
                <p className="text-gray-400">
                  Position your most popular items at the top of each category. This increases visibility
                  and drives more sales for your proven products.
                </p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-2">Seasonal Adjustments</h3>
                <p className="text-gray-400">
                  Regularly update your product organization to reflect seasonal needs. Promote winter
                  care products during colder months and detailing supplies during spring and summer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductOrganizerPage;