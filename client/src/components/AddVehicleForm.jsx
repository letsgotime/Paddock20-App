import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Camera, Upload, MapPin, X, Calendar, PlusCircle } from "lucide-react";

// Import existing images from assets
import porschePath from "@assets/Ferrari-458-With-HRE-P101-Wheels-By-TAG-Motorsports-2.jpg";
import audiPath from "@assets/Copy of IMG_4475.jpg";
import ferrariPath from "@assets/AAFuWkQu2jM_1741439529758.jpg";
import mercedesPath from "@assets/AAFuWkQu2jM_1742366729990.jpg";

const vehicleMakes = [
  "Audi", "BMW", "Ferrari", "Ford", "Lamborghini", "Mercedes-Benz", 
  "Porsche", "Tesla", "Toyota", "Volkswagen", "Other"
];

const vehicleStatuses = ["Active", "Stored", "Sold", "Project"];

const AddVehicleForm = ({ onSubmit, onCancel }) => {
  const [vehicle, setVehicle] = useState({
    id: uuidv4(),
    make: "",
    model: "",
    year: new Date().getFullYear(),
    trim: "",
    vin: "",
    license_plate: "",
    color: "",
    image_url: "",
    purchase_date: "",
    purchase_price: "",
    current_value: "",
    status: "Active",
    notes: "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadType, setUploadType] = useState("take"); // take, upload, gallery
  const [showGallery, setShowGallery] = useState(false);
  
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicle({
      ...vehicle,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadType("upload");
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadType("take");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // For demo, if no real image was uploaded, use a sample image based on make
    let finalVehicle = { ...vehicle };
    
    if (!previewUrl) {
      // Assign a default image based on the make
      if (vehicle.make.toLowerCase().includes("porsche")) {
        finalVehicle.image_url = porschePath;
      } else if (vehicle.make.toLowerCase().includes("audi")) {
        finalVehicle.image_url = audiPath;
      } else if (vehicle.make.toLowerCase().includes("ferrari")) {
        finalVehicle.image_url = ferrariPath;
      } else if (vehicle.make.toLowerCase().includes("mercedes")) {
        finalVehicle.image_url = mercedesPath;
      } else {
        // Default image if no match
        finalVehicle.image_url = porschePath;
      }
    } else {
      // In a real app, we would upload the file to storage
      // For now, just use the preview URL
      finalVehicle.image_url = previewUrl;
    }
    
    onSubmit(finalVehicle);
  };
  
  const handleGallerySelect = (imagePath) => {
    setVehicle({
      ...vehicle,
      image_url: imagePath
    });
    setPreviewUrl(imagePath);
    setShowGallery(false);
    setUploadType("gallery");
  };

  const galleryImages = [
    { path: porschePath, label: "Porsche 911" },
    { path: audiPath, label: "Audi R8" },
    { path: ferrariPath, label: "Ferrari 458" },
    { path: mercedesPath, label: "Mercedes AMG" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Image */}
      <div className="mb-6">
        <label className="block text-blue-400 mb-2">Vehicle Image</label>
        <div className="h-64 bg-gray-800 rounded-lg overflow-hidden relative mb-2">
          {previewUrl ? (
            <div className="relative h-full">
              <img 
                src={previewUrl} 
                alt="Vehicle preview" 
                className="w-full h-full object-cover"
              />
              <button 
                type="button"
                onClick={() => {
                  setPreviewUrl("");
                  setImageFile(null);
                }}
                className="absolute top-2 right-2 bg-black/70 p-1 rounded-full"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-3">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-center mb-2">Drop an image here or</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center text-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current.click()}
                  className="px-3 py-2 bg-blue-900/70 text-white rounded hover:bg-blue-800 flex items-center text-sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Photo
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowGallery(true)}
                className="mt-3 text-blue-400 text-sm hover:underline"
              >
                Choose from gallery
              </button>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <input 
            type="file" 
            ref={cameraInputRef}
            onChange={handleCameraCapture}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
        </div>
        <p className="text-gray-500 text-xs">
          This photo will be displayed on your garage dashboard.
        </p>
      </div>
      
      {/* Modal Gallery */}
      {showGallery && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-2xl">
            <div className="border-b border-gray-800 p-4 flex justify-between items-center">
              <h3 className="text-blue-400">Select a Vehicle Image</h3>
              <button 
                type="button"
                onClick={() => setShowGallery(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="cursor-pointer hover:opacity-80 transition-opacity rounded-lg overflow-hidden"
                    onClick={() => handleGallerySelect(image.path)}
                  >
                    <div className="h-32 relative">
                      <img 
                        src={image.path} 
                        alt={image.label} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <span className="text-white text-sm">{image.label}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div>
          <h3 className="text-blue-400 font-medium mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Make*</label>
              <select
                name="make"
                value={vehicle.make}
                onChange={handleInputChange}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              >
                <option value="">Select a make</option>
                {vehicleMakes.map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Model*</label>
              <input
                type="text"
                name="model"
                value={vehicle.model}
                onChange={handleInputChange}
                required
                placeholder="e.g. 911, Model 3, M4"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Year*</label>
              <input
                type="number"
                name="year"
                value={vehicle.year}
                onChange={handleInputChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Trim/Version</label>
              <input
                type="text"
                name="trim"
                value={vehicle.trim}
                onChange={handleInputChange}
                placeholder="e.g. Turbo S, Performance, Competition"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Color</label>
              <input
                type="text"
                name="color"
                value={vehicle.color}
                onChange={handleInputChange}
                placeholder="e.g. Midnight Silver, Guards Red"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Additional Info */}
        <div>
          <h3 className="text-blue-400 font-medium mb-4">Additional Details</h3>
          
          <div className="space-y-4">
            <div className="form-group">
              <label className="block text-gray-400 mb-1">VIN</label>
              <input
                type="text"
                name="vin"
                value={vehicle.vin}
                onChange={handleInputChange}
                placeholder="Vehicle Identification Number"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">License Plate</label>
              <input
                type="text"
                name="license_plate"
                value={vehicle.license_plate}
                onChange={handleInputChange}
                placeholder="License Plate Number"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Purchase Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="purchase_date"
                  value={vehicle.purchase_date}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Purchase Price ($)</label>
              <input
                type="number"
                name="purchase_price"
                value={vehicle.purchase_price}
                onChange={handleInputChange}
                min="0"
                placeholder="e.g. 55000"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-gray-400 mb-1">Status</label>
              <select
                name="status"
                value={vehicle.status}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
              >
                {vehicleStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes */}
      <div className="form-group">
        <label className="block text-gray-400 mb-1">Notes</label>
        <textarea
          name="notes"
          value={vehicle.notes}
          onChange={handleInputChange}
          rows="4"
          placeholder="Add any additional notes about this vehicle..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white"
        ></textarea>
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Vehicle
        </button>
      </div>
    </form>
  );
};

export default AddVehicleForm;