import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddModificationForm = ({ onSubmit, onCancel, vehicleId }) => {
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
    affected_systems: [],
    image_url: '',
    link_url: '',
    link_label: '',
    notes: ''
  });

  const modificationTypes = [
    'Performance',
    'Aesthetic',
    'Wheels & Suspension',
    'Electronics',
    'Lighting',
    'Interior',
    'Exhaust',
    'Intake',
    'Engine',
    'Brakes',
    'Other'
  ];

  const statusOptions = [
    'Installed',
    'Planned',
    'In Progress',
    'Removed'
  ];

  const systemOptions = [
    'Engine',
    'Transmission',
    'Suspension',
    'Brakes',
    'Exhaust',
    'Intake',
    'Electrical',
    'Body',
    'Interior',
    'Cooling',
    'Fuel',
    'Electronics'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSystemChange = (system) => {
    setFormData(prev => {
      const systems = [...prev.affected_systems];
      
      if (systems.includes(system)) {
        return {
          ...prev,
          affected_systems: systems.filter(s => s !== system)
        };
      } else {
        return {
          ...prev,
          affected_systems: [...systems, system]
        };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      vehicleId: vehicleId
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-orbitron text-blue-400">Add Modification</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Modification Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Modification Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Type*</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                >
                  {modificationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Part Number</label>
                <input
                  type="text"
                  name="part_number"
                  value={formData.part_number}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
            </div>
            
            {/* Additional Modification Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Installation Date</label>
                <input
                  type="date"
                  name="installation_date"
                  value={formData.installation_date}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Installation Location</label>
                <input
                  type="text"
                  name="installation_location"
                  value={formData.installation_location}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Cost</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Installer</label>
                <input
                  type="text"
                  name="installer"
                  value={formData.installer}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Warranty Expiration</label>
                <input
                  type="date"
                  name="warranty_expires"
                  value={formData.warranty_expires}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Status and Systems */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Image URL</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
          </div>
          
          {/* Hyperlink */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Link URL</label>
              <input
                type="url"
                name="link_url"
                value={formData.link_url}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Link Label</label>
              <input
                type="text"
                name="link_label"
                value={formData.link_label}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
          </div>
          
          {/* Affected Systems */}
          <div>
            <label className="block text-gray-300 mb-2">Affected Systems</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {systemOptions.map(system => (
                <div key={system} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`system-${system}`}
                    checked={formData.affected_systems.includes(system)}
                    onChange={() => handleSystemChange(system)}
                    className="mr-2 h-4 w-4 accent-green-500"
                  />
                  <label htmlFor={`system-${system}`} className="text-gray-300">{system}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
            ></textarea>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-gray-300 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
            >
              Add Modification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModificationForm;