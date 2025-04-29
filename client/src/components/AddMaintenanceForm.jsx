import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';

const AddMaintenanceForm = ({ onSubmit, onCancel, vehicleId }) => {
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceDate: '',
    mileage: '',
    serviceCost: '',
    serviceProvider: '',
    notes: '',
    receipts: [] // Will store file URLs
  });

  const serviceTypes = [
    'Oil Change',
    'Tire Rotation',
    'Brake Service',
    'Air Filter',
    'Cabin Filter',
    'Transmission Service',
    'Engine Tune-Up',
    'Wheel Alignment',
    'Coolant Flush',
    'Battery Replacement',
    'Spark Plugs',
    'Fuel System',
    'Diagnostic',
    'Inspection',
    'Detailing',
    'Other'
  ];

  // For a real app, this would handle file uploads to a storage service
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Simulates a file upload progress
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    setIsUploading(true);
    setFileUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setFileUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Create file URLs (in a real app, these would be from your server/storage)
          const newFiles = files.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size,
            url: URL.createObjectURL(file) // In a real app, this would be the uploaded file URL
          }));
          
          setUploadedFiles(prev => [...prev, ...newFiles]);
          
          // Update form data with new receipt URLs
          setFormData(prev => ({
            ...prev,
            receipts: [...prev.receipts, ...newFiles.map(f => f.url)]
          }));
          
          return 0;
        }
        return prev + 5;
      });
    }, 100);
  };

  const removeFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    
    const newReceipts = [...formData.receipts];
    newReceipts.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      receipts: newReceipts
    }));
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
          <h2 className="text-xl font-orbitron text-blue-400">Add Maintenance Record</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Type */}
            <div>
              <label className="block text-gray-300 mb-2">Service Type*</label>
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              >
                <option value="">Select Service Type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Service Date */}
            <div>
              <label className="block text-gray-300 mb-2">Service Date*</label>
              <input
                type="date"
                name="serviceDate"
                value={formData.serviceDate}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mileage */}
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
            
            {/* Service Cost */}
            <div>
              <label className="block text-gray-300 mb-2">Service Cost</label>
              <input
                type="number"
                name="serviceCost"
                value={formData.serviceCost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
              />
            </div>
            
            {/* Service Provider */}
            <div>
              <label className="block text-gray-300 mb-2">Service Provider</label>
              <input
                type="text"
                name="serviceProvider"
                value={formData.serviceProvider}
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
          
          {/* Receipt Uploads */}
          <div>
            <label className="block text-gray-300 mb-2">Upload Receipts</label>
            <div className="border border-dashed border-gray-600 rounded-md p-6 text-center bg-gray-800/50">
              <input
                type="file"
                id="receipt-upload"
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept="image/*,.pdf"
              />
              <label
                htmlFor="receipt-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload size={32} className="text-gray-400 mb-2" />
                <p className="text-gray-300">Drag and drop files here or click to browse</p>
                <p className="text-gray-500 text-sm mt-1">Supports images and PDF documents</p>
              </label>
            </div>
            
            {isUploading && (
              <div className="mt-4">
                <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${fileUploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-1">Uploading: {fileUploadProgress}%</p>
              </div>
            )}
            
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-gray-300 font-medium">Uploaded Files</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
                      <div className="flex items-center">
                        <div className="text-white">{file.name}</div>
                        <div className="text-gray-500 text-sm ml-2">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              disabled={isUploading}
            >
              Add Maintenance Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMaintenanceForm;