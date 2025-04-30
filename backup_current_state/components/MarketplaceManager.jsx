import React, { useState, useEffect } from 'react';
import { 
  Plus, Save, X, Car, Watch, DollarSign, 
  Calendar, MapPin, Star, Info, AlertTriangle
} from 'lucide-react';

const MarketplaceManager = ({ 
  isAdmin, 
  onAddListing, 
  onToggleAdmin 
}) => {
  const emptyWatchForm = {
    type: 'timepiece',
    brand: '',
    model: '',
    reference: '',
    year: new Date().getFullYear(),
    price: '',
    currency: 'USD',
    condition: 'New',
    description: '',
    serialNumber: '',
    boxPapers: true,
    location: '',
    seller: 'Paddock20 Premium',
    sellerRating: 5.0,
    featured: false
  };
  
  const emptyCarForm = {
    type: 'vehicle',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    currency: 'USD',
    mileage: '',
    condition: 'Excellent',
    description: '',
    vin: '',
    engineType: '',
    transmission: '',
    location: '',
    seller: 'Paddock20 Premium',
    sellerRating: 5.0,
    featured: false
  };

  const [formOpen, setFormOpen] = useState(false);
  const [activeForm, setActiveForm] = useState('timepiece');
  const [formData, setFormData] = useState(emptyWatchForm);
  const [formErrors, setFormErrors] = useState({});

  const resetForm = () => {
    setFormData(activeForm === 'timepiece' ? emptyWatchForm : emptyCarForm);
    setFormErrors({});
  };

  useEffect(() => {
    // Reset the form data when the form type changes
    setFormData(activeForm === 'timepiece' ? emptyWatchForm : emptyCarForm);
    setFormErrors({});
  }, [activeForm]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedValue = type === 'checkbox' ? checked : value;
    
    // Handle number inputs
    if (type === 'number') {
      updatedValue = value === '' ? '' : parseFloat(value);
    }

    setFormData({
      ...formData,
      [name]: updatedValue
    });

    // Clear the error for this field when it's being edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['brand', 'model', 'price', 'description'];
    
    // Add type-specific required fields
    if (formData.type === 'timepiece') {
      requiredFields.push('reference');
    } else {
      requiredFields.push('mileage', 'engineType', 'transmission');
    }
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        errors[field] = 'This field is required';
      }
    });
    
    // Validate price
    if (formData.price && isNaN(parseFloat(formData.price))) {
      errors.price = 'Price must be a number';
    } else if (parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    // Validate year
    if (formData.year && (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1)) {
      errors.year = 'Please enter a valid year';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddListing({
        ...formData,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseFloat(formData.mileage) : undefined
      });
      setFormOpen(false);
      resetForm();
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={onToggleAdmin}
          className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Admin Mode
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium text-white">Marketplace Management</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setFormOpen(!formOpen)}
            className="px-4 py-2 bg-blue-900 text-blue-100 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
          >
            {formOpen ? (
              <>
                <X className="h-4 w-4 mr-1" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Listing</span>
              </>
            )}
          </button>
          
          <button
            onClick={onToggleAdmin}
            className="px-4 py-2 bg-gray-900 border border-gray-700 text-red-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Exit Admin Mode
          </button>
        </div>
      </div>
      
      {formOpen && (
        <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium text-white">
              Add New {activeForm === 'timepiece' ? 'Timepiece' : 'Vehicle'} Listing
            </h4>
            
            <div className="flex">
              <button
                onClick={() => setActiveForm('timepiece')}
                className={`px-4 py-2 rounded-l-lg flex items-center ${
                  activeForm === 'timepiece' 
                    ? 'bg-purple-900 text-purple-100' 
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <Watch className="h-4 w-4 mr-1" />
                <span>Watch</span>
              </button>
              
              <button
                onClick={() => setActiveForm('vehicle')}
                className={`px-4 py-2 rounded-r-lg flex items-center ${
                  activeForm === 'vehicle' 
                    ? 'bg-green-900 text-green-100' 
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                <Car className="h-4 w-4 mr-1" />
                <span>Vehicle</span>
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-900 border ${
                    formErrors.brand ? 'border-red-700' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder={activeForm === 'timepiece' ? 'Rolex, Patek Philippe...' : 'Ferrari, Porsche...'}
                />
                {formErrors.brand && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.brand}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Model *</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-gray-900 border ${
                    formErrors.model ? 'border-red-700' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  placeholder={activeForm === 'timepiece' ? 'Submariner, Nautilus...' : '911 Turbo, 458 Italia...'}
                />
                {formErrors.model && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.model}</p>
                )}
              </div>
              
              {activeForm === 'timepiece' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Reference Number *</label>
                  <input
                    type="text"
                    name="reference"
                    value={formData.reference}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-gray-900 border ${
                      formErrors.reference ? 'border-red-700' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="5711/1A-014, 116500LN..."
                  />
                  {formErrors.reference && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.reference}</p>
                  )}
                </div>
              )}
              
              {activeForm === 'timepiece' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Serial Number</label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              )}
              
              {activeForm === 'vehicle' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">VIN</label>
                  <input
                    type="text"
                    name="vin"
                    value={formData.vin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-3 py-2 bg-gray-900 border ${
                    formErrors.year ? 'border-red-700' : 'border-gray-700'
                  } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                />
                {formErrors.year && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.year}</p>
                )}
              </div>
              
              {activeForm === 'vehicle' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Mileage *</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 bg-gray-900 border ${
                      formErrors.mileage ? 'border-red-700' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="12,500"
                  />
                  {formErrors.mileage && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.mileage}</p>
                  )}
                </div>
              )}
              
              {activeForm === 'vehicle' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Engine Type *</label>
                  <input
                    type="text"
                    name="engineType"
                    value={formData.engineType}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-gray-900 border ${
                      formErrors.engineType ? 'border-red-700' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="4.0L Twin-Turbo V8"
                  />
                  {formErrors.engineType && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.engineType}</p>
                  )}
                </div>
              )}
              
              {activeForm === 'vehicle' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Transmission *</label>
                  <select
                    name="transmission"
                    value={formData.transmission}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-gray-900 border ${
                      formErrors.transmission ? 'border-red-700' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                  >
                    <option value="">Select Transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Dual-clutch automatic">Dual-clutch automatic</option>
                    <option value="Semi-automatic">Semi-automatic</option>
                  </select>
                  {formErrors.transmission && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.transmission}</p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Price *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 px-3 py-2 bg-gray-900 border ${
                      formErrors.price ? 'border-red-700' : 'border-gray-700'
                    } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                    placeholder="150000"
                  />
                </div>
                {formErrors.price && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                )}
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Currency</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CHF">CHF</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {activeForm === 'timepiece' ? (
                    <>
                      <option value="New">New</option>
                      <option value="Mint">Mint</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </>
                  ) : (
                    <>
                      <option value="Excellent">Excellent</option>
                      <option value="Very Good">Very Good</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Poor">Poor</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full pl-10 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Miami, FL"
                  />
                </div>
              </div>
              
              {activeForm === 'timepiece' && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="boxPapers"
                    name="boxPapers"
                    checked={formData.boxPapers}
                    onChange={handleInputChange}
                    className="h-4 w-4 bg-gray-900 border border-gray-700 rounded"
                  />
                  <label htmlFor="boxPapers" className="ml-2 text-gray-400 text-sm">
                    Box & Papers Included
                  </label>
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 bg-gray-900 border border-gray-700 rounded"
                />
                <label htmlFor="featured" className="ml-2 text-gray-400 text-sm">
                  Featured Listing
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className={`w-full px-3 py-2 bg-gray-900 border ${
                  formErrors.description ? 'border-red-700' : 'border-gray-700'
                } rounded-lg text-white focus:outline-none focus:border-blue-500`}
                placeholder="Detailed description of the listing..."
              ></textarea>
              {formErrors.description && (
                <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
              )}
            </div>
            
            {/* Note: In production, add image upload functionality here */}
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors mr-2"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-900 text-blue-100 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                <span>Save Listing</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default MarketplaceManager;