import React from 'react';

/**
 * DreamAssets component stores high-quality, reliable image URLs for dream assets
 * This provides a central place to manage and update image URLs
 * across the entire application
 */
const DreamAssets = () => {
  // These URLs can be used throughout the application for consistent imagery
  const dreamAssetImages = {
    // Cars
    ferrari458: 'https://purepng.com/public/uploads/large/purepng.com-ferrari-458-italia-redcarferrarivehicleluxury-carsports-car-1701527409983pmymv.png',
    audiR8: 'https://www.pngmart.com/files/22/Audi-R8-PNG-Photo.png',
    bmwM3G80: 'https://www.ccarprice.com/products/BMW-M3-Competition-Sedan-2021.jpg',
    bmwM3E93: 'https://www.bmwusa.com/content/dam/bmwusa/M-Model-Vehicles/2018/BMW-M4-Convertible/BMW-MY18-MPerformance-Header-M3-Convertible-Desktop.jpg',
    
    // Car Modifications
    ryftExhaust: 'https://cdn.shopify.com/s/files/1/0085/7478/7093/products/RYFT-Ferrari-488-GTB-Spider-Performance-Exhaust-1_1600x.jpg?v=1592354584',
    hreWheelsP101: 'https://butlertire.com/media/uploads/products/HRE_P101_Wheels/HRE-P101-Gloss-Silver.png',
    
    // Luxury Items
    patekPhilippe5711: 'https://media.bossluxurywatch.vn/2021/04/patek-philippe-nautilus-5711-1a-010.jpg',
    
    // Real Estate
    malibuBeachHouse: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
  };

  return (
    <div className="dream-assets">
      {/* Component doesn't render anything directly, just provides a data store */}
    </div>
  );
};

export default DreamAssets;

// Export the asset URLs for use in other components
export const dreamAssetUrls = {
  // Cars
  ferrari458: 'https://purepng.com/public/uploads/large/purepng.com-ferrari-458-italia-redcarferrarivehicleluxury-carsports-car-1701527409983pmymv.png',
  audiR8: 'https://www.pngmart.com/files/22/Audi-R8-PNG-Photo.png',
  bmwM3G80: 'https://www.ccarprice.com/products/BMW-M3-Competition-Sedan-2021.jpg',
  bmwM3E93: 'https://www.bmwusa.com/content/dam/bmwusa/M-Model-Vehicles/2018/BMW-M4-Convertible/BMW-MY18-MPerformance-Header-M3-Convertible-Desktop.jpg',
  
  // Car Modifications
  ryftExhaust: 'https://cdn.shopify.com/s/files/1/0085/7478/7093/products/RYFT-Ferrari-488-GTB-Spider-Performance-Exhaust-1_1600x.jpg?v=1592354584',
  hreWheelsP101: 'https://butlertire.com/media/uploads/products/HRE_P101_Wheels/HRE-P101-Gloss-Silver.png',
  
  // Luxury Items
  patekPhilippe5711: 'https://media.bossluxurywatch.vn/2021/04/patek-philippe-nautilus-5711-1a-010.jpg',
  
  // Real Estate
  malibuBeachHouse: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'
};