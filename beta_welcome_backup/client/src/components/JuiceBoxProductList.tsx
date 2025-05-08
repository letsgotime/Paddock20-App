import React from 'react';

interface Product {
  name: string;
  link: string;
  notes: string;
}

interface JuiceBoxProductListProps {
  onAddProduct: (product: Product) => void;
}

const defaultProducts: Product[] = [
  { name: "Frothe (AMMO NYC)", link: "https://www.ammonyc.com/shop/hoseless-lift-kit-150/", notes: "Hoseless safe wash" },
  { name: "GYEON Foam", link: "https://www.gyeonquartzusa.com/", notes: "Heavy foam, deep pull" },
  { name: "MTM PF22.2 Foam Cannon", link: "https://www.obsessedgarage.com/products/mtm-pf22-2-foam-cannon" , notes: "Best foam cannon" },
  { name: "CarPro Reload", link: "https://www.amazon.com/CarPro-Reload-Inorganic-Spray-Sealant/dp/B00VK9HUMG", notes: "Topper/sealant hybrid" },
  { name: "CQuartz UK 3.0", link: "https://www.amazon.com/dp/B00W8APMQM", notes: "Trusted base coating" },
  { name: "AMMO Mousse Interior Cleaner", link: "https://www.ammonyc.com/shop/mousse-interior-cleaner/", notes: "Interior-safe cleaning" },
];

function JuiceBoxProductList({ onAddProduct }: JuiceBoxProductListProps) {
  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">GoTime Default Juice Box™ Products</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {defaultProducts.map((product, index) => (
          <div key={index} className="bg-black p-4 rounded-lg">
            <a href={product.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 font-orbitron text-md hover:underline">
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
  );
}

export default JuiceBoxProductList;