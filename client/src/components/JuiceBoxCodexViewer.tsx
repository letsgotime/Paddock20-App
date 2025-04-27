import React, { useState, useEffect } from 'react';

interface Product {
  name: string;
  link: string;
  notes: string;
  affiliate?: boolean;
}

interface CodexCategory {
  category: string;
  products: Product[];
}

interface JuiceBoxCodexViewerProps {
  onAddProduct?: (product: Product) => void;
}

function JuiceBoxCodexViewer({ onAddProduct }: JuiceBoxCodexViewerProps) {
  const [categories, setCategories] = useState<CodexCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCodex() {
      try {
        setIsLoading(true);
        const response = await fetch('/data/JuiceBoxCodexExpanded.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch Juice Box Codex: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data);
        setError(null);
      } catch (err) {
        console.error('Error loading JuiceBox Codex:', err);
        setError('Could not load the Juice Box Codex. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCodex();
  }, []);

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">GoTime Juice Box™ Product Guide</h2>

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-400">Loading Juice Box Products...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
          <p className="text-gray-400 mt-2">
            The Product Guide will be available soon. In the meantime, you can browse our other categories.
          </p>
        </div>
      )}

      {!isLoading && !error && categories.length > 0 && categories.map((section, index) => (
        <div key={index} className="mb-10">
          <h3 className="text-blue-400 font-orbitron text-lg uppercase mb-4">{section.category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {section.products.map((product, idx) => (
              <div key={idx} className="bg-black p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start">
                  <a 
                    href={product.link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 font-orbitron text-md hover:underline flex-grow"
                  >
                    {product.name}
                  </a>
                  {product.affiliate && (
                    <span className="bg-green-500 text-black text-xs px-2 py-1 rounded ml-2">
                      Partner
                    </span>
                  )}
                </div>
                <p className="text-gray-400 mt-2">{product.notes}</p>
                {onAddProduct && (
                  <button
                    onClick={() => onAddProduct(product)}
                    className="apex-button mt-4 w-full"
                  >
                    Add to My Juice Box
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default JuiceBoxCodexViewer;