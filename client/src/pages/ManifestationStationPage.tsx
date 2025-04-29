import React, { useState, useEffect } from 'react';
import { Goal, DailyCheckin } from '../types/manifestation';
import { 
  Plus, 
  SparkleIcon, 
  ListChecks,
  Target,
  Heart,
  Brain,
  Dumbbell,
  Book,
  Camera,
  LinkIcon,
  Edit,
  CheckCircle,
  Calendar,
  Clock,
  BarChart3,
  ArrowUpRight,
  Flame,
  Trophy,
  RefreshCw
} from 'lucide-react';

// Import all our manifestation station components
import NewDreamComponent from '../components/ManifestationStation/NewDreamComponent';
import HustlePlannerComponent from '../components/ManifestationStation/HustlePlannerComponent';
import DisciplineTrackerComponent from '../components/ManifestationStation/DisciplineTrackerComponent';
import MindFocusComponent from '../components/ManifestationStation/MindFocusComponent';
import BodyFocusComponent from '../components/ManifestationStation/BodyFocusComponent';
import SpiritFocusComponent from '../components/ManifestationStation/SpiritFocusComponent';
import CelebrationComponent from '../components/ManifestationStation/CelebrationComponent';
import LibraryComponent from '../components/ManifestationStation/LibraryComponent';
import ResourceLibraryComponent from '../components/ManifestationStation/ResourceLibraryComponent';

// Mock data - in a real app, this would come from API/database
const MOCK_GOALS: Goal[] = [
  {
    id: 1,
    goalName: 'Ferrari 458 Italia',
    goalType: 'Vehicle',
    targetAsset: 'Rosso Corsa with tan interior, carbon package',
    targetDate: '2025-12-31',
    fundingPlan: 'Save 20% of monthly income, sell current vehicle, investment returns',
    mindFocus: 'Visualize driving through Monaco daily, feeling the steering wheel and hearing the engine',
    bodyFocus: 'Track day fitness training 3x weekly to improve driving stamina and reflexes',
    spiritFocus: 'Daily gratitude for my current car and the journey toward my dream',
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'in_progress',
    description: 'My dream car that represents the pinnacle of automotive engineering and design',
    progressPercentage: 35,
    targetAmount: 275000,
    currentAmount: 96250,
    budgetEntries: [],
    mediaGallery: []
  }
];

// Daily affirmations - one for each day of the week
const DAILY_AFFIRMATIONS = [
  "I am worthy of my dreams and am manifesting them with ease.",
  "Every day, I'm getting closer to my dream. I can feel it becoming real.",
  "I have the power to create the exact life I desire.",
  "Money flows to me easily and abundantly to support my dreams.",
  "I am aligned with the energy of success and achievement.",
  "My body, mind, and spirit are working in harmony to manifest my desires.",
  "I am grateful for what I have now and excited for what is coming."
];

// Get today's affirmation
const getTodaysAffirmation = () => {
  const dayOfWeek = new Date().getDay();
  return DAILY_AFFIRMATIONS[dayOfWeek];
};

const ManifestationStationPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(goals.length > 0 ? goals[0].id : null);
  const [isCreatingNewDream, setIsCreatingNewDream] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [todayAffirmation, setTodayAffirmation] = useState<string>(getTodaysAffirmation());
  const [streakCount, setStreakCount] = useState<number>(7); // Mock streak count
  
  // Get the selected goal
  const selectedGoal = goals.find(goal => goal.id === selectedGoalId) || null;
  
  // Function to create a new dream
  const handleDreamCreated = (newGoal: Goal) => {
    setGoals([...goals, newGoal]);
    setSelectedGoalId(newGoal.id);
    setIsCreatingNewDream(false);
    setActiveView('dashboard');
  };
  
  // Function to update a goal
  const handleGoalUpdate = (updatedGoal: Goal) => {
    const updatedGoals = goals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );
    setGoals(updatedGoals);
  };
  
  // Function to log a daily check-in
  const logDailyCheckin = (checkin: DailyCheckin) => {
    // In a real app, this would be saved to the database
    console.log('Logging daily check-in:', checkin);
    
    // Update the streak count
    setStreakCount(streakCount + 1);
  };
  
  // Component to render the selected view
  const renderActiveView = () => {
    if (isCreatingNewDream) {
      return <NewDreamComponent onDreamCreated={handleDreamCreated} />;
    }
    
    if (!selectedGoal) {
      return (
        <div className="text-center py-12">
          <SparkleIcon className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Start Your Manifestation Journey</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Create your first dream to begin manifesting it into reality. 
            The Manifestation Station will guide you through the process.
          </p>
          <button
            onClick={() => setIsCreatingNewDream(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center mx-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span>Create New Dream</span>
          </button>
        </div>
      );
    }
    
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'hustle-planner':
        return <HustlePlannerComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      case 'discipline-tracker':
        return <DisciplineTrackerComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      case 'mind-focus':
        return <MindFocusComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      case 'body-focus':
        return <BodyFocusComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      case 'spirit-focus':
        return <SpiritFocusComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      case 'celebration':
        return <CelebrationComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      case 'knowledge-library':
        return <LibraryComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      case 'resource-library':
        return <ResourceLibraryComponent goal={selectedGoal} onUpdate={handleGoalUpdate} />;
      default:
        return renderDashboard();
    }
  };
  
  // Dashboard view
  const renderDashboard = () => {
    if (!selectedGoal) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">{selectedGoal.goalName}</h2>
            <p className="text-gray-400">{selectedGoal.description}</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setActiveView('hustle-planner')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded flex items-center text-sm"
            >
              <Edit className="h-4 w-4 mr-1.5" />
              <span>Edit Dream</span>
            </button>
            
            <button
              onClick={() => setIsCreatingNewDream(true)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center text-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>New Dream</span>
            </button>
          </div>
        </div>
        
        {/* Daily affirmation card */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 border border-blue-800">
          <div className="flex items-start">
            <SparkleIcon className="h-6 w-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-blue-400 font-medium mb-1">Today's Affirmation</h3>
              <p className="text-white text-lg">"{todayAffirmation}"</p>
              <p className="text-sm text-gray-400 mt-2">
                Repeat this affirmation at least 3 times today with feeling and conviction.
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-300 font-medium">Dream Progress</h3>
              <span className={`font-semibold ${
                selectedGoal.progressPercentage >= 80 ? 'text-green-400' :
                selectedGoal.progressPercentage >= 50 ? 'text-blue-400' :
                selectedGoal.progressPercentage >= 25 ? 'text-yellow-400' :
                'text-gray-400'
              }`}>
                {selectedGoal.progressPercentage}%
              </span>
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
              <div 
                className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${selectedGoal.progressPercentage}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500">
              Target date: {new Date(selectedGoal.targetDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-300 font-medium">Streak</h3>
              <div className="flex items-center">
                <Flame className="h-4 w-4 text-orange-500 mr-1" />
                <span className="font-semibold text-orange-400">{streakCount} days</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-blue-400">8</span>
                <p className="text-xs text-gray-500">Mind</p>
              </div>
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-green-400">5</span>
                <p className="text-xs text-gray-500">Body</p>
              </div>
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-purple-400">7</span>
                <p className="text-xs text-gray-500">Spirit</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-gray-300 font-medium">Financial</h3>
              <span className="font-semibold text-green-400">
                ${selectedGoal.currentAmount.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-gray-800 rounded-full h-2.5 mb-2">
              <div 
                className="h-2.5 rounded-full bg-green-500"
                style={{ width: `${(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500">
              Target: ${selectedGoal.targetAmount.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Quick access cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveView('hustle-planner')}
            className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-800 flex flex-col items-center text-center"
          >
            <Target className="h-8 w-8 text-blue-500 mb-2" />
            <h4 className="text-white font-medium mb-1">Hustle Planner</h4>
            <p className="text-xs text-gray-500">Track your 7 key manifestation elements</p>
          </button>
          
          <button
            onClick={() => setActiveView('discipline-tracker')}
            className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-800 flex flex-col items-center text-center"
          >
            <ListChecks className="h-8 w-8 text-green-500 mb-2" />
            <h4 className="text-white font-medium mb-1">Daily Disciplines</h4>
            <p className="text-xs text-gray-500">Log your daily activities and streaks</p>
          </button>
          
          <button
            onClick={() => setActiveView('knowledge-library')}
            className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-800 flex flex-col items-center text-center"
          >
            <Book className="h-8 w-8 text-yellow-500 mb-2" />
            <h4 className="text-white font-medium mb-1">Knowledge Library</h4>
            <p className="text-xs text-gray-500">Books and learning resources</p>
          </button>
          
          <button
            onClick={() => setActiveView('resource-library')}
            className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-800 flex flex-col items-center text-center"
          >
            <LinkIcon className="h-8 w-8 text-purple-500 mb-2" />
            <h4 className="text-white font-medium mb-1">Resource Library</h4>
            <p className="text-xs text-gray-500">Websites, videos, and photos</p>
          </button>
        </div>
        
        {/* Body, Mind, Spirit Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveView('body-focus')}
            className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Dumbbell className="h-5 w-5 text-green-500 mr-2" />
                <h4 className="text-white font-medium">Body Focus</h4>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{selectedGoal.bodyFocus || "Define your physical actions"}</p>
          </button>
          
          <button
            onClick={() => setActiveView('mind-focus')}
            className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-blue-500 mr-2" />
                <h4 className="text-white font-medium">Mind Focus</h4>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{selectedGoal.mindFocus || "Define your visualization practice"}</p>
          </button>
          
          <button
            onClick={() => setActiveView('spirit-focus')}
            className="bg-gray-900 hover:bg-gray-800 rounded-lg p-4 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-purple-500 mr-2" />
                <h4 className="text-white font-medium">Spirit Focus</h4>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{selectedGoal.spiritFocus || "Define your gratitude practice"}</p>
          </button>
        </div>
        
        {/* Celebration vision */}
        <button
          onClick={() => setActiveView('celebration')}
          className="w-full bg-gradient-to-r from-indigo-900/50 to-purple-900/50 hover:from-indigo-900/70 hover:to-purple-900/70 rounded-lg p-4 border border-indigo-800 flex items-start"
        >
          <Trophy className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
          <div className="text-left">
            <h3 className="text-white font-medium mb-1">Celebration Vision</h3>
            <p className="text-sm text-gray-300">
              Visualize how you'll celebrate when your dream becomes reality. Define your victory moment.
            </p>
          </div>
          <div className="ml-auto">
            <ArrowUpRight className="h-5 w-5 text-gray-400" />
          </div>
        </button>
      </div>
    );
  };
  
  // Main component render
  return (
    <div className="min-h-screen bg-gray-950 text-white py-6">
      <div className="container px-4 md:px-6 mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Manifestation Station
            </h1>
            
            {!isCreatingNewDream && selectedGoal && (
              <div className="flex">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-1.5 rounded-l text-sm ${
                    activeView === 'dashboard' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('hustle-planner')}
                  className={`px-3 py-1.5 text-sm ${
                    activeView === 'hustle-planner' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Hustle Planner
                </button>
                <button
                  onClick={() => setActiveView('discipline-tracker')}
                  className={`px-3 py-1.5 rounded-r text-sm ${
                    activeView === 'discipline-tracker' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Daily Check-in
                </button>
              </div>
            )}
          </div>
          
          {!isCreatingNewDream && goals.length > 1 && (
            <div className="flex overflow-x-auto pb-3 space-x-4">
              {goals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap flex-shrink-0 ${
                    selectedGoalId === goal.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {goal.goalName}
                </button>
              ))}
              
              <button
                onClick={() => setIsCreatingNewDream(true)}
                className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 whitespace-nowrap flex items-center flex-shrink-0"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>New Dream</span>
              </button>
            </div>
          )}
        </header>
        
        <main>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default ManifestationStationPage;