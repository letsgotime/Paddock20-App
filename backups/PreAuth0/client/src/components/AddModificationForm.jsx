import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Mic, Video, Upload, MapPin, Link2, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';

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
    notes: '',
    // New media fields
    before_photos: [],
    after_photos: [],
    voice_notes: [],
    videos: [],
    // Location data
    location: {
      enabled: false,
      latitude: null,
      longitude: null,
      address: '',
    },
    // Product information from link
    product_info: {
      extracted: false,
      title: '',
      description: '',
      price: '',
      specifications: [],
      manufacturer: '',
    },
    // Document management
    documents: [], // Array of document objects with metadata
    document_categories: [], // Selected categories for organizing docs
    receipt_included: false, // Flag to indicate if a receipt is included
  });
  
  // Add state for media file uploads and preview
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [gpsLocating, setGpsLocating] = useState(false);
  const [activeTab, setActiveTab] = useState('before'); // 'before' or 'after' photos
  const [productLinkLoading, setProductLinkLoading] = useState(false);
  const [productLinkError, setProductLinkError] = useState('');
  
  // Refs for file inputs and media recording
  const beforePhotoInputRef = useRef(null);
  const afterPhotoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const documentInputRef = useRef(null);

  // Document categories for organization
  const documentCategories = [
    'Receipt',
    'Warranty',
    'Installation Guide',
    'Specification Sheet',
    'Certificate',
    'Insurance',
    'Service Record',
    'Purchase Agreement',
    'Manual',
    'Other'
  ];

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

  // Handle document category selection
  const handleDocumentCategoryChange = (category) => {
    setFormData(prev => {
      const categories = [...prev.document_categories];
      
      if (categories.includes(category)) {
        return {
          ...prev,
          document_categories: categories.filter(c => c !== category)
        };
      } else {
        return {
          ...prev,
          document_categories: [...categories, category]
        };
      }
    });
  };
  
  // Handle document upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Process each uploaded document
    const newDocuments = files.map(file => {
      // Create a new document object with metadata
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      return {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // Create temporary URL for preview
        file: file, // Store the actual file for later upload
        date_added: now.toISOString(),
        year: year,
        month: month,
        categories: [...formData.document_categories], // Assign selected categories
        metadata: {
          lastModified: new Date(file.lastModified).toISOString(),
          extension: file.name.split('.').pop().toLowerCase(),
        }
      };
    });
    
    // Add new documents to the form data
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...newDocuments]
    }));
    
    // Reset the file input
    e.target.value = '';
  };
  
  // Handle before photo upload
  const handleBeforePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Create temporary URLs for preview
    const newPhotos = files.map(file => ({
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    // Add new photos to form data
    setFormData(prev => ({
      ...prev,
      before_photos: [...prev.before_photos, ...newPhotos]
    }));
    
    // Reset the file input
    e.target.value = '';
  };
  
  // Handle after photo upload
  const handleAfterPhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Create temporary URLs for preview
    const newPhotos = files.map(file => ({
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    // Add new photos to form data
    setFormData(prev => ({
      ...prev,
      after_photos: [...prev.after_photos, ...newPhotos]
    }));
    
    // Reset the file input
    e.target.value = '';
  };
  
  // Handle video upload
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Create temporary URLs for preview
    const newVideos = files.map(file => ({
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    // Add new videos to form data
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, ...newVideos]
    }));
    
    // Reset the file input
    e.target.value = '';
  };
  
  // Handle location tracking
  const handleLocationTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setGpsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success callback
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            enabled: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: 'Retrieving address...' // Placeholder until reverse geocoding
          }
        }));
        
        // Here we would typically do reverse geocoding to get the address
        // For now we'll use placeholder text
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              address: `Lat: ${position.coords.latitude.toFixed(6)}, Long: ${position.coords.longitude.toFixed(6)}`
            }
          }));
          setGpsLocating(false);
        }, 1000);
      },
      (error) => {
        // Error callback
        alert(`Error getting location: ${error.message}`);
        setGpsLocating(false);
      }
    );
  };
  
  // Handle product info extraction from URL
  const handleExtractProductInfo = async () => {
    if (!formData.link_url) {
      alert('Please enter a product URL first');
      return;
    }
    
    setProductLinkLoading(true);
    setProductLinkError('');
    
    try {
      // In a real app, this would be an API call to a backend service
      // that scrapes the product information from the URL
      // For demo purposes, we'll simulate this with a timeout
      
      setTimeout(() => {
        // Simulate successful extraction with mock data
        // In production, this would be real data from the API
        const extractedInfo = {
          title: `${formData.brand || 'Brand'} ${formData.name || 'Performance Part'}`,
          description: formData.description || 'High-quality performance component designed to enhance vehicle performance and driving experience.',
          price: formData.cost ? `$${formData.cost}` : '$599.99',
          specifications: [
            'Material: High-grade aluminum',
            'Weight: 3.2 lbs',
            'Fitment: Direct replacement',
            'Warranty: 2 years limited'
          ],
          manufacturer: formData.brand || 'Performance Brands Inc.'
        };
        
        setFormData(prev => ({
          ...prev,
          product_info: {
            ...prev.product_info,
            extracted: true,
            ...extractedInfo
          }
        }));
        
        setProductLinkLoading(false);
      }, 1500);
    } catch (error) {
      setProductLinkError('Failed to extract product information');
      setProductLinkLoading(false);
    }
  };
  
  // Remove a document from the list
  const handleRemoveDocument = (documentId) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));
  };
  
  // Remove a photo (before or after)
  const handleRemovePhoto = (photoId, type) => {
    if (type === 'before') {
      setFormData(prev => ({
        ...prev,
        before_photos: prev.before_photos.filter(photo => photo.id !== photoId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        after_photos: prev.after_photos.filter(photo => photo.id !== photoId)
      }));
    }
  };
  
  // Remove a video
  const handleRemoveVideo = (videoId) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter(video => video.id !== videoId)
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, you would upload all files to storage here
    // and replace the temporary URLs with permanent ones
    
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
          
          {/* Media, Documents and Location Section */}
          <div className="border-t border-gray-800 pt-6">
            <h3 className="text-xl font-orbitron text-blue-400 mb-4">Media & Documentation</h3>
            
            {/* Tabs for different media types */}
            <div className="flex flex-wrap border-b border-gray-800 mb-6">
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium mr-2 ${activeTab === 'before' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('before')}
              >
                Before Photos
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium mr-2 ${activeTab === 'after' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('after')}
              >
                After Photos
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium mr-2 ${activeTab === 'video' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('video')}
              >
                Videos
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium mr-2 ${activeTab === 'documents' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('documents')}
              >
                Documents
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium mr-2 ${activeTab === 'location' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('location')}
              >
                Location
              </button>
              <button
                type="button"
                className={`py-2 px-4 text-sm font-medium ${activeTab === 'productInfo' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('productInfo')}
              >
                Product Info
              </button>
            </div>
            
            {/* Before Photos Tab */}
            {activeTab === 'before' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg text-white">Before Photos</h4>
                  <button
                    type="button"
                    onClick={() => beforePhotoInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md flex items-center text-sm"
                  >
                    <Camera size={16} className="mr-2" />
                    Add Photos
                  </button>
                  <input
                    type="file"
                    ref={beforePhotoInputRef}
                    onChange={handleBeforePhotoUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                {formData.before_photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.before_photos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id, 'before')}
                            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-6 text-center">
                    <p className="text-gray-400 mb-2">No before photos added yet</p>
                    <p className="text-gray-500 text-sm">Add photos showing the vehicle before the modification</p>
                  </div>
                )}
              </div>
            )}
            
            {/* After Photos Tab */}
            {activeTab === 'after' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg text-white">After Photos</h4>
                  <button
                    type="button"
                    onClick={() => afterPhotoInputRef.current?.click()}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-md flex items-center text-sm"
                  >
                    <Camera size={16} className="mr-2" />
                    Add Photos
                  </button>
                  <input
                    type="file"
                    ref={afterPhotoInputRef}
                    onChange={handleAfterPhotoUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                {formData.after_photos.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {formData.after_photos.map(photo => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(photo.id, 'after')}
                            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-6 text-center">
                    <p className="text-gray-400 mb-2">No after photos added yet</p>
                    <p className="text-gray-500 text-sm">Add photos showing the vehicle after the modification</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Videos Tab */}
            {activeTab === 'video' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg text-white">Videos</h4>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md flex items-center text-sm"
                  >
                    <Video size={16} className="mr-2" />
                    Add Videos
                  </button>
                  <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoUpload}
                    multiple
                    accept="video/*"
                    className="hidden"
                  />
                </div>
                
                {formData.videos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.videos.map(video => (
                      <div key={video.id} className="bg-gray-800 border border-gray-700 rounded-md p-3">
                        <div className="relative">
                          <video 
                            src={video.url} 
                            controls 
                            className="w-full h-48 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(video.id)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-400 mt-2 truncate">{video.name}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-6 text-center">
                    <p className="text-gray-400 mb-2">No videos added yet</p>
                    <p className="text-gray-500 text-sm">Add videos of the installation process or the final result</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div>
                <div className="mb-4">
                  <h4 className="text-lg text-white mb-3">Document Categories</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                    {documentCategories.map(category => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          checked={formData.document_categories.includes(category)}
                          onChange={() => handleDocumentCategoryChange(category)}
                          className="mr-2 h-4 w-4 accent-green-500"
                        />
                        <label htmlFor={`category-${category}`} className="text-gray-300 text-sm">{category}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg text-white">Documents</h4>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md flex items-center text-sm"
                    disabled={formData.document_categories.length === 0}
                  >
                    <Upload size={16} className="mr-2" />
                    Add Documents
                  </button>
                  <input
                    type="file"
                    ref={documentInputRef}
                    onChange={handleDocumentUpload}
                    multiple
                    className="hidden"
                  />
                </div>
                
                {formData.document_categories.length === 0 && (
                  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-800 rounded-md p-4 mb-4">
                    <p className="text-yellow-300 text-sm">Please select at least one document category before uploading documents</p>
                  </div>
                )}
                
                {formData.documents.length > 0 ? (
                  <div className="space-y-3">
                    {formData.documents.map(doc => (
                      <div key={doc.id} className="bg-gray-800 border border-gray-700 rounded-md p-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-3 p-2 bg-gray-700 rounded-md">
                            <ExternalLink size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{doc.name}</p>
                            <div className="flex flex-wrap mt-1">
                              {doc.categories.map(cat => (
                                <span key={cat} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full mr-1 mb-1">
                                  {cat}
                                </span>
                              ))}
                              <span className="text-xs text-gray-500 px-2 py-1">
                                {Math.round(doc.size / 1024)} KB
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-6 text-center">
                    <p className="text-gray-400 mb-2">No documents added yet</p>
                    <p className="text-gray-500 text-sm">Add receipts, warranties, manuals, and other related documents</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Location Tab */}
            {activeTab === 'location' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg text-white">GPS Location</h4>
                  <button
                    type="button"
                    onClick={handleLocationTracking}
                    disabled={gpsLocating}
                    className={`${
                      formData.location.enabled
                        ? 'bg-green-600 hover:bg-green-500'
                        : 'bg-blue-600 hover:bg-blue-500'
                    } text-white px-3 py-2 rounded-md flex items-center text-sm`}
                  >
                    <MapPin size={16} className="mr-2" />
                    {gpsLocating ? 'Getting Location...' : (formData.location.enabled ? 'Update Location' : 'Get Location')}
                  </button>
                </div>
                
                {formData.location.enabled ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Latitude</p>
                        <p className="text-white font-mono">{formData.location.latitude?.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Longitude</p>
                        <p className="text-white font-mono">{formData.location.longitude?.toFixed(6)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Address</p>
                      <p className="text-white">{formData.location.address}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-6 text-center">
                    <p className="text-gray-400 mb-2">No location data added yet</p>
                    <p className="text-gray-500 text-sm">Add the location where this modification was installed or purchased</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Product Info Tab */}
            {activeTab === 'productInfo' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg text-white">Product Information</h4>
                  {formData.link_url && (
                    <button
                      type="button"
                      onClick={handleExtractProductInfo}
                      disabled={productLinkLoading}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-md flex items-center text-sm"
                    >
                      <Link2 size={16} className="mr-2" />
                      {productLinkLoading ? 'Extracting...' : 'Extract from URL'}
                    </button>
                  )}
                </div>
                
                {!formData.link_url && (
                  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-800 rounded-md p-4 mb-4">
                    <p className="text-yellow-300 text-sm">Enter a product URL in the "Link URL" field to extract product information</p>
                  </div>
                )}
                
                {productLinkError && (
                  <div className="bg-red-900 bg-opacity-30 border border-red-800 rounded-md p-4 mb-4">
                    <p className="text-red-300 text-sm">{productLinkError}</p>
                  </div>
                )}
                
                {formData.product_info.extracted ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-4">
                    <h5 className="text-white font-medium mb-2">{formData.product_info.title}</h5>
                    <p className="text-gray-300 mb-3">{formData.product_info.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Price</p>
                        <p className="text-white">{formData.product_info.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Manufacturer</p>
                        <p className="text-white">{formData.product_info.manufacturer}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Specifications</p>
                      <ul className="list-disc pl-5 text-gray-300 text-sm space-y-1">
                        {formData.product_info.specifications.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 border border-gray-700 rounded-md p-6 text-center">
                    <p className="text-gray-400 mb-2">No product information extracted yet</p>
                    <p className="text-gray-500 text-sm">Extract product details from the provided URL or enter manually</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-800">
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