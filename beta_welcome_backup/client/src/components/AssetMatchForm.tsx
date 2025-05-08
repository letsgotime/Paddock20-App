import React, { useState } from 'react';

enum AssetType {
  Car = 'car',
  Watch = 'watch',
  RealEstate = 'real_estate',
  Other = 'other'
}

interface AssetRequest {
  assetType: AssetType;
  budget: string;
  details: string;
  name: string;
  email: string;
  phone: string;
}

function AssetMatchForm() {
  const [formData, setFormData] = useState<AssetRequest>({
    assetType: AssetType.Car,
    budget: '',
    details: '',
    name: '',
    email: '',
    phone: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Here you would normally send data to your backend
      // For demo, we'll just simulate a submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Asset match request submitted:', formData);
      setSubmitted(true);
      // Reset form
      setFormData({
        assetType: AssetType.Car,
        budget: '',
        details: '',
        name: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apex-card">
      <h2 className="apex-header-green mb-6 text-center">Asset Match Service</h2>
      <p className="text-gray-300 mb-6 text-center">
        Let our brokers find your dream car, watch, or real estate property
      </p>
      
      {submitted ? (
        <div className="text-center py-8">
          <h3 className="text-green-500 font-orbitron text-xl mb-4">Request Submitted!</h3>
          <p className="text-white">Our broker will contact you shortly.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="apex-button mt-6"
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Asset Type</label>
            <select 
              name="assetType"
              value={formData.assetType}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white"
              required
            >
              <option value={AssetType.Car}>Exotic Car</option>
              <option value={AssetType.Watch}>Luxury Watch</option>
              <option value={AssetType.RealEstate}>Real Estate</option>
              <option value={AssetType.Other}>Other Luxury Asset</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Budget Range</label>
            <input 
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="e.g. $100,000 - $250,000"
              className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Details/Specifications</label>
            <textarea 
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder="Please describe what you're looking for..."
              rows={4}
              className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Full Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Phone Number</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="apex-button w-full"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Find My Asset'}
          </button>
        </form>
      )}
    </div>
  );
}

export default AssetMatchForm;