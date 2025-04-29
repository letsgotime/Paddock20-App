import React, { useState, useRef } from 'react';
import { Goal, GoalMedia } from '../../types/manifestation';
import { 
  ImageIcon,
  Link as LinkIcon,
  Camera,
  ArrowRight,
  Sparkles,
  Target,
  PlusCircle,
  Upload,
  Calendar,
  DollarSign,
  Save
} from 'lucide-react';

interface NewDreamComponentProps {
  onDreamCreated: (newGoal: Goal) => void;
}

const NewDreamComponent: React.FC<NewDreamComponentProps> = ({ onDreamCreated }) => {
  const [step, setStep] = useState<number>(1);
  const [dreamImage, setDreamImage] = useState<string>('');
  const [imageSource, setImageSource] = useState<'upload' | 'link' | ''>('');
  const [imageLink, setImageLink] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Dream details
  const [dreamDetails, setDreamDetails] = useState<Partial<Goal>>({
    goalName: '',
    goalType: '',
    targetAsset: '',
    targetDate: '',
    targetAmount: 0,
    currentAmount: 0,
    description: '',
    fundingPlan: '',
    mindFocus: '',
    bodyFocus: '',
    spiritFocus: '',
    manifestStatus: 'new',
    progressPercentage: 0,
    milestones: [],
    completedMilestones: [],
    budgetEntries: [],
    mediaGallery: []
  });
  
  // Handle file upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // For demo purposes, we'll just use a placeholder URL
    // In a real app, you would upload this to a storage service
    const objectUrl = URL.createObjectURL(file);
    setDreamImage(objectUrl);
    
    // Update dream image
    setImageSource('upload');
    
    // Clean up the file input
    event.target.value = '';
  };
  
  // Handle image link
  const handleImageLink = () => {
    if (!imageLink.trim()) return;
    
    setDreamImage(imageLink);
    setImageSource('link');
  };
  
  // Update dream details
  const updateDreamDetails = (field: string, value: any) => {
    setDreamDetails({
      ...dreamDetails,
      [field]: value
    });
  };
  
  // Create the dream
  const createDream = () => {
    // Generate a new unique ID
    const newId = Date.now();
    
    // Create a new goal
    const newGoal: Goal = {
      id: newId,
      goalName: dreamDetails.goalName || 'New Dream',
      goalType: dreamDetails.goalType || 'Vehicle',
      targetAsset: dreamDetails.targetAsset || '',
      targetDate: dreamDetails.targetDate || new Date(Date.now() + 31536000000).toISOString().split('T')[0], // Default: 1 year from now
      fundingPlan: dreamDetails.fundingPlan || '',
      mindFocus: dreamDetails.mindFocus || '',
      bodyFocus: dreamDetails.bodyFocus || '',
      spiritFocus: dreamDetails.spiritFocus || '',
      milestones: [],
      completedMilestones: [],
      manifestStatus: 'new',
      description: dreamDetails.description || '',
      progressPercentage: 0,
      targetAmount: dreamDetails.targetAmount || 0,
      currentAmount: 0,
      budgetEntries: [],
      mediaGallery: []
    };
    
    // Add the dream image if available
    if (dreamImage) {
      const imageMedia: GoalMedia = {
        id: Date.now(),
        type: 'image',
        name: 'Dream visualization',
        url: dreamImage,
        dateAdded: new Date().toISOString(),
        tags: ['before', 'dream'],
        isInspirational: true
      };
      
      newGoal.mediaGallery.push(imageMedia);
    }
    
    // Create the dream
    onDreamCreated(newGoal);
  };
  
  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl text-blue-400 font-orbitron mb-2">VISUALIZE YOUR DREAM</h3>
            <p className="text-gray-300">
              Start by adding an image of what you want to manifest. This will become your 
              "before" picture and a powerful visual anchor for your manifestation journey.
            </p>
            
            <div className="bg-gray-800 rounded-lg p-6">
              {dreamImage ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <img 
                      src={dreamImage} 
                      alt="Dream visualization" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-400">
                      {imageSource === 'upload' 
                        ? 'Uploaded image' 
                        : 'Linked image'}
                    </p>
                    <button
                      onClick={() => {
                        setDreamImage('');
                        setImageSource('');
                        setImageLink('');
                      }}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center bg-gray-900 rounded-lg p-6 border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors"
                    >
                      <Upload className="h-12 w-12 text-gray-500 mb-2" />
                      <span className="text-gray-300 font-medium">Upload Image</span>
                      <span className="text-gray-500 text-sm mt-1">JPG, PNG, GIF</span>
                      <input 
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </button>
                    
                    <div className="flex flex-col bg-gray-900 rounded-lg p-6 border-2 border-dashed border-gray-700">
                      <div className="text-center mb-3">
                        <LinkIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                        <span className="text-gray-300 font-medium">Image URL</span>
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Paste image URL here"
                        value={imageLink}
                        onChange={(e) => setImageLink(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm mb-3"
                      />
                      
                      <button
                        onClick={handleImageLink}
                        disabled={!imageLink.trim()}
                        className={`w-full py-2 rounded flex items-center justify-center ${
                          imageLink.trim()
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        <span>Use This Image</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 text-center">
                    This image will serve as your "before" picture and visualization target.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="py-2 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl text-blue-400 font-orbitron mb-2">DEFINE YOUR DREAM</h3>
            <p className="text-gray-300">
              Now, let's capture the important details about what you want to manifest.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Dream Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Ferrari 458 Italia"
                  value={dreamDetails.goalName || ''}
                  onChange={(e) => updateDreamDetails('goalName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your dream a clear, specific name
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Dream Type
                </label>
                <select
                  value={dreamDetails.goalType || ''}
                  onChange={(e) => updateDreamDetails('goalType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                >
                  <option value="">Select dream type</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Watch">Watch</option>
                  <option value="Property">Property</option>
                  <option value="Experience">Experience</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Target Date
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="date"
                      value={dreamDetails.targetDate || ''}
                      onChange={(e) => updateDreamDetails('targetDate', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    When do you plan to manifest this dream?
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm text-blue-400 mb-1">
                    Target Amount (if applicable)
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="number"
                      placeholder="e.g., 150000"
                      value={dreamDetails.targetAmount || ''}
                      onChange={(e) => updateDreamDetails('targetAmount', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated cost to acquire your dream
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Specific Details
                </label>
                <input
                  type="text"
                  placeholder="e.g., Rosso Corsa with tan interior, carbon package"
                  value={dreamDetails.targetAsset || ''}
                  onChange={(e) => updateDreamDetails('targetAsset', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be as specific as possible about what you want
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe your dream in detail, including why it matters to you..."
                  value={dreamDetails.description || ''}
                  onChange={(e) => updateDreamDetails('description', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-24 resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                Back
              </button>
              
              <button
                onClick={() => setStep(3)}
                disabled={!dreamDetails.goalName}
                className={`py-2 px-6 rounded flex items-center ${
                  dreamDetails.goalName
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl text-blue-400 font-orbitron mb-2">SET YOUR FOCUS</h3>
            <p className="text-gray-300">
              Define how you'll align your mind, body, and spirit to manifest this dream.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Mind Focus (Visualization Practice)
                </label>
                <textarea
                  placeholder="e.g., Visualize driving through Monaco daily, seeing myself confidently navigating each turn"
                  value={dreamDetails.mindFocus || ''}
                  onChange={(e) => updateDreamDetails('mindFocus', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-20 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How will you mentally prepare and visualize this dream?
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Body Focus (Physical Actions)
                </label>
                <textarea
                  placeholder="e.g., Track day fitness training 3x weekly to improve driving stamina and reflexes"
                  value={dreamDetails.bodyFocus || ''}
                  onChange={(e) => updateDreamDetails('bodyFocus', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-20 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  What physical activities will support manifesting this dream?
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Spirit Focus (Gratitude Practice)
                </label>
                <textarea
                  placeholder="e.g., Daily gratitude for my current driving experiences and the progress toward my dream car"
                  value={dreamDetails.spiritFocus || ''}
                  onChange={(e) => updateDreamDetails('spiritFocus', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-20 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  What gratitude or spiritual practices will align your energy with this dream?
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-blue-400 mb-1">
                  Funding Plan
                </label>
                <textarea
                  placeholder="e.g., Save 15% of monthly income, sell current vehicle, invest in growth stocks"
                  value={dreamDetails.fundingPlan || ''}
                  onChange={(e) => updateDreamDetails('fundingPlan', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm h-20 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  How do you plan to financially manifest this dream?
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                Back
              </button>
              
              <button
                onClick={createDream}
                className="py-2 px-6 bg-green-600 hover:bg-green-500 text-white rounded flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                <span>Create Dream</span>
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3].map(stepNum => (
            <div 
              key={stepNum}
              className={`flex items-center justify-center w-10 h-10 rounded-full 
                ${step === stepNum 
                  ? 'bg-blue-600 text-white' 
                  : step > stepNum 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}
            >
              {step > stepNum ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span>{stepNum}</span>
              )}
            </div>
          ))}
        </div>
        
        <div className="relative">
          <div className="absolute top-0 left-0 h-1 bg-gray-700 w-full rounded-full"></div>
          <div 
            className="absolute top-0 left-0 h-1 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(step - 1) / 2 * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Step content */}
      {renderStepContent()}
    </div>
  );
};

export default NewDreamComponent;