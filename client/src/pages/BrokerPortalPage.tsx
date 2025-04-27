import React from 'react';
import AssetMatchForm from '../components/AssetMatchForm';

interface Asset {
  title: string;
  link: string;
  img: string;
}

function BrokerPortalPage() {
  const exoticCars: Asset[] = [
    {
      title: "2013 Lamborghini Gallardo Superleggera",
      link: "https://www.dupontregistry.com/autos/listing/2013/lamborghini/gallardo--superleggera/465435",
      img: "https://cdn.dupontregistry.com/ImageResizer.ashx?n=http://img.dupontregistry.com/UserImages/465435/1920/1920.jpg"
    }
    // Add more cars as needed
  ];

  const luxuryWatches: Asset[] = [
    {
      title: "Rolex Daytona Ceramic",
      link: "https://example.com/rolex-daytona-listing",
      img: "https://yourimagelink.com/rolex-daytona.jpg"
    }
    // Add more watches as needed
  ];

  return (
    <div className="p-10 bg-black min-h-screen space-y-20">
      
      {/* Exotic Cars Section */}
      <section>
        <h2 className="apex-header-green mb-8 text-center">Available Exotic Cars</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exoticCars.map((car, index) => (
            <a href={car.link} target="_blank" rel="noopener noreferrer" key={index} className="apex-card hover:bg-gray-800 transition">
              <img src={car.img} alt={car.title} className="rounded-lg mb-4" />
              <h3 className="text-blue-400 font-orbitron text-lg text-center">{car.title}</h3>
            </a>
          ))}
        </div>
      </section>

      {/* Luxury Watches Section */}
      <section>
        <h2 className="apex-header-green mb-8 text-center">Available Luxury Timepieces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {luxuryWatches.map((watch, index) => (
            <a href={watch.link} target="_blank" rel="noopener noreferrer" key={index} className="apex-card hover:bg-gray-800 transition">
              <img src={watch.img} alt={watch.title} className="rounded-lg mb-4" />
              <h3 className="text-blue-400 font-orbitron text-lg text-center">{watch.title}</h3>
            </a>
          ))}
        </div>
      </section>

      {/* Asset Match Form */}
      <section>
        <AssetMatchForm />
      </section>

    </div>
  );
}

export default BrokerPortalPage;