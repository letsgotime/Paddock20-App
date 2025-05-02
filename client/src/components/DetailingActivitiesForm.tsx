import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle,
  Clock,
  Camera,
  Paintbrush,
  Car,
  Save,
  Upload,
  Mic,
  Video,
  X,
  File,
  AlertCircle,
  Sparkles,
  SparkleIcon,
  Calendar,
  Flame
} from 'lucide-react';
import { useRewards } from '../contexts/RewardsContext';

interface DetailingActivity {
  id: string;
  type: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
  products: string[];
  steps: {
    id: string;
    name: string;
    completed: boolean;
  }[];
  photos: {
    id: string;
    url: string;
    name: string;
  }[];
  videos: {
    id: string;
    url: string;
    name: string;
  }[];
  documents: {
    id: string;
    url: string;
    name: string;
    type: string;
  }[];
  voiceNotes: {
    id: string;
    url: string;
    duration: number;
  }[];
  duration: number;
  pointsEarned: number;
}

interface DetailingActivitiesFormProps {
  onSubmit: (activity: DetailingActivity) => void;
  onCancel: () => void;
}

const DETAILING_TYPES = [
  'Wash',
  'Clay Bar Treatment',
  'Polish',
  'Wax',
  'Ceramic Coating',
  'Interior Cleaning',
  'Leather Treatment',
  'Paint Correction',
  'Wheel Cleaning',
  'Engine Bay Detailing',
  'Glass Cleaning',
  'Paint Protection Film',
  'Headlight Restoration',
  'Chrome Polishing',
  'Trim Restoration',
  'Other'
];

// Pre-defined steps for common detailing activities
const DETAILING_STEPS = {
  'Wash': [
    { id: 'rinse1', name: 'Pre-rinse vehicle' },
    { id: 'soap', name: 'Apply soap with foam cannon/mitt' },
    { id: 'wheels', name: 'Clean wheels and tires' },
    { id: 'wash', name: 'Wash vehicle using two-bucket method' },
    { id: 'rinse2', name: 'Rinse thoroughly' },
    { id: 'dry', name: 'Dry with microfiber towel' }
  ],
  'Clay Bar Treatment': [
    { id: 'wash', name: 'Wash vehicle thoroughly' },
    { id: 'lubricate', name: 'Apply clay lubricant' },
    { id: 'clay', name: 'Use clay bar on all painted surfaces' },
    { id: 'inspect', name: 'Inspect for contaminant removal' },
    { id: 'rinse', name: 'Rinse and dry vehicle' }
  ],
  'Ceramic Coating': [
    { id: 'wash', name: 'Wash and decontaminate' },
    { id: 'clay', name: 'Clay bar treatment' },
    { id: 'polish', name: 'Polish to remove imperfections' },
    { id: 'ipa', name: 'IPA wipedown' },
    { id: 'apply', name: 'Apply ceramic coating' },
    { id: 'level', name: 'Level coating and remove excess' },
    { id: 'cure', name: 'Allow proper curing time' }
  ]
};

// Product examples for each detailing type
const PRODUCT_SUGGESTIONS = {
  'Wash': ['Foam Cannon', 'Car Shampoo', 'Microfiber Wash Mitt', 'Drying Towel'],
  'Clay Bar Treatment': ['Clay Bar', 'Clay Lubricant', 'Microfiber Towel'],
  'Ceramic Coating': ['Ceramic Coating', 'Applicator', 'Microfiber Suede Cloth', 'IPA Solution'],
  'Polish': ['Dual Action Polisher', 'Polish Compound', 'Polishing Pads', 'Microfiber Towels']
};

const DetailingActivitiesForm: React.FC<DetailingActivitiesFormProps> = ({ onSubmit, onCancel }) => {
  const [activity, setActivity] = useState<DetailingActivity>({
    id: `detail_${Date.now()}`,
    type: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    completed: false,
    products: [],
    steps: [],
    photos: [],
    videos: [],
    documents: [],
    voiceNotes: [],
    duration: 0,
    pointsEarned: 0
  });

  const [newProduct, setNewProduct] = useState('');
  const [currentStreak, setCurrentStreak] = useState(7); // Mock streak for UI
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // File input references
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Rewards context for points
  const { addPoints } = useRewards();

  // Update steps when detailing type changes
  useEffect(() => {
    if (activity.type && DETAILING_STEPS[activity.type]) {
      setActivity(prev => ({
        ...prev,
        steps: DETAILING_STEPS[activity.type].map(step => ({
          ...step,
          completed: false
        })),
        title: `${activity.type} - ${new Date().toLocaleDateString()}`
      }));
    }
  }, [activity.type]);

  // Update suggested products when type changes
  useEffect(() => {
    if (activity.type && PRODUCT_SUGGESTIONS[activity.type]) {
      setActivity(prev => ({
        ...prev,
        products: PRODUCT_SUGGESTIONS[activity.type]
      }));
    }
  }, [activity.type]);

  // Calculate points based on activity type and completion
  useEffect(() => {
    let points = 0;
    
    // Base points for different activity types
    if (activity.type === 'Wash') points = 20;
    else if (activity.type === 'Clay Bar Treatment') points = 35;
    else if (activity.type === 'Ceramic Coating') points = 100;
    else if (activity.type === 'Polish') points = 50;
    else points = 25;
    
    // Bonus points for documentation
    if (activity.photos.length > 0) points += 5;
    if (activity.videos.length > 0) points += 10;
    if (activity.documents.length > 0) points += 5;
    if (activity.voiceNotes.length > 0) points += 5;
    
    // Bonus for completing all steps
    const allStepsCompleted = activity.steps.length > 0 && 
      activity.steps.every(step => step.completed);
    
    if (allStepsCompleted) points += 15;
    
    setActivity(prev => ({
      ...prev,
      pointsEarned: points
    }));
  }, [
    activity.type, 
    activity.photos.length, 
    activity.videos.length, 
    activity.documents.length, 
    activity.voiceNotes.length,
    activity.steps
  ]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivity({
      ...activity,
      type: e.target.value
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setActivity({
      ...activity,
      [name]: value
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.trim()) return;
    
    setActivity({
      ...activity,
      products: [...activity.products, newProduct.trim()]
    });
    
    setNewProduct('');
  };

  const handleRemoveProduct = (index: number) => {
    setActivity({
      ...activity,
      products: activity.products.filter((_, i) => i !== index)
    });
  };

  const handleStepToggle = (stepId: string) => {
    setActivity({
      ...activity,
      steps: activity.steps.map(step => 
        step.id === stepId 
          ? { ...step, completed: !step.completed } 
          : step
      )
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Create photo objects with temporary URLs for preview
    const newPhotos = files.map(file => ({
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    setActivity({
      ...activity,
      photos: [...activity.photos, ...newPhotos]
    });
    
    // Reset input
    if (e.target) e.target.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Create video objects with temporary URLs for preview
    const newVideos = files.map(file => ({
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    
    setActivity({
      ...activity,
      videos: [...activity.videos, ...newVideos]
    });
    
    // Reset input
    if (e.target) e.target.value = '';
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    // Create document objects with temporary URLs for preview
    const newDocuments = files.map(file => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type
    }));
    
    setActivity({
      ...activity,
      documents: [...activity.documents, ...newDocuments]
    });
    
    // Reset input
    if (e.target) e.target.value = '';
  };

  const simulateVoiceRecording = () => {
    setIsRecordingVoice(true);
    
    // Simulate voice recording for 3 seconds
    setTimeout(() => {
      setIsRecordingVoice(false);
      
      // Add a mock voice note
      const newVoiceNote = {
        id: `voice_${Date.now()}`,
        url: '#', // In a real app, this would be a real audio URL
        duration: Math.floor(Math.random() * 60) + 10 // Random duration between 10-70 seconds
      };
      
      setActivity({
        ...activity,
        voiceNotes: [...activity.voiceNotes, newVoiceNote]
      });
    }, 3000);
  };

  const removePhoto = (photoId: string) => {
    setActivity({
      ...activity,
      photos: activity.photos.filter(photo => photo.id !== photoId)
    });
  };

  const removeVideo = (videoId: string) => {
    setActivity({
      ...activity,
      videos: activity.videos.filter(video => video.id !== videoId)
    });
  };

  const removeDocument = (docId: string) => {
    setActivity({
      ...activity,
      documents: activity.documents.filter(doc => doc.id !== docId)
    });
  };

  const removeVoiceNote = (noteId: string) => {
    setActivity({
      ...activity,
      voiceNotes: activity.voiceNotes.filter(note => note.id !== noteId)
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    // Set completed based on steps
    const allStepsCompleted = activity.steps.length > 0 && 
      activity.steps.every(step => step.completed);
    
    const finalActivity = {
      ...activity,
      completed: allStepsCompleted
    };
    
    // Add points to user's rewards
    if (addPoints) {
      addPoints(activity.pointsEarned, `Completed ${activity.type} detailing activity`);
    }
    
    onSubmit(finalActivity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-blue-900/30 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-orbitron text-blue-400 flex items-center">
            <SparkleIcon className="h-5 w-5 mr-2 text-amber-400" />
            Detailing Activity Log
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Daily streak indicator */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-gray-300 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Today: {new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Flame className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-orange-400 font-semibold">{currentStreak} day streak</span>
            </div>
          </div>
          
          {/* Points indicator */}
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <AlertCircle className="text-blue-400 h-5 w-5 mr-3 mt-0.5" />
              <div>
                <h3 className="text-blue-400 font-medium">Points for this activity: {activity.pointsEarned}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Complete all steps and add documentation to earn maximum points!
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Detailing Type */}
            <div>
              <label className="block text-gray-300 mb-2">Detailing Type*</label>
              <select
                value={activity.type}
                onChange={handleTypeChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                {DETAILING_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            {/* Date */}
            <div>
              <label className="block text-gray-300 mb-2">Date*</label>
              <input
                type="date"
                name="date"
                value={activity.date}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Title and Description */}
          <div>
            <label className="block text-gray-300 mb-2">Title*</label>
            <input
              type="text"
              name="title"
              value={activity.title}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4"
              placeholder="Give your detailing session a title"
              required
            />
            
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={activity.description}
              onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={3}
              placeholder="Describe the detailing process, results, or any notes"
            />
          </div>
          
          {/* Steps Checklist - Only shown if steps are available */}
          {activity.steps.length > 0 && (
            <div className="border border-gray-800 rounded-md p-4">
              <h3 className="text-amber-400 text-sm mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Process Steps
              </h3>
              <div className="space-y-2">
                {activity.steps.map(step => (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleStepToggle(step.id)}
                      className="mr-3"
                    >
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-600 hover:border-green-400" />
                      )}
                    </button>
                    <span className={step.completed ? 'text-white' : 'text-gray-400'}>
                      {step.name}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="text-white font-medium mb-1">Completion Status</h5>
                    {activity.steps.every(step => step.completed) ? (
                      <div className="flex items-center text-green-400">
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        <span>All steps completed! Great work!</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-400">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <span>
                          {activity.steps.filter(step => step.completed).length} of {activity.steps.length} steps completed
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Products Used */}
          <div className="border border-gray-800 rounded-md p-4">
            <h3 className="text-amber-400 text-sm mb-3 flex items-center">
              <Paintbrush className="h-4 w-4 mr-2" />
              Products Used
            </h3>
            
            <div className="flex mb-4">
              <input
                type="text"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                placeholder="Enter product name"
                className="flex-grow bg-gray-800 border border-gray-700 rounded-l-md py-2 px-3 text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddProduct}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-r-md"
              >
                Add
              </button>
            </div>
            
            {activity.products.length > 0 ? (
              <div className="space-y-2">
                {activity.products.map((product, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-800/50 p-2 rounded-md">
                    <span className="text-white">{product}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No products added yet</p>
            )}
          </div>
          
          {/* Media & Documentation */}
          <div className="border border-gray-800 rounded-md p-4">
            <h3 className="text-amber-400 text-sm mb-3">Media & Documentation</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-md flex flex-col items-center justify-center h-24"
              >
                <Camera className="h-6 w-6 mb-2 text-blue-400" />
                <span className="text-sm">Add Photos</span>
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
              </button>
              
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-md flex flex-col items-center justify-center h-24"
              >
                <Video className="h-6 w-6 mb-2 text-green-400" />
                <span className="text-sm">Add Videos</span>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  className="hidden"
                  accept="video/*"
                  multiple
                />
              </button>
              
              <button
                type="button"
                onClick={() => documentInputRef.current?.click()}
                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-md flex flex-col items-center justify-center h-24"
              >
                <File className="h-6 w-6 mb-2 text-purple-400" />
                <span className="text-sm">Add Documents</span>
                <input
                  type="file"
                  ref={documentInputRef}
                  onChange={handleDocumentUpload}
                  className="hidden"
                  multiple
                />
              </button>
              
              <button
                type="button"
                onClick={simulateVoiceRecording}
                disabled={isRecordingVoice}
                className={`bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-md flex flex-col items-center justify-center h-24 ${isRecordingVoice ? 'bg-red-900/30 animate-pulse' : ''}`}
              >
                <Mic className={`h-6 w-6 mb-2 ${isRecordingVoice ? 'text-red-400' : 'text-orange-400'}`} />
                <span className="text-sm">
                  {isRecordingVoice ? 'Recording...' : 'Add Voice Note'}
                </span>
              </button>
            </div>
            
            {/* Photos Preview */}
            {activity.photos.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white text-sm mb-2">Photos ({activity.photos.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {activity.photos.map(photo => (
                    <div key={photo.id} className="relative group">
                      <img 
                        src={photo.url} 
                        alt={photo.name} 
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-black bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Videos Preview */}
            {activity.videos.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white text-sm mb-2">Videos ({activity.videos.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {activity.videos.map(video => (
                    <div key={video.id} className="bg-gray-800 p-2 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <Video className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-white text-sm truncate">{video.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(video.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Documents Preview */}
            {activity.documents.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white text-sm mb-2">Documents ({activity.documents.length})</h4>
                <div className="grid grid-cols-1 gap-2">
                  {activity.documents.map(doc => (
                    <div key={doc.id} className="bg-gray-800 p-2 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-purple-400 mr-2" />
                        <span className="text-white text-sm truncate">{doc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Voice Notes Preview */}
            {activity.voiceNotes.length > 0 && (
              <div>
                <h4 className="text-white text-sm mb-2">Voice Notes ({activity.voiceNotes.length})</h4>
                <div className="grid grid-cols-1 gap-2">
                  {activity.voiceNotes.map(note => (
                    <div key={note.id} className="bg-gray-800 p-2 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <Mic className="h-5 w-5 text-orange-400 mr-2" />
                        <span className="text-white text-sm">Voice Note ({formatDuration(note.duration)})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVoiceNote(note.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-between pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center"
              disabled={!activity.type || !activity.title}
            >
              <Save className="h-5 w-5 mr-2" />
              Save Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailingActivitiesForm;