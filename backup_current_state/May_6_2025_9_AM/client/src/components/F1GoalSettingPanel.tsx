import React, { useState } from 'react';
import { Calendar, Target, Car, Award, ChevronDown, ChevronUp, Plus, Check, Star } from 'lucide-react';

interface GoalFormData {
  type: 'vehicle' | 'experience' | 'achievement';
  description: string;
  targetDate: string;
}

const F1GoalSettingPanel: React.FC = () => {
  // State for tracking the expanded/collapsed state
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State for tracking form data
  const [goalData, setGoalData] = useState<GoalFormData>({
    type: 'vehicle',
    description: '',
    targetDate: '3 months'
  });
  
  // State for tracking if the AI is generating
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  
  // State for tracking form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Handle goal type change
  const handleTypeChange = (type: 'vehicle' | 'experience' | 'achievement') => {
    setGoalData(prev => ({ ...prev, type }));
  };
  
  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGoalData(prev => ({ ...prev, description: e.target.value }));
  };
  
  // Handle target date change
  const handleTargetDateChange = (value: string) => {
    setGoalData(prev => ({ ...prev, targetDate: value }));
  };
  
  // Handle AI generation
  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    
    // Simulate AI generation (would connect to real AI in production)
    setTimeout(() => {
      const aiSuggestions = [
        "Complete a high-performance driving course at Circuit of the Americas",
        "Upgrade to performance exhaust system for better throttle response",
        "Attend the Monaco Grand Prix weekend as a VIP spectator",
        "Achieve personal best lap time at local track day event"
      ];
      
      // Set a random suggestion
      const randomSuggestion = aiSuggestions[Math.floor(Math.random() * aiSuggestions.length)];
      setGoalData(prev => ({ ...prev, description: randomSuggestion }));
      setIsAiGenerating(false);
    }, 1500);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset after success message
      setTimeout(() => {
        setIsSubmitted(false);
        setIsExpanded(false);
        setGoalData({
          type: 'vehicle',
          description: '',
          targetDate: '3 months'
        });
      }, 3000);
    }, 1000);
  };
  
  // Get icon based on goal type
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'vehicle':
        return <Car className="h-4 w-4" />;
      case 'experience':
        return <Star className="h-4 w-4" />;
      case 'achievement':
        return <Award className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="relative">
      {/* F1-Telemetry Style Container */}
      <div className="bg-black border border-blue-900/30 rounded-xl overflow-hidden shadow-lg">
        {/* Header Bar with F1 Telemetry Design */}
        <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-blue-900/40 p-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-2.5 w-2.5 rounded-full bg-[#08c519] animate-pulse mr-2"></div>
            <h3 className="text-[#4B9CD3] font-orbitron text-lg tracking-wide flex items-center">
              <Target className="h-4 w-4 mr-2" />
              DRIVER GOALS
            </h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400 font-mono uppercase">MISSION PLANNING</span>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 rounded-full bg-blue-900/20 hover:bg-blue-900/40 transition-colors flex items-center justify-center border border-blue-900/30"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-blue-400" />}
            </button>
          </div>
        </div>

        {/* Collapsed View */}
        {!isExpanded && !isSubmitted && (
          <div className="p-4 bg-gradient-to-b from-black/90 to-gray-900/80 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-7 w-7 rounded-full bg-blue-900/20 border border-blue-900/30 flex items-center justify-center mr-3">
                <Target className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-white font-medium">Set Your Next Goal</h4>
                <p className="text-gray-400 text-sm">Define your next driving or vehicle achievement</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsExpanded(true)}
              className="bg-[#08c519]/20 hover:bg-[#08c519]/30 text-[#08c519] transition-colors px-3 py-1.5 rounded text-sm border border-[#08c519]/30 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </button>
          </div>
        )}
        
        {/* Success Message */}
        {isSubmitted && (
          <div className="p-4 bg-gradient-to-b from-black/90 to-gray-900/80">
            <div className="flex items-center bg-[#08c519]/10 border border-[#08c519]/30 rounded-lg p-3">
              <div className="h-8 w-8 rounded-full bg-[#08c519]/20 border border-[#08c519]/40 flex items-center justify-center mr-3">
                <Check className="h-5 w-5 text-[#08c519]" />
              </div>
              <div>
                <h4 className="text-[#08c519] font-medium">Goal Successfully Added</h4>
                <p className="text-gray-300 text-sm">Your goal has been set. Good luck on your journey!</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Expanded View with Form */}
        {isExpanded && (
          <div className="bg-gradient-to-b from-black/90 to-gray-900/80">
            <form onSubmit={handleSubmit} className="p-5">
              {/* AI Powered Banner */}
              <div className="flex items-center mb-4 bg-blue-900/10 rounded p-2 border border-blue-900/20">
                <div className="h-6 w-6 rounded-full bg-blue-900/20 border border-blue-900/30 flex items-center justify-center mr-2">
                  <svg className="h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                </div>
                <span className="text-xs text-blue-400 uppercase font-bold tracking-wide mr-2">AI Powered</span>
                <button 
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isAiGenerating}
                  className="ml-auto text-xs bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 px-2 py-1 rounded border border-blue-900/30 transition-colors"
                >
                  {isAiGenerating ? "Generating..." : "Generate Goal"}
                </button>
              </div>
              
              {/* Goal Type Selection */}
              <div className="mb-5">
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2 font-mono">GOAL TYPE</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('vehicle')}
                    className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                      goalData.type === 'vehicle' 
                        ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' 
                        : 'bg-black/40 border-blue-900/20 text-gray-400 hover:bg-black/60'
                    } border transition-colors`}
                  >
                    <Car className="h-4 w-4 mr-1.5" />
                    Vehicle
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('experience')}
                    className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                      goalData.type === 'experience' 
                        ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' 
                        : 'bg-black/40 border-blue-900/20 text-gray-400 hover:bg-black/60'
                    } border transition-colors`}
                  >
                    <Star className="h-4 w-4 mr-1.5" />
                    Experience
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('achievement')}
                    className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                      goalData.type === 'achievement' 
                        ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' 
                        : 'bg-black/40 border-blue-900/20 text-gray-400 hover:bg-black/60'
                    } border transition-colors`}
                  >
                    <Award className="h-4 w-4 mr-1.5" />
                    Achievement
                  </button>
                </div>
              </div>
              
              {/* Goal Description */}
              <div className="mb-5">
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2 font-mono">DESCRIPTION</label>
                <div className="relative">
                  <textarea
                    value={goalData.description}
                    onChange={handleDescriptionChange}
                    placeholder="My next automotive goal is..."
                    className="w-full bg-black/60 border border-blue-900/30 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[80px]"
                  />
                  {isAiGenerating && (
                    <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center">
                      <div className="flex items-center">
                        <svg className="animate-spin h-5 w-5 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-blue-400 font-medium">AI generating suggestion...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Target Date Selection */}
              <div className="mb-6">
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2 font-mono">TARGET DATE</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTargetDateChange('1 month')}
                    className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                      goalData.targetDate === '1 month' 
                        ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' 
                        : 'bg-black/40 border-blue-900/20 text-gray-400 hover:bg-black/60'
                    } border transition-colors`}
                  >
                    <Calendar className="h-4 w-4 mr-1.5" />
                    1 month
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetDateChange('3 months')}
                    className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                      goalData.targetDate === '3 months' 
                        ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' 
                        : 'bg-black/40 border-blue-900/20 text-gray-400 hover:bg-black/60'
                    } border transition-colors`}
                  >
                    <Calendar className="h-4 w-4 mr-1.5" />
                    3 months
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTargetDateChange('6 months')}
                    className={`px-3 py-2 rounded text-sm flex items-center justify-center ${
                      goalData.targetDate === '6 months' 
                        ? 'bg-blue-900/40 border-blue-500/50 text-blue-300' 
                        : 'bg-black/40 border-blue-900/20 text-gray-400 hover:bg-black/60'
                    } border transition-colors`}
                  >
                    <Calendar className="h-4 w-4 mr-1.5" />
                    6 months
                  </button>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="flex-1 py-2.5 rounded-lg border border-blue-900/30 bg-black/40 text-gray-300 hover:bg-black/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!goalData.description.trim() || isSubmitting}
                  className={`flex-1 py-2.5 rounded-lg border flex items-center justify-center
                    ${isSubmitting 
                      ? 'bg-[#08c519]/10 border-[#08c519]/20 text-[#08c519]/50' 
                      : goalData.description.trim() 
                        ? 'bg-[#08c519]/20 border-[#08c519]/30 text-[#08c519] hover:bg-[#08c519]/30 transition-colors' 
                        : 'bg-gray-900/40 border-gray-800 text-gray-600 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Goal
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {/* F1-style technical footer */}
            <div className="bg-black/70 border-t border-blue-900/20 px-4 py-2 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></div>
                <span className="text-xs text-blue-400/70 font-mono">GOAL ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
              <div className="text-xs text-gray-500">
                {getTypeIcon(goalData.type)}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Technical accent lines for F1 styling */}
      <div className="absolute -bottom-2 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-[#08c519]/30 to-transparent"></div>
    </div>
  );
};

export default F1GoalSettingPanel;