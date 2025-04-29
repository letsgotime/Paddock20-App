import React, { useState } from 'react';
import supabase from '../services/supabaseClient';
import { searchImage } from '../services/unsplashService';
import { X, Save, Upload, Search, Plus, Zap } from 'lucide-react';

/**
 * Add Vehicle Form Component
 * A user-friendly form for adding new vehicles to the Garage Vault
 */
const AddVehicleForm = ({ onClose, onVehicleAdded }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    trim: '',
    color: '',
    engine: '',
    transmission: '',
    mileage: '',
    purchase_date: '',
    insurance_renewal: '',
    license_plate: '',
    registration_renewal: '',
    notes: '',
    status: 'Ready',
    gloss_index: 85,
    image_url: ''
  });
  
  const [searching, setSearching] = useState(false);
  const [imageResults, setImageResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Popular car makes for quick selection
  const popularMakes = [
    'Audi', 'BMW', 'Ferrari', 'Lamborghini', 'Mercedes-Benz', 
    'Porsche', 'Ford', 'Chevrolet', 'Honda', 'Toyota'
  ];
  
  // Common engine types
  const engineTypes = [
    'V6', 'V8', 'V10', 'V12', 'Inline-4', 'Inline-6', 
    'Flat-4', 'Flat-6', 'W12', 'Electric', 'Hybrid'
  ];
  
  // Transmission types
  const transmissionTypes = [
    'Manual', 'Automatic', 'DCT', 'PDK', 'CVT', 'Sequential', 'SMG'
  ];
  
  // Status options
  const statusOptions = [
    'Ready', 'Service Due', 'Under Maintenance', 'In Storage', 'Track Prep'
  ];
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Search for car images using Unsplash API
  const searchCarImages = async () => {
    setSearching(true);
    setImageResults([]);
    
    try {
      const query = `${formData.year} ${formData.make} ${formData.model} ${formData.color || ''} car`;
      const results = await searchImage(query, 8);
      
      if (results && results.length > 0) {
        setImageResults(results);
      } else {
        console.log('No image results found');
      }
    } catch (error) {
      console.error('Error searching images:', error);
    }
    
    setSearching(false);
  };
  
  // Select an image for the vehicle
  const selectImage = (url) => {
    setFormData({ ...formData, image_url: url });
    setSearching(false);
  };
  
  // Quick select a make from popular options
  const quickSelectMake = (make) => {
    setFormData({ ...formData, make });
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Enter a valid year';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit the form to add a new vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Add the current date as the added_date
      const vehicleData = {
        ...formData,
        added_date: new Date().toISOString().split('T')[0],
        // If no image was selected, generate a search query for later use
        image_query: !formData.image_url ? `${formData.year} ${formData.make} ${formData.model} ${formData.color || ''} car` : null
      };
      
      const { data, error } = await supabase
        .from('Vehicles')
        .insert([vehicleData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        if (onVehicleAdded) onVehicleAdded(data[0]);
        onClose();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error.message);
      setErrors({ form: 'Failed to add vehicle. ' + error.message });
    }
    
    setLoading(false);
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80" onClick={onClose}>
      <div 
        className="bg-gray-900 border border-blue-500/20 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-blue-400 font-orbitron text-2xl">Add Vehicle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {errors.form && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-500 p-3 rounded-md mb-4">
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Section */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Year*</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={`w-full bg-gray-800 border ${errors.year ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                />
                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
              </div>
              
              {/* Make */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Make*</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.make ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. Porsche"
                />
                {errors.make && <p className="text-red-500 text-xs mt-1">{errors.make}</p>}
                
                {/* Quick select popular makes */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {popularMakes.map((make) => (
                    <button
                      key={make}
                      type="button"
                      onClick={() => quickSelectMake(make)}
                      className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded"
                    >
                      {make}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Model */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Model*</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.model ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. 911 GT3"
                />
                {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
              </div>
              
              {/* Trim */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Trim/Variant</label>
                <input
                  type="text"
                  name="trim"
                  value={formData.trim}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Touring Package"
                />
              </div>
              
              {/* Color */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Exterior Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Shark Blue"
                />
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Technical Details Section */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Technical Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Engine */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Engine</label>
                <select
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select Engine</option>
                  {engineTypes.map((engine) => (
                    <option key={engine} value={engine}>{engine}</option>
                  ))}
                </select>
              </div>
              
              {/* Transmission */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select Transmission</option>
                  {transmissionTypes.map((transmission) => (
                    <option key={transmission} value={transmission}>{transmission}</option>
                  ))}
                </select>
              </div>
              
              {/* Mileage */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mileage</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. 12500"
                />
              </div>
              
              {/* VIN */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">VIN</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Vehicle Identification Number"
                />
              </div>
              
              {/* License Plate */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">License Plate</label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              
              {/* Gloss Index */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Gloss Index ({formData.gloss_index}%)
                </label>
                <input
                  type="range"
                  name="gloss_index"
                  value={formData.gloss_index}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="1"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Important Dates Section */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Important Dates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Purchase Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              
              {/* Insurance Renewal */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Insurance Renewal</label>
                <input
                  type="date"
                  name="insurance_renewal"
                  value={formData.insurance_renewal}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              
              {/* Registration Renewal */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Registration Renewal</label>
                <input
                  type="date"
                  name="registration_renewal"
                  value={formData.registration_renewal}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Vehicle Image Section */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-500 font-orbitron text-lg">Vehicle Image</h3>
              <button 
                type="button"
                onClick={searchCarImages}
                className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                disabled={searching}
              >
                {searching ? (
                  <span className="animate-pulse">Searching...</span>
                ) : (
                  <>
                    <Search size={16} className="mr-1" /> Find Images
                  </>
                )}
              </button>
            </div>
            
            {formData.image_url && (
              <div className="relative mb-4">
                <img 
                  src={formData.image_url} 
                  alt="Selected vehicle"
                  className="w-full h-56 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image_url: '' })}
                  className="absolute top-2 right-2 p-1 bg-black bg-opacity-70 rounded-full text-white"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            {searching && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            )}
            
            {imageResults.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {imageResults.map((image, index) => (
                  <div 
                    key={index}
                    className="relative cursor-pointer overflow-hidden rounded-md h-24"
                    onClick={() => selectImage(image.urls.regular)}
                  >
                    <img 
                      src={image.urls.thumb} 
                      alt={`Option ${index + 1}`}
                      className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">Image URL (Optional)</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                placeholder="https://example.com/car-image.jpg"
              />
            </div>
          </div>
          
          {/* Notes Section */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Notes</h3>
            
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              placeholder="Any special notes about this vehicle..."
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-green-500 text-black font-medium rounded-lg hover:bg-green-400 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Adding...</span>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Add Vehicle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleForm;