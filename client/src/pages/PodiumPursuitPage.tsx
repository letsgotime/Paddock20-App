import React, { useState } from "react";
import { 
  Trophy, Star, Award, Medal, Clock, Calendar, Car, SprayCan, 
  CircleCheck, Heart, Share2, ChevronDown, ChevronUp 
} from "lucide-react";
import { useRewards } from "../contexts/RewardsContext";

// Achievement category types
const ACHIEVEMENT_TYPES = {
  DRIVING: "driving",
  DETAILING: "detailing",
  TRACK_DAY: "track_day",
  ATTENDANCE: "attendance",
  MOTORSPORT: "motorsport",
  COMMUNITY: "community",
  COLLECTOR: "collector"
};

// Achievement status types
const ACHIEVEMENT_STATUS = {
  LOCKED: "locked",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed"
};

// Level thresholds - easy to modify point requirements
const LEVEL_THRESHOLDS = [
  { level: 1, points: 0 },
  { level: 2, points: 100 },
  { level: 3, points: 250 },
  { level: 4, points: 500 },
  { level: 5, points: 1000 },
  { level: 6, points: 2000 },
  { level: 7, points: 3500 },
  { level: 8, points: 5000 },
  { level: 9, points: 7500 },
  { level: 10, points: 10000 },
  { level: 15, points: 25000 },
  { level: 20, points: 50000 },
  { level: 25, points: 100000 }
];

// Driver rank titles based on level - easy to add new ranks
const DRIVER_RANKS = [
  { minLevel: 25, title: "Racing Legend" },
  { minLevel: 20, title: "Grand Champion" },
  { minLevel: 15, title: "Master Driver" },
  { minLevel: 10, title: "Elite Driver" },
  { minLevel: 5, title: "Senior Driver" },
  { minLevel: 0, title: "Driver" }
];

// Mock achievements data structure - can be replaced with API data
const ACHIEVEMENTS = [
  // Driving achievements
  {
    id: "driving-1",
    title: "First Drive Log",
    description: "Record your first drive in the journal",
    type: ACHIEVEMENT_TYPES.DRIVING,
    points: 50,
    icon: <Car className="text-blue-400" />,
    status: ACHIEVEMENT_STATUS.COMPLETED,
    progress: 100,
  },
  {
    id: "driving-2",
    title: "Mileage Master",
    description: "Log 500 miles in your Drive Journal",
    type: ACHIEVEMENT_TYPES.DRIVING,
    points: 250,
    icon: <Car className="text-blue-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 65,
  },
  {
    id: "driving-3",
    title: "Driving Enthusiast",
    description: "Complete 10 drives on fun roads",
    type: ACHIEVEMENT_TYPES.DRIVING,
    points: 150,
    icon: <Car className="text-blue-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 40,
  },
  {
    id: "driving-4",
    title: "Weather Warrior",
    description: "Drive in 5 different weather conditions",
    type: ACHIEVEMENT_TYPES.DRIVING,
    points: 200,
    icon: <Car className="text-blue-400" />,
    status: ACHIEVEMENT_STATUS.LOCKED,
    progress: 0,
  },
  
  // Detailing achievements
  {
    id: "detailing-1",
    title: "First Shine",
    description: "Complete your first detailing session",
    type: ACHIEVEMENT_TYPES.DETAILING,
    points: 50,
    icon: <SprayCan className="text-green-400" />,
    status: ACHIEVEMENT_STATUS.COMPLETED,
    progress: 100,
  },
  {
    id: "detailing-2",
    title: "Juice Box Pro",
    description: "Collect 5 products in your Juice Box",
    type: ACHIEVEMENT_TYPES.DETAILING,
    points: 150,
    icon: <SprayCan className="text-green-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 80,
  },
  {
    id: "detailing-3",
    title: "Gloss Master",
    description: "Complete 10 full detail sessions",
    type: ACHIEVEMENT_TYPES.DETAILING,
    points: 250,
    icon: <SprayCan className="text-green-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 30,
  },
  {
    id: "detailing-4",
    title: "Ceramic Coating Expert",
    description: "Apply your first ceramic coating",
    type: ACHIEVEMENT_TYPES.DETAILING,
    points: 300,
    icon: <SprayCan className="text-green-400" />,
    status: ACHIEVEMENT_STATUS.LOCKED,
    progress: 0,
  },
  
  // Track Day achievements
  {
    id: "track-1",
    title: "Track Day Rookie",
    description: "Attend your first track day event",
    type: ACHIEVEMENT_TYPES.TRACK_DAY,
    points: 200,
    icon: <Clock className="text-yellow-400" />,
    status: ACHIEVEMENT_STATUS.COMPLETED,
    progress: 100,
  },
  {
    id: "track-2",
    title: "Corner King",
    description: "Master 5 tracks in your region",
    type: ACHIEVEMENT_TYPES.TRACK_DAY,
    points: 500,
    icon: <Clock className="text-yellow-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 40,
  },
  {
    id: "track-3",
    title: "Consistent Performer",
    description: "Complete 10 track sessions with no incidents",
    type: ACHIEVEMENT_TYPES.TRACK_DAY,
    points: 350,
    icon: <Clock className="text-yellow-400" />,
    status: ACHIEVEMENT_STATUS.LOCKED,
    progress: 0,
  },
  
  // Event attendance achievements
  {
    id: "event-1",
    title: "Community Supporter",
    description: "Attend your first GoTime community event",
    type: ACHIEVEMENT_TYPES.ATTENDANCE,
    points: 100,
    icon: <Calendar className="text-purple-400" />,
    status: ACHIEVEMENT_STATUS.COMPLETED,
    progress: 100,
  },
  {
    id: "event-2",
    title: "Event Regular",
    description: "Attend 5 GoTime community events",
    type: ACHIEVEMENT_TYPES.ATTENDANCE,
    points: 250,
    icon: <Calendar className="text-purple-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 60,
  },
  {
    id: "event-3",
    title: "Car Show Enthusiast",
    description: "Register your vehicle in 3 car shows",
    type: ACHIEVEMENT_TYPES.ATTENDANCE,
    points: 300,
    icon: <Calendar className="text-purple-400" />,
    status: ACHIEVEMENT_STATUS.LOCKED,
    progress: 0,
  },
  
  // Community achievements
  {
    id: "community-1",
    title: "Social Starter",
    description: "Create your first post in the community feed",
    type: ACHIEVEMENT_TYPES.COMMUNITY,
    points: 50,
    icon: <Heart className="text-red-400" />,
    status: ACHIEVEMENT_STATUS.COMPLETED,
    progress: 100,
  },
  {
    id: "community-2",
    title: "Popular Driver",
    description: "Receive 50 likes on your content",
    type: ACHIEVEMENT_TYPES.COMMUNITY,
    points: 200,
    icon: <Heart className="text-red-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 70,
  },
  {
    id: "community-3",
    title: "Content Creator",
    description: "Share 10 original photos or videos",
    type: ACHIEVEMENT_TYPES.COMMUNITY,
    points: 300,
    icon: <Share2 className="text-red-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 50,
  },
  
  // Collector achievements
  {
    id: "collector-1",
    title: "Collection Started",
    description: "Add your first vehicle to your garage",
    type: ACHIEVEMENT_TYPES.COLLECTOR,
    points: 100,
    icon: <CircleCheck className="text-orange-400" />,
    status: ACHIEVEMENT_STATUS.COMPLETED,
    progress: 100,
  },
  {
    id: "collector-2",
    title: "Garage Expansion",
    description: "Add 3 vehicles to your garage",
    type: ACHIEVEMENT_TYPES.COLLECTOR,
    points: 250,
    icon: <CircleCheck className="text-orange-400" />,
    status: ACHIEVEMENT_STATUS.IN_PROGRESS,
    progress: 66,
  },
  {
    id: "collector-3",
    title: "Dream Car Achieved",
    description: "Mark a vehicle as your dream car and document its acquisition",
    type: ACHIEVEMENT_TYPES.COLLECTOR,
    points: 500,
    icon: <CircleCheck className="text-orange-400" />,
    status: ACHIEVEMENT_STATUS.LOCKED,
    progress: 0,
  },
];

// Mock category information
const ACHIEVEMENT_CATEGORIES = [
  {
    id: ACHIEVEMENT_TYPES.DRIVING,
    title: "Driving",
    icon: <Car className="text-blue-400" />,
    color: "blue",
  },
  {
    id: ACHIEVEMENT_TYPES.DETAILING,
    title: "Detailing",
    icon: <SprayCan className="text-green-400" />,
    color: "green",
  },
  {
    id: ACHIEVEMENT_TYPES.TRACK_DAY,
    title: "Track Days",
    icon: <Clock className="text-yellow-400" />,
    color: "yellow",
  },
  {
    id: ACHIEVEMENT_TYPES.ATTENDANCE,
    title: "Events",
    icon: <Calendar className="text-purple-400" />,
    color: "purple",
  },
  {
    id: ACHIEVEMENT_TYPES.COMMUNITY,
    title: "Community",
    icon: <Heart className="text-red-400" />,
    color: "red",
  },
  {
    id: ACHIEVEMENT_TYPES.COLLECTOR,
    title: "Collector",
    icon: <CircleCheck className="text-orange-400" />,
    color: "orange",
  },
];

const PodiumPursuitPage: React.FC = () => {
  const { userRewards, pointsToNextLevel } = useRewards();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedAchievements, setExpandedAchievements] = useState<{[key: string]: boolean}>({});

  // Get level icon based on driver level
  const getLevelIcon = () => {
    const driverLevel = userRewards.level;
    switch (true) {
      case driverLevel >= 25:
        return <Trophy className="text-purple-400 h-6 w-6" />;
      case driverLevel >= 20:
        return <Trophy className="text-yellow-400 h-6 w-6" />;
      case driverLevel >= 15:
        return <Award className="text-blue-400 h-6 w-6" />;
      case driverLevel >= 10:
        return <Medal className="text-green-400 h-6 w-6" />;
      case driverLevel >= 5:
        return <Star className="text-orange-400 h-6 w-6" />;
      default:
        return <Trophy className="text-gray-400 h-6 w-6" />;
    }
  };

  // Get appropriate level name from predefined ranks
  const getLevelName = () => {
    const driverLevel = userRewards.level;
    const rank = DRIVER_RANKS.find(rank => driverLevel >= rank.minLevel);
    return rank ? rank.title : "Driver";
  };
  
  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };
  
  // Toggle achievement details
  const toggleAchievement = (achievementId: string) => {
    setExpandedAchievements(prev => ({
      ...prev,
      [achievementId]: !prev[achievementId]
    }));
  };
  
  // Filter achievements by category if one is selected
  const filteredAchievements = selectedCategory 
    ? ACHIEVEMENTS.filter(a => a.type === selectedCategory)
    : ACHIEVEMENTS;
  
  // Calculate stats
  const stats = {
    totalAchievements: ACHIEVEMENTS.length,
    completed: ACHIEVEMENTS.filter(a => a.status === ACHIEVEMENT_STATUS.COMPLETED).length,
    inProgress: ACHIEVEMENTS.filter(a => a.status === ACHIEVEMENT_STATUS.IN_PROGRESS).length,
    locked: ACHIEVEMENTS.filter(a => a.status === ACHIEVEMENT_STATUS.LOCKED).length,
  };

  // Get completion percentage
  const completionPercentage = Math.round((stats.completed / stats.totalAchievements) * 100);
  
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      {/* Hero section with user level info */}
      <div className="bg-gradient-to-b from-blue-900/30 to-transparent pt-8 pb-4 mb-6">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-orbitron text-center mb-2">Podium Pursuit</h1>
          <p className="text-gray-400 text-center mb-8">Track your achievements and rise through the ranks</p>
          
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl shadow-lg border border-blue-900/50 p-6 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4 sm:mb-0 sm:mr-6">
                {getLevelIcon()}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-orbitron text-blue-400 mb-1">Level {userRewards.level} {getLevelName()}</h2>
                <div className="text-lg text-yellow-400 font-bold flex items-center justify-center sm:justify-start">
                  <Star className="h-5 w-5 mr-2" />
                  {userRewards.totalPoints} points
                </div>
              </div>
            </div>
            
            <div className="mb-2">
              <div className="w-full bg-gray-800 rounded-full h-3 mb-1">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  style={{ width: `${Math.min(100, (userRewards.totalPoints / (userRewards.totalPoints + pointsToNextLevel)) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Level {userRewards.level}</span>
                <span className="flex items-center">
                  <Trophy className="inline h-3 w-3 mr-1 text-blue-400" />
                  {pointsToNextLevel} points to Level {userRewards.level + 1}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-blue-400 text-3xl font-orbitron mb-1">{stats.totalAchievements}</div>
            <div className="text-gray-400 text-sm">Total Achievements</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-green-400 text-3xl font-orbitron mb-1">{stats.completed}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-yellow-400 text-3xl font-orbitron mb-1">{stats.inProgress}</div>
            <div className="text-gray-400 text-sm">In Progress</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 text-center">
            <div className="text-blue-400 text-3xl font-orbitron mb-1">{completionPercentage}%</div>
            <div className="text-gray-400 text-sm">Completion</div>
          </div>
        </div>
        
        {/* Tracks summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-orbitron text-white mb-4">Achievement Tracks</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ACHIEVEMENT_CATEGORIES.map((category) => (
              <div 
                key={category.id}
                className={`bg-gray-900 border ${selectedCategory === category.id ? 'border-blue-500' : 'border-gray-800'} 
                  rounded-lg p-4 cursor-pointer transition-all hover:border-blue-500`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex justify-center mb-2">
                  {React.cloneElement(category.icon, { className: `h-8 w-8 text-${category.color}-400` })}
                </div>
                <div className="text-center">
                  <div className="text-white font-medium mb-1">{category.title}</div>
                  <div className="text-sm text-blue-400">
                    {ACHIEVEMENTS.filter(a => a.type === category.id && a.status === ACHIEVEMENT_STATUS.COMPLETED).length} / {ACHIEVEMENTS.filter(a => a.type === category.id).length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Achievements list */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-orbitron text-white">
              {selectedCategory 
                ? `${ACHIEVEMENT_CATEGORIES.find(c => c.id === selectedCategory)?.title} Achievements` 
                : 'All Achievements'}
            </h2>
            {selectedCategory && (
              <button 
                className="text-blue-400 hover:text-blue-300 font-medium"
                onClick={() => setSelectedCategory(null)}
              >
                View All
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {filteredAchievements.map((achievement) => (
              <div 
                key={achievement.id}
                className={`bg-gray-900 border ${achievement.status === ACHIEVEMENT_STATUS.COMPLETED ? 'border-green-500/30' : 
                  achievement.status === ACHIEVEMENT_STATUS.IN_PROGRESS ? 'border-yellow-500/30' : 'border-gray-700'} 
                  rounded-lg overflow-hidden`}
              >
                <div 
                  className="flex items-center p-4 cursor-pointer"
                  onClick={() => toggleAchievement(achievement.id)}
                >
                  <div className="mr-4">
                    {achievement.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-orbitron text-white">
                        {achievement.title}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-yellow-400 font-bold">{achievement.points}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      {achievement.description}
                    </div>
                    {achievement.status !== ACHIEVEMENT_STATUS.COMPLETED && (
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${achievement.status === ACHIEVEMENT_STATUS.IN_PROGRESS ? 'bg-yellow-500' : 'bg-gray-700'}`}
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {expandedAchievements[achievement.id] ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Expanded details */}
                {expandedAchievements[achievement.id] && (
                  <div className="p-4 pt-0 border-t border-gray-800">
                    <div className="text-sm text-gray-400 mb-2">
                      {achievement.status === ACHIEVEMENT_STATUS.COMPLETED ? (
                        <div className="flex items-center text-green-400">
                          <CircleCheck className="h-4 w-4 mr-2" />
                          Completed
                        </div>
                      ) : achievement.status === ACHIEVEMENT_STATUS.IN_PROGRESS ? (
                        <div>In Progress - {achievement.progress}%</div>
                      ) : (
                        <div>Locked - Complete previous achievements to unlock</div>
                      )}
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <div className="mb-2">
                        <span className="text-gray-500">Category: </span>
                        <span className="text-white">{ACHIEVEMENT_CATEGORIES.find(c => c.id === achievement.type)?.title}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Unlocks: </span>
                        <span className="text-white">Driver Points and Level Progress</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodiumPursuitPage;