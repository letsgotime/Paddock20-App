import React, { useState } from 'react';
import supabase from '../services/supabaseClient';
import { searchImage } from '../services/unsplashService';
import { X, Save, Calendar, Wrench, Clock, Search, Plus, Zap, Link, Target } from 'lucide-react';

/**
 * Add Modification Form Component
 * A user-friendly form for adding modifications to vehicles
 */
const AddModificationForm = ({ onClose, vehicleId, onModificationAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Performance',
    description: '',
    brand: '',
    model: '',
    part_number: '',
    installation_date: '',
    installation_location: '',
    cost: '',
    installer: '',
    warranty_expires: '',
    status: 'Installed',
    notes: '',
    image_url: '',
    link_url: '',  // For hyperlink to product or documentation
    link_label: '', // Label for the hyperlink
    affected_systems: [] // Which vehicle systems are affected
  });
  
  const [searching, setSearching] = useState(false);
  const [imageResults, setImageResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Modification types
  const modificationTypes = [
    'Performance', 'Aesthetic', 'Wheels & Suspension', 'Engine', 
    'Exhaust', 'Electronics', 'Interior', 'Exterior', 'Lighting',
    'Braking', 'Transmission', 'Security', 'Audio'
  ];
  
  // Status options for modifications
  const statusOptions = [
    'Installed', 'Planned', 'In Progress', 'Removed', 'Replaced'
  ];
  
  // Common vehicle systems that can be affected by modifications
  const vehicleSystems = [
    'Engine', 'Suspension', 'Drivetrain', 'Electrical', 
    'Brakes', 'Chassis', 'Interior', 'Exterior', 'ECU'
  ];
  
  // Installation locations
  const commonInstallers = [
    'Dealer', 'Specialist Shop', 'DIY', 'Independent Mechanic', 
    'Performance Shop', 'Custom Shop'
  ];
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle checkbox changes for affected systems
  const handleSystemToggle = (system) => {
    const updatedSystems = formData.affected_systems.includes(system)
      ? formData.affected_systems.filter(s => s !== system)
      : [...formData.affected_systems, system];
    
    setFormData({ ...formData, affected_systems: updatedSystems });
  };
  
  // Search for modification images using Unsplash API
  const searchModImages = async () => {
    setSearching(true);
    setImageResults([]);
    
    try {
      const query = `${formData.name} ${formData.type} ${formData.brand || ''} car modification`;
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
  
  // Select an image for the modification
  const selectImage = (url) => {
    setFormData({ ...formData, image_url: url });
    setSearching(false);
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Modification name is required';
    if (!formData.type.trim()) newErrors.type = 'Type is required';
    if (formData.cost && isNaN(Number(formData.cost))) newErrors.cost = 'Cost must be a number';
    
    // Validate URL if provided
    if (formData.link_url && !formData.link_url.match(/^(http|https):\/\/[^ "]+$/)) {
      newErrors.link_url = 'Please enter a valid URL starting with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit the form to add a new modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Format cost as number if present
      const modData = {
        ...formData,
        vehicle_id: vehicleId,
        cost: formData.cost ? Number(formData.cost) : null,
        added_date: new Date().toISOString().split('T')[0],
        // If no image was selected, generate a search query for later use
        image_query: !formData.image_url ? `${formData.name} ${formData.type} car modification` : null
      };
      
      const { data, error } = await supabase
        .from('Modifications')
        .insert([modData])
        .select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        if (onModificationAdded) onModificationAdded(data[0]);
        onClose();
      }
    } catch (error) {
      console.error('Error adding modification:', error.message);
      setErrors({ form: 'Failed to add modification. ' + error.message });
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
          <h2 className="text-blue-400 font-orbitron text-2xl">Add Modification</h2>
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
          {/* Basic Details Section */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Modification Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Modification Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. HRE P101 Forged Wheels"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Modification Type*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.type ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                >
                  {modificationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
              </div>
              
              {/* Brand */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Brand/Manufacturer</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. HRE Performance Wheels"
                />
              </div>
              
              {/* Model/Part */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Model/Part Number</label>
                <input
                  type="text"
                  name="part_number"
                  value={formData.part_number}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. P101-20x9.5"
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
              
              {/* Cost */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Cost ($)</label>
                <input
                  type="text"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border ${errors.cost ? 'border-red-500' : 'border-gray-700'} rounded-md px-3 py-2 text-white`}
                  placeholder="e.g. 4500"
                />
                {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
              </div>
            </div>
          </div>
          
          {/* Installation Details */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Installation Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Installation Date */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Installation Date</label>
                <input
                  type="date"
                  name="installation_date"
                  value={formData.installation_date}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
              
              {/* Installer */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Installed By</label>
                <select
                  name="installer"
                  value={formData.installer}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="">Select Installer</option>
                  {commonInstallers.map((installer) => (
                    <option key={installer} value={installer}>{installer}</option>
                  ))}
                </select>
              </div>
              
              {/* Installation Location */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Installation Location</label>
                <input
                  type="text"
                  name="installation_location"
                  value={formData.installation_location}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Performance Shop Name"
                />
              </div>
              
              {/* Warranty Expiration */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Warranty Expires</label>
                <input
                  type="date"
                  name="warranty_expires"
                  value={formData.warranty_expires}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Affected Systems */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Affected Vehicle Systems</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {vehicleSystems.map((system) => (
                <div key={system} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`system-${system}`}
                    checked={formData.affected_systems.includes(system)}
                    onChange={() => handleSystemToggle(system)}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor={`system-${system}`} className="text-white text-sm">
                    {system}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Links and Resources */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Links & Resources</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link URL (Optional)</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 bg-gray-700 border border-r-0 border-gray-700 rounded-l-md">
                    <Link size={16} className="text-gray-400" />
                  </span>
                  <input
                    type="url"
                    name="link_url"
                    value={formData.link_url}
                    onChange={handleChange}
                    className={`flex-1 bg-gray-800 border ${errors.link_url ? 'border-red-500' : 'border-gray-700'} rounded-r-md px-3 py-2 text-white`}
                    placeholder="https://manufacturer-website.com/product-page"
                  />
                </div>
                {errors.link_url && <p className="text-red-500 text-xs mt-1">{errors.link_url}</p>}
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link Label (Optional)</label>
                <input
                  type="text"
                  name="link_label"
                  value={formData.link_label}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="e.g. Product Page"
                />
              </div>
            </div>
          </div>
          
          {/* Modification Image */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-green-500 font-orbitron text-lg">Modification Image</h3>
              <button 
                type="button"
                onClick={searchModImages}
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
                  alt="Selected modification"
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
                placeholder="https://example.com/modification-image.jpg"
              />
            </div>
          </div>
          
          {/* Description and Notes */}
          <div className="bg-black p-4 rounded-xl border border-gray-800">
            <h3 className="text-green-500 font-orbitron text-lg mb-4">Description & Notes</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Describe the modification, including key features and specifications..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                  placeholder="Any additional notes, details, or special instructions..."
                ></textarea>
              </div>
            </div>
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
                  Add Modification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModificationForm;