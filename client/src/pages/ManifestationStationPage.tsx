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
import GoalTileGrid from '../components/ManifestationStation/GoalTileGrid';

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
    mediaGallery: [
      {
        id: 1,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        title: 'Dream Car',
        description: 'Ferrari 458 Italia in Rosso Corsa',
        dateAdded: '2023-05-15'
      }
    ]
  },
  {
    id: 2,
    goalName: 'Rolex Daytona',
    goalType: 'Timepiece',
    targetAsset: 'Stainless steel, white dial with black subdials',
    targetDate: '2024-08-01',
    fundingPlan: 'Bonus allocation, side business revenue',
    mindFocus: 'Visualize wearing it at important business meetings and special occasions',
    bodyFocus: 'Daily actions to grow business revenue and investment strategy',
    spiritFocus: 'Gratitude for current timepieces and appreciation for craftsmanship',
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'in_progress',
    description: 'The iconic chronograph representing precision and success',
    progressPercentage: 68,
    targetAmount: 35000,
    currentAmount: 23800,
    budgetEntries: [],
    mediaGallery: [
      {
        id: 2,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1627661055286-c2c01a39fb12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        title: 'Dream Timepiece',
        description: 'Rolex Daytona - precision and elegance',
        dateAdded: '2023-07-10'
      }
    ]
  },
  {
    id: 3,
    goalName: 'Mountain Home',
    goalType: 'Real Estate',
    targetAsset: 'Modern cabin with panoramic views, 3BR/2BA',
    targetDate: '2026-06-15',
    fundingPlan: 'Real estate investment fund, property appreciation, structured savings',
    mindFocus: 'Daily visualization of morning coffee on the deck with mountain views',
    bodyFocus: 'Learning property investment strategies and building additional income streams',
    spiritFocus: 'Gratitude for current living space and the journey toward mountain tranquility',
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'in_progress',
    description: 'A serene mountain retreat for weekends and eventual semi-retirement',
    progressPercentage: 15,
    targetAmount: 850000,
    currentAmount: 127500,
    budgetEntries: [],
    mediaGallery: [
      {
        id: 3,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1465&q=80',
        title: 'Dream Home',
        description: 'Modern mountain retreat with amazing views',
        dateAdded: '2023-01-22'
      }
    ]
  },
  {
    id: 4,
    goalName: 'Track Day Experience',
    goalType: 'Experience',
    targetAsset: 'Full day at Nürburgring with professional coaching',
    targetDate: '2024-04-30',
    fundingPlan: 'Monthly dedicated savings, performance bonus allocation',
    mindFocus: 'Visualize perfect lap execution and improved driving skills',
    bodyFocus: 'Racing simulator practice and physical conditioning for G-forces',
    spiritFocus: 'Gratitude for current driving experiences and the passion for improvement',
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'in_progress',
    description: 'The ultimate driving experience at the most legendary track in the world',
    progressPercentage: 82,
    targetAmount: 12000,
    currentAmount: 9840,
    budgetEntries: [],
    mediaGallery: [
      {
        id: 4,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1628519592419-bf2b9c0d0e9d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        title: 'Track Dreams',
        description: 'Nürburgring - Green Hell experience',
        dateAdded: '2023-04-03'
      }
    ]
  },
  {
    id: 5,
    goalName: 'Omega Speedmaster',
    goalType: 'Timepiece',
    targetAsset: 'Professional Moonwatch, hesalite crystal',
    targetDate: '2023-09-15',
    fundingPlan: 'Dedicated monthly savings from primary income',
    mindFocus: 'Daily visualization of achievement and celebration',
    bodyFocus: 'Extra consulting work to accelerate savings',
    spiritFocus: 'Gratitude practice focused on current achievements',
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'complete',
    description: 'The first watch on the moon - a symbol of human achievement',
    progressPercentage: 100,
    targetAmount: 6500,
    currentAmount: 6500,
    budgetEntries: [],
    mediaGallery: [
      {
        id: 5,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1404&q=80',
        title: 'Mission Complete',
        description: 'Omega Speedmaster Professional - achieved September 2023',
        dateAdded: '2023-09-15'
      }
    ]
  },
  {
    id: 6,
    goalName: 'European Grand Prix Trip',
    goalType: 'Experience',
    targetAsset: 'Monaco, Spa, and Monza F1 races with paddock access',
    targetDate: '2023-08-30',
    fundingPlan: 'Travel fund, loyalty points, work sabbatical',
    mindFocus: 'Visualization of track sounds, atmosphere, and exclusive experiences',
    bodyFocus: 'Travel preparation and networking to secure paddock access',
    spiritFocus: 'Gratitude for motorsport passion and opportunity to experience it firsthand',
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'complete',
    description: 'The ultimate Formula 1 fan experience across iconic European circuits',
    progressPercentage: 100,
    targetAmount: 22000,
    currentAmount: 22000,
    budgetEntries: [],
    mediaGallery: [
      {
        id: 6,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1617886322168-72b886573c1c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
        title: 'Dream Achieved',
        description: 'Monaco Grand Prix weekend - incredible experience',
        dateAdded: '2023-08-30'
      }
    ]
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
              <span>Update Hustle Plan</span>
            </button>

            <button
              onClick={() => setActiveView('discipline-tracker')}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded flex items-center text-sm ml-2"
            >
              <ListChecks className="h-4 w-4 mr-1.5" />
              <span>Daily Check-in</span>
            </button>
            
            <button
              onClick={() => setIsCreatingNewDream(true)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center text-sm ml-2"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>New Dream</span>
            </button>
          </div>
        </div>
        
        {/* Daily affirmation card */}
        <div className="bg-gradient-to-r from-blue-900/50 to-green-900/50 rounded-lg p-4 border border-blue-800">
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
                className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500"
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
          className="w-full bg-gradient-to-r from-blue-900/50 to-green-900/50 hover:from-blue-900/70 hover:to-green-900/70 rounded-lg p-4 border border-blue-800 flex items-start"
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
        
        {/* All Dreams Section Header */}
        <div className="mt-12 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-orbitron text-blue-400">ACTIVE DREAMS</h2>
            <button
              onClick={() => setIsCreatingNewDream(true)}
              className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white whitespace-nowrap flex items-center"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              <span>New Dream</span>
            </button>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-blue-500 to-transparent mt-2"></div>
        </div>
        
        {/* Active Dreams Tile Grid */}
        <GoalTileGrid 
          goals={goals} 
          onSelectGoal={setSelectedGoalId} 
          activeGoal={selectedGoal} 
          type="active" 
        />
        
        {/* Completed Dreams Section */}
        <div className="mt-12 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-orbitron text-green-400">COMPLETED DREAMS</h2>
            <div className="flex items-center">
              <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-gray-300">{goals.filter(goal => goal.manifestStatus === 'completed' || goal.manifestStatus === 'complete').length} Achievements</span>
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-green-500 to-transparent mt-2"></div>
        </div>
        
        {/* Completed Dreams Tile Grid */}
        <GoalTileGrid 
          goals={goals} 
          onSelectGoal={setSelectedGoalId} 
          activeGoal={selectedGoal} 
          type="completed" 
        />
      </div>
    );
  };
  
  // Main component render
  return (
    <div className="min-h-screen bg-gray-950 text-white py-6">
      <div className="container px-4 md:px-6 mx-auto">
        <header className="mb-8">
          <div className="flex flex-col mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-orbitron text-blue-400">
                MANIFESTATION STATION
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
            <div className="mt-3 mb-5 space-y-4 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 border border-blue-800">
                  <h3 className="text-blue-400 font-medium text-lg mb-2">Why You're Here</h3>
                  <p className="text-gray-300 text-sm">
                    Manifestation Station™ isn't about "wishing." It's about working. 
                    Every goal you log here — every car, watch, home, or milestone — comes with a plan built the way real winners build: 
                    Daily movement. Daily mindset. Daily gratitude. 
                    Because real manifestation isn't magic—it's momentum.
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 border border-blue-800">
                  <h3 className="text-blue-400 font-medium text-lg mb-2">What You Get</h3>
                  <p className="text-gray-300 text-sm font-semibold mb-2">
                    The First Hustle Planner Designed for Auto Enthusiasts
                  </p>
                  <ul className="text-gray-300 text-sm list-disc pl-5 space-y-1">
                    <li>Dream Vault: Log your cars, watches, experiences, investments</li>
                    <li>Goal Telemetry: Set your target, funding path, and timeline</li>
                    <li>Milestone Tracking: Break down the dream into checkable steps</li>
                    <li>Daily Discipline Tracker: Mind, Body, Spirit focus areas</li>
                    <li>Proof of Progress System: See your real manifestation rate</li>
                  </ul>
                  <p className="text-gray-300 text-sm mt-2 italic">
                    Methods used by the creators who built this app
                  </p>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 border border-blue-800">
                  <h3 className="text-blue-400 font-medium text-lg mb-2">How to Use It</h3>
                  <div className="bg-blue-900/30 p-2 rounded mb-3 border border-blue-700/50">
                    <h4 className="text-blue-300 font-medium text-sm mb-1">GoTime's 7 Elements System</h4>
                    <p className="text-gray-300 text-xs">The proven method to turn visions into reality through consistent daily actions</p>
                  </div>
                  <ul className="text-gray-300 text-sm list-disc pl-5 space-y-1">
                    <li>Set Goals: Add dream assets or experiences</li>
                    <li>Implement Daily Actions: Focus on the 7 elements consistently</li>
                    <li>Track Progress: Update every week or day as you advance</li>
                    <li>Celebrate Completions: Archive manifested goals</li>
                    <li>Level Up: After each goal, raise your standards</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm italic">
                Manifestation Station™ isn't about posting dreams. It's about engineering victories — one daily choice at a time.
                Dream bigger. Work sharper. Drive harder. Live better.
              </p>
            </div>
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