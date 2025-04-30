import React, { useState, useEffect } from 'react';
import { 
  Target, Calendar, Clock, Car, Gauge, 
  DollarSign, Camera, CheckSquare, Award, AlertTriangle, 
  Plus, Image, Upload, Info, X, ExternalLink, Edit, Trash2,
  ChevronDown, ChevronUp, Share2, Download, BarChart
} from 'lucide-react';
import { useVehicles } from '../context/VehicleContext';

interface Goal {
  id: string;
  title: string;
  category: 'acquisition' | 'modification' | 'achievement' | 'skill' | 'financial' | 'other';
  description: string;
  target_date: string;
  target_amount?: number; // For financial goals
  target_value?: string; // For measurable goals (e.g., quarter mile time)
  current_amount?: number;
  current_value?: string;
  progress: number; // 0-100
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'abandoned';
  priority: 'low' | 'medium' | 'high';
  visualization_image?: string;
  vehicle_id?: string;
  milestones?: {
    id: string;
    title: string;
    completed: boolean;
    due_date?: string;
  }[];
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}

interface AutoGoalVisualizerProps {
  isPaddock20Member?: boolean;
  onGoalVisualized?: (goal: Goal) => void;
}

const AutoGoalVisualizer: React.FC<AutoGoalVisualizerProps> = ({ 
  isPaddock20Member = false, 
  onGoalVisualized 
}) => {
  const { vehicles } = useVehicles();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    category: 'acquisition',
    description: '',
    target_date: '',
    progress: 0,
    status: 'not_started',
    priority: 'medium',
    milestones: []
  });
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showMilestones, setShowMilestones] = useState(false);
  const [newMilestone, setNewMilestone] = useState('');
  const [processingVisualization, setProcessingVisualization] = useState(false);
  
  // Load goals on component mount
  useEffect(() => {
    // In a real application, this would fetch from an API
    // For this example, we'll use demo data
    const demoGoals = getDemoGoals();
    setGoals(demoGoals);
  }, []);
  
  // Get demo goals
  const getDemoGoals = (): Goal[] => {
    return [
      {
        id: '1',
        title: 'Acquire Porsche 911 GT3',
        category: 'acquisition',
        description: 'Purchase a 992-generation Porsche 911 GT3 in Shark Blue with manual transmission.',
        target_date: '2025-12-31',
        target_amount: 180000,
        current_amount: 65000,
        progress: 36,
        status: 'in_progress',
        priority: 'high',
        visualization_image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1000&auto=format&fit=crop',
        milestones: [
          {
            id: '1-1',
            title: 'Save $100,000 for down payment',
            completed: false,
            due_date: '2025-06-30'
          },
          {
            id: '1-2',
            title: 'Research financing options',
            completed: true
          },
          {
            id: '1-3',
            title: 'Test drive at dealership',
            completed: true
          }
        ],
        notes: 'Considering both new and certified pre-owned options. Need to sell current car before purchase.',
        tags: ['porsche', 'dream-car', 'saving'],
        created_at: '2023-08-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Complete Advanced Driving Course',
        category: 'skill',
        description: 'Complete a two-day advanced performance driving course at Circuit of the Americas.',
        target_date: '2024-09-30',
        progress: 10,
        status: 'not_started',
        priority: 'medium',
        milestones: [
          {
            id: '2-1',
            title: 'Research available courses',
            completed: true
          },
          {
            id: '2-2',
            title: 'Book course date',
            completed: false,
            due_date: '2024-07-31'
          }
        ],
        tags: ['driving-skills', 'track', 'education'],
        created_at: '2023-11-20T15:45:00Z'
      }
    ];
  };
  
  // Handle input change for the new goal form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };
  
  // Add a milestone to the new goal
  const addMilestone = () => {
    if (!newMilestone.trim()) return;
    
    const milestone = {
      id: Date.now().toString(),
      title: newMilestone.trim(),
      completed: false
    };
    
    setNewGoal(prev => ({
      ...prev,
      milestones: [...(prev.milestones || []), milestone]
    }));
    
    setNewMilestone('');
  };
  
  // Remove a milestone from the new goal
  const removeMilestone = (id: string) => {
    setNewGoal(prev => ({
      ...prev,
      milestones: prev.milestones?.filter(m => m.id !== id) || []
    }));
  };
  
  // Toggle milestone completion
  const toggleMilestoneCompletion = (goalId: string, milestoneId: string) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        if (goal.id !== goalId) return goal;
        
        const updatedMilestones = goal.milestones?.map(m => {
          if (m.id !== milestoneId) return m;
          return { ...m, completed: !m.completed };
        });
        
        // Recalculate progress based on milestones
        let progress = 0;
        if (updatedMilestones && updatedMilestones.length > 0) {
          const completedCount = updatedMilestones.filter(m => m.completed).length;
          progress = Math.round((completedCount / updatedMilestones.length) * 100);
        }
        
        return {
          ...goal,
          milestones: updatedMilestones,
          progress
        };
      })
    );
  };
  
  // Handle file upload for goal visualization
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, this would upload to a server
    // For this example, we'll create a data URL
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Save the new goal
  const saveGoal = () => {
    if (!newGoal.title || !newGoal.description || !newGoal.target_date) {
      alert('Please fill in all required fields (title, description, target date)');
      return;
    }
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      category: newGoal.category || 'other',
      description: newGoal.description,
      target_date: newGoal.target_date,
      target_amount: newGoal.target_amount,
      target_value: newGoal.target_value,
      current_amount: newGoal.current_amount,
      current_value: newGoal.current_value,
      progress: 0,
      status: 'not_started',
      priority: newGoal.priority || 'medium',
      visualization_image: uploadedImage || undefined,
      vehicle_id: newGoal.vehicle_id,
      milestones: newGoal.milestones,
      notes: newGoal.notes,
      tags: newGoal.tags,
      created_at: new Date().toISOString()
    };
    
    // Calculate initial progress if there are milestones
    if (goal.milestones && goal.milestones.length > 0) {
      const completedCount = goal.milestones.filter(m => m.completed).length;
      goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
    }
    
    setGoals(prev => [goal, ...prev]);
    setNewGoal({
      title: '',
      category: 'acquisition',
      description: '',
      target_date: '',
      progress: 0,
      status: 'not_started',
      priority: 'medium',
      milestones: []
    });
    setUploadedImage(null);
    setShowNewGoalForm(false);
  };
  
  // Delete a goal
  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
    if (selectedGoal?.id === id) {
      setSelectedGoal(null);
    }
  };
  
  // Start the visualization process
  const startVisualization = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsVisualizing(true);
    
    // Simulate processing for a brief moment
    setProcessingVisualization(true);
    setTimeout(() => {
      setProcessingVisualization(false);
      
      // In a real app, this would call an AI service to generate or enhance the visualization
      // Here we'll just use the existing image or a placeholder
      
      if (onGoalVisualized) {
        onGoalVisualized(goal);
      }
    }, 2000);
  };
  
  // Calculate days until target date
  const getDaysUntilTarget = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'acquisition':
        return <Car className="h-5 w-5 text-blue-400" />;
      case 'modification':
        return <Gauge className="h-5 w-5 text-green-400" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-purple-400" />;
      case 'skill':
        return <CheckSquare className="h-5 w-5 text-amber-400" />;
      case 'financial':
        return <DollarSign className="h-5 w-5 text-emerald-400" />;
      default:
        return <Target className="h-5 w-5 text-blue-400" />;
    }
  };
  
  return (
    <div className={`bg-gray-900/40 rounded-xl p-5 border ${
      isPaddock20Member 
        ? 'border-amber-500/30 bg-gradient-to-br from-gray-900 to-gray-900/80'
        : 'border-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Target className={`h-6 w-6 mr-2 ${
            isPaddock20Member ? 'text-amber-400' : 'text-blue-400'
          }`} />
          Automotive Goal Visualizer
        </h2>
        
        <button
          onClick={() => setShowNewGoalForm(true)}
          className={`px-3 py-1.5 ${
            isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md flex items-center`}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New Goal
        </button>
      </div>
      
      {/* Visualization Dashboard */}
      {isVisualizing && selectedGoal ? (
        <div className="mb-6 relative">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={() => setIsVisualizing(false)}
              className="p-1 bg-black/50 rounded-full"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          {processingVisualization ? (
            <div className="bg-gray-900/60 rounded-lg p-8 text-center border border-gray-800">
              <div className="animate-spin w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-white mb-2">Creating Your Visualization</h3>
              <p className="text-gray-400">
                We're generating a personalized visualization of your automotive goal...
              </p>
            </div>
          ) : (
            <div className="bg-gray-900/60 rounded-lg border border-gray-800 overflow-hidden">
              <div className="relative aspect-video">
                {selectedGoal.visualization_image ? (
                  <img 
                    src={selectedGoal.visualization_image} 
                    alt={selectedGoal.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/40 to-purple-900/40 flex items-center justify-center">
                    <Camera className="h-16 w-16 text-gray-700" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedGoal.title}</h3>
                  <p className="text-gray-300 mb-4 max-w-2xl">{selectedGoal.description}</p>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="bg-black/50 px-3 py-1.5 rounded-full text-sm text-white flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-blue-400" />
                      {formatDate(selectedGoal.target_date)}
                    </div>
                    
                    <div className="bg-black/50 px-3 py-1.5 rounded-full text-sm text-white flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-blue-400" />
                      {getDaysUntilTarget(selectedGoal.target_date)} days remaining
                    </div>
                    
                    {selectedGoal.target_amount && (
                      <div className="bg-black/50 px-3 py-1.5 rounded-full text-sm text-white flex items-center">
                        <DollarSign className="h-4 w-4 mr-1.5 text-green-400" />
                        Target: {formatCurrency(selectedGoal.target_amount)}
                      </div>
                    )}
                    
                    {selectedGoal.current_amount && (
                      <div className="bg-black/50 px-3 py-1.5 rounded-full text-sm text-white flex items-center">
                        <BarChart className="h-4 w-4 mr-1.5 text-green-400" />
                        Progress: {formatCurrency(selectedGoal.current_amount)}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full bg-black/50 rounded-full h-3 mb-2">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${selectedGoal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-white text-sm">{selectedGoal.progress}% Complete</div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between mb-4">
                  <h4 className="text-md font-medium text-white flex items-center">
                    <CheckSquare className="h-4 w-4 mr-1.5 text-blue-400" />
                    Milestones
                  </h4>
                  
                  <div className="flex space-x-2">
                    <button className="text-sm text-gray-400 hover:text-white flex items-center">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </button>
                    
                    <button className="text-sm text-gray-400 hover:text-white flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      Save
                    </button>
                  </div>
                </div>
                
                {selectedGoal.milestones && selectedGoal.milestones.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGoal.milestones.map(milestone => (
                      <div 
                        key={milestone.id} 
                        className={`p-3 rounded-lg flex items-center ${
                          milestone.completed 
                            ? 'bg-green-900/20 border border-green-800/30' 
                            : 'bg-gray-800/50 border border-gray-700'
                        }`}
                      >
                        <button
                          onClick={() => toggleMilestoneCompletion(selectedGoal.id, milestone.id)}
                          className={`p-1 rounded-md mr-3 ${
                            milestone.completed ? 'bg-green-900/30 text-green-400' : 'bg-gray-700 text-gray-400'
                          }`}
                        >
                          <CheckSquare className="h-5 w-5" />
                        </button>
                        
                        <div className="flex-1">
                          <div className={`${milestone.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                            {milestone.title}
                          </div>
                          {milestone.due_date && (
                            <div className="text-xs text-gray-500">
                              Due: {formatDate(milestone.due_date)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    No milestones defined for this goal
                  </div>
                )}
                
                <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-900/30">
                  <h4 className="text-md font-medium text-white flex items-center mb-2">
                    <Info className="h-4 w-4 mr-1.5 text-blue-400" />
                    Visualization Power
                  </h4>
                  <p className="text-sm text-gray-300">
                    Visualizing your automotive goals activates the reticular activating system in your brain, 
                    making you more likely to notice opportunities and take actions that lead to achievement.
                  </p>
                  {isPaddock20Member && (
                    <div className="mt-3 flex justify-end">
                      <a href="#" className="text-sm text-amber-400 flex items-center">
                        Learn advanced visualization techniques
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Goals List */}
          {goals.length > 0 ? (
            <div className="space-y-4 mb-4">
              {goals.map(goal => (
                <div 
                  key={goal.id} 
                  className="bg-gray-900/60 p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                      {getCategoryIcon(goal.category)}
                      <h3 className="ml-2 text-md font-medium text-white">{goal.title}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => startVisualization(goal)}
                        className="p-1.5 bg-blue-900/30 rounded text-blue-400 hover:bg-blue-900/50"
                        title="Visualize"
                      >
                        <Camera className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => setSelectedGoal(goal)}
                        className="p-1.5 bg-gray-800 rounded text-gray-400 hover:bg-gray-700"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1.5 bg-gray-800 rounded text-gray-400 hover:bg-red-900/50 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{goal.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Target: {formatDate(goal.target_date)}
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {getDaysUntilTarget(goal.target_date)} days left
                    </div>
                    
                    {goal.vehicle_id && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Car className="h-3.5 w-3.5 mr-1" />
                        {vehicles.find(v => v.id === goal.vehicle_id)?.model || 'Vehicle'}
                      </div>
                    )}
                    
                    {goal.priority === 'high' && (
                      <div className="text-xs text-red-400 flex items-center">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                        High Priority
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-800 rounded-full h-2 mb-1">
                    <div 
                      className={`h-2 rounded-full ${
                        goal.progress >= 80 ? 'bg-green-500' :
                        goal.progress >= 40 ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">{goal.progress}% Complete</div>
                  
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setShowMilestones(!showMilestones)}
                        className="text-sm text-gray-400 hover:text-gray-300 flex items-center"
                      >
                        {showMilestones ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Milestones
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
                          </>
                        )}
                      </button>
                      
                      {showMilestones && (
                        <div className="mt-2 space-y-1">
                          {goal.milestones.map(milestone => (
                            <div 
                              key={milestone.id}
                              className="flex items-center text-sm p-1"
                            >
                              <button
                                onClick={() => toggleMilestoneCompletion(goal.id, milestone.id)}
                                className={`p-0.5 rounded mr-2 ${
                                  milestone.completed ? 'text-green-500' : 'text-gray-400'
                                }`}
                              >
                                <CheckSquare className="h-4 w-4" />
                              </button>
                              <span className={milestone.completed ? 'line-through text-gray-500' : 'text-gray-300'}>
                                {milestone.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-900/60 p-6 rounded-lg border border-gray-800 text-center mb-4">
              <Target className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-white mb-2">No Automotive Goals Yet</h3>
              <p className="text-gray-400 mb-4">
                Create your first automotive goal to visualize your path to achievement.
              </p>
              <button
                onClick={() => setShowNewGoalForm(true)}
                className={`px-4 py-2 ${
                  isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-md inline-flex items-center`}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Goal
              </button>
            </div>
          )}
          
          {/* Info Card */}
          <div className={`p-4 rounded-lg border ${
            isPaddock20Member 
              ? 'bg-amber-900/10 border-amber-800/30'
              : 'bg-blue-900/10 border-blue-800/30'
          }`}>
            <div className="flex items-start">
              <Camera className={`h-6 w-6 mr-3 flex-shrink-0 ${
                isPaddock20Member ? 'text-amber-400' : 'text-blue-400'
              }`} />
              <div>
                <h4 className="text-md font-medium text-white mb-1">One-Click Visualization</h4>
                <p className="text-sm text-gray-400">
                  Transform your automotive goals into powerful visual representations with a single click.
                  Visualizing your goals increases your chances of achieving them by 42%.
                </p>
                {isPaddock20Member && (
                  <div className="mt-2 text-xs bg-amber-900/20 border border-amber-800/30 p-2 rounded">
                    <span className="text-amber-400 font-medium">PADDOCK20 EXCLUSIVE:</span>{' '}
                    <span className="text-gray-300">
                      Access to AI-powered visualization enhancements and daily visualization reminders.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* New Goal Form Modal */}
      {showNewGoalForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
              <h3 className="text-xl font-semibold text-white">Create New Automotive Goal</h3>
              <button 
                onClick={() => setShowNewGoalForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newGoal.title || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Acquire Porsche 911 GT3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={newGoal.category || 'acquisition'}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="acquisition">Vehicle Acquisition</option>
                    <option value="modification">Vehicle Modification</option>
                    <option value="achievement">Driving Achievement</option>
                    <option value="skill">Skill Development</option>
                    <option value="financial">Financial</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={newGoal.description || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe your automotive goal in detail..."
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Target Date
                    </label>
                    <input
                      type="date"
                      name="target_date"
                      value={newGoal.target_date || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={newGoal.priority || 'medium'}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                {(newGoal.category === 'acquisition' || newGoal.category === 'financial') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Target Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                          type="number"
                          name="target_amount"
                          value={newGoal.target_amount || ''}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="50000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Current Amount
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                        <input
                          type="number"
                          name="current_amount"
                          value={newGoal.current_amount || ''}
                          onChange={handleInputChange}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10000"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {vehicles.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Related Vehicle (Optional)
                    </label>
                    <select
                      name="vehicle_id"
                      value={newGoal.vehicle_id || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Visualization Image
                  </label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
                    {uploadedImage ? (
                      <div className="relative">
                        <img 
                          src={uploadedImage} 
                          alt="Goal visualization" 
                          className="max-h-40 mx-auto rounded"
                        />
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="absolute top-1 right-1 p-1 bg-red-600 rounded-full"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Image className="h-10 w-10 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-400 mb-3">
                          Upload an image that represents your goal visually
                        </p>
                        <input
                          type="file"
                          id="image-upload"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 inline-flex items-center"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Image
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Milestones
                  </label>
                  
                  <div className="flex items-center mb-3">
                    <input
                      type="text"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a milestone"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addMilestone();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addMilestone}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-lg"
                    >
                      Add
                    </button>
                  </div>
                  
                  {newGoal.milestones && newGoal.milestones.length > 0 ? (
                    <div className="space-y-2">
                      {newGoal.milestones.map((milestone) => (
                        <div 
                          key={milestone.id}
                          className="flex items-center bg-gray-800 p-2 rounded-lg"
                        >
                          <CheckSquare className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-300">{milestone.title}</span>
                          <button
                            onClick={() => removeMilestone(milestone.id)}
                            className="ml-auto text-gray-500 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No milestones added yet. Break your goal into achievable steps.
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={newGoal.notes || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Any additional notes about your goal..."
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewGoalForm(false)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  onClick={saveGoal}
                  className={`px-4 py-2 ${
                    isPaddock20Member ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white rounded-md flex items-center`}
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoGoalVisualizer;