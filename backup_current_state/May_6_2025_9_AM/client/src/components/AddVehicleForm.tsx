import React, { useState } from 'react';
import { useVehicle } from '../hooks/useVehicle';

interface AddVehicleFormProps {
  onAddVehicle?: (vehicleData: any) => void;
  onClose?: () => void;
}

/**
 * Form component for adding a new vehicle to the Garage
 */
const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ onAddVehicle, onClose }) => {
  const { addVehicle } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    nickname: '',
    mileage: '0',
    engineType: 'Gasoline',
    transmissionType: 'Automatic',
    color: '#000000',
    purchaseDate: new Date().toISOString().split('T')[0],
    vehicleImage: '',
    vin: ''
  });
  
  const vehicleTypes = [
    { value: 'Gasoline', label: 'Gasoline' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Plug-in Hybrid', label: 'Plug-in Hybrid' }
  ];
  
  const transmissionTypes = [
    { value: 'Automatic', label: 'Automatic' },
    { value: 'Manual', label: 'Manual' },
    { value: 'CVT', label: 'CVT' },
    { value: 'Dual-Clutch', label: 'Dual-Clutch' },
    { value: 'Single-Speed', label: 'Single-Speed (Electric)' }
  ];

  const carMakes = [
    'Acura', 'Alfa Romeo', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Bugatti',
    'Buick', 'Cadillac', 'Chevrolet', 'Chrysler', 'Citroën', 'Dodge', 'Ferrari',
    'Fiat', 'Ford', 'Genesis', 'GMC', 'Honda', 'Hyundai', 'Infiniti', 'Jaguar',
    'Jeep', 'Kia', 'Koenigsegg', 'Lamborghini', 'Land Rover', 'Lexus', 'Lincoln',
    'Lotus', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mini', 'Mitsubishi',
    'Nissan', 'Pagani', 'Polestar', 'Porsche', 'Ram', 'Rolls-Royce', 'Subaru',
    'Tesla', 'Toyota', 'Volkswagen', 'Volvo'
  ];
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use context method to add vehicle
      const newVehicle = await addVehicle(formData);
      
      // If parent provided a callback, call it with the new vehicle data
      if (onAddVehicle) {
        onAddVehicle(newVehicle);
      }
      
      // Clear form and close
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear().toString(),
        nickname: '',
        mileage: '0',
        engineType: 'Gasoline',
        transmissionType: 'Automatic',
        color: '#000000',
        purchaseDate: new Date().toISOString().split('T')[0],
        vehicleImage: '',
        vin: ''
      });
      
      // Close the form if provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-center mb-6">Add New Vehicle</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Make */}
        <div className="space-y-2">
          <label htmlFor="make" className="block text-sm font-medium">
            Make <span className="text-red-500">*</span>
          </label>
          <select
            id="make"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          >
            <option value="">Select Make</option>
            {carMakes.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>
        
        {/* Vehicle Model */}
        <div className="space-y-2">
          <label htmlFor="model" className="block text-sm font-medium">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Year */}
        <div className="space-y-2">
          <label htmlFor="year" className="block text-sm font-medium">
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
            required
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          />
        </div>
        
        {/* Nickname */}
        <div className="space-y-2">
          <label htmlFor="nickname" className="block text-sm font-medium">
            Nickname
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          />
        </div>
        
        {/* Current Mileage */}
        <div className="space-y-2">
          <label htmlFor="mileage" className="block text-sm font-medium">
            Current Mileage <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            required
            min="0"
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Engine Type */}
        <div className="space-y-2">
          <label htmlFor="engineType" className="block text-sm font-medium">
            Engine Type
          </label>
          <select
            id="engineType"
            name="engineType"
            value={formData.engineType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          >
            {vehicleTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        {/* Transmission */}
        <div className="space-y-2">
          <label htmlFor="transmissionType" className="block text-sm font-medium">
            Transmission
          </label>
          <select
            id="transmissionType"
            name="transmissionType"
            value={formData.transmissionType}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          >
            {transmissionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        {/* Color */}
        <div className="space-y-2">
          <label htmlFor="color" className="block text-sm font-medium">
            Color
          </label>
          <div className="flex items-center">
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-12 h-9 border-0 rounded-md bg-gray-800 mr-2"
            />
            <input
              type="text"
              value={formData.color}
              onChange={handleChange}
              name="color"
              className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
              placeholder="#000000 or Black"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Purchase Date */}
        <div className="space-y-2">
          <label htmlFor="purchaseDate" className="block text-sm font-medium">
            Purchase Date
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          />
        </div>
        
        {/* VIN */}
        <div className="space-y-2">
          <label htmlFor="vin" className="block text-sm font-medium">
            VIN (Vehicle Identification Number)
          </label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
          />
        </div>
      </div>
      
      {/* Vehicle Image */}
      <div className="space-y-2">
        <label htmlFor="vehicleImage" className="block text-sm font-medium">
          Vehicle Image URL
        </label>
        <input
          type="text"
          id="vehicleImage"
          name="vehicleImage"
          value={formData.vehicleImage}
          onChange={handleChange}
          placeholder="https://example.com/my-car-image.jpg"
          className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white"
        />
        <p className="text-sm text-gray-400">
          Enter a direct URL to an image of your vehicle. Leave blank to use a default image.
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default AddVehicleForm;