import React, { useState } from 'react';
import { Upload, X, Info, Check } from 'lucide-react';

/**
 * AddVehicleForm Component
 * Form to add a new vehicle to the GoTime Garage Vault
 */
const AddVehicleForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    vin: '',
    license_plate: '',
    color: '',
    purchase_date: '',
    notes: '',
    status: 'Active',
    type: 'Car',
    image_url: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle image selection
  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        setImagePreview(event.target.result);
      };
      
      reader.readAsDataURL(selectedFile);
      
      // In a real implementation, this would upload to a storage service
      // For now, we'll just simulate it
      setUploading(true);
      
      setTimeout(() => {
        setUploading(false);
        setFormData({
          ...formData,
          image_url: 'https://example.com/vehicle-image.jpg' // This would be the URL from the storage service
        });
      }, 1500);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real implementation, validation would be more robust
    if (!formData.make || !formData.model || !formData.year) {
      alert('Please fill in all required fields.');
      return;
    }
    
    onSubmit(formData);
  };
  
  // Render the form
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Vehicle details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Vehicle Information</h3>
          
          {/* Vehicle Make */}
          <div>
            <label htmlFor="make" className="block text-gray-300 mb-1">
              Make <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Vehicle Model */}
          <div>
            <label htmlFor="model" className="block text-gray-300 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Vehicle Year */}
          <div>
            <label htmlFor="year" className="block text-gray-300 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Vehicle Trim */}
          <div>
            <label htmlFor="trim" className="block text-gray-300 mb-1">
              Trim
            </label>
            <input
              type="text"
              id="trim"
              name="trim"
              value={formData.trim}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Vehicle VIN */}
          <div>
            <label htmlFor="vin" className="block text-gray-300 mb-1">
              VIN (Vehicle Identification Number)
            </label>
            <input
              type="text"
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Vehicle License Plate */}
          <div>
            <label htmlFor="license_plate" className="block text-gray-300 mb-1">
              License Plate
            </label>
            <input
              type="text"
              id="license_plate"
              name="license_plate"
              value={formData.license_plate}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Right column - Additional information and image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">Additional Information</h3>
          
          {/* Vehicle Color */}
          <div>
            <label htmlFor="color" className="block text-gray-300 mb-1">
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Purchase Date */}
          <div>
            <label htmlFor="purchase_date" className="block text-gray-300 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchase_date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Vehicle Type */}
          <div>
            <label htmlFor="type" className="block text-gray-300 mb-1">
              Vehicle Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Car">Car</option>
              <option value="Truck">Truck</option>
              <option value="SUV">SUV</option>
              <option value="Motorcycle">Motorcycle</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          {/* Vehicle Status */}
          <div>
            <label htmlFor="status" className="block text-gray-300 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="Storage">In Storage</option>
              <option value="Project">Project Car</option>
              <option value="Sold">Sold</option>
            </select>
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-gray-300 mb-2">
              Vehicle Image
            </label>
            
            {imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-700">
                <img 
                  src={imagePreview} 
                  alt="Vehicle Preview" 
                  className="w-full h-48 object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setFormData({ ...formData, image_url: '' });
                  }}
                  className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg h-48 cursor-pointer hover:border-blue-500 relative">
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageSelect}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  accept="image/*"
                />
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">Click or drag to upload</p>
                  <p className="text-gray-600 text-xs mt-1">JPEG, PNG or WebP (max. 5MB)</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add any additional notes about this vehicle..."
        ></textarea>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-300 hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md flex items-center"
        >
          <Check className="h-4 w-4 mr-2" />
          Add Vehicle
        </button>
      </div>
      
      {/* Help Text */}
      <div className="mt-4 bg-blue-900/20 border border-blue-900/30 rounded-lg p-4 flex items-start">
        <Info className="h-5 w-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-300">
          <p className="mb-1">
            Adding your vehicles to the Garage Vault enables powerful features:
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-1">
            <li>Detailed maintenance and modification tracking</li>
            <li>Real-time telemetry via OBD-II connection</li>
            <li>Customized JuiceBox™ detailing plans</li>
            <li>Complete service history documentation</li>
            <li>Drive journaling and route planning</li>
          </ul>
        </div>
      </div>
    </form>
  );
};

export default AddVehicleForm;