import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddVehicleForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    color: '',
    vin: '',
    nickname: '',
    engine: '',
    transmission: '',
    mileage: '',
    license_plate: '',
    purchase_date: '',
    insurance_renewal: '',
    registration_renewal: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-green-500 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-orbitron text-blue-400">Add Vehicle</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Vehicle Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Make*</label>
                <input
                  type="text"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Model*</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Year*</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Trim</label>
                <input
                  type="text"
                  name="trim"
                  value={formData.trim}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Nickname</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
            </div>
            
            {/* Additional Vehicle Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">VIN</label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  maxLength="17"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Engine</label>
                <input
                  type="text"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Transmission</label>
                <input
                  type="text"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Mileage</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  min="0"
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">License Plate</label>
                <input
                  type="text"
                  name="license_plate"
                  value={formData.license_plate}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                />
              </div>
            </div>
          </div>
          
          {/* Dates and Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-300 mb-2">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Insurance Renewal</label>
              <input
                type="date"
                name="insurance_renewal"
                value={formData.insurance_renewal}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Registration Renewal</label>
              <input
                type="date"
                name="registration_renewal"
                value={formData.registration_renewal}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-gray-300 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
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
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleForm;