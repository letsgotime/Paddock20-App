import React, { useState } from 'react';
import { 
  Trophy, Award, Star, Medal, Check, Car, SprayCan, Calendar, Users, 
  Gauge, BarChart, Flag, Activity, CircleCheck, CircleDashed, 
  Watch, Briefcase, Compass, Terminal, ChevronRight, X, Clock,
  Milestone, BarChart2, FileText, AlertCircle
} from 'lucide-react';
import { useRewards } from '../contexts/RewardsContext';
// Use Inline PageTitle to avoid module import issues
const PageTitle: React.FC<{title: string, subtitle?: string, icon?: React.ReactNode}> = ({ 
  title, subtitle, icon 
}) => (
  <div className="mb-8">
    <div className="flex items-center">
      {icon && <div className="mr-3">{icon}</div>}
      <h1 className="text-2xl md:text-3xl font-orbitron text-white">{title}</h1>
    </div>
    {subtitle && <p className="text-gray-400 mt-2 max-w-3xl">{subtitle}</p>}
  </div>
);

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

// Achievement categories
const ACHIEVEMENT_CATEGORIES = [
  { 
    id: 'driving', 
    name: 'Driving Mastery', 
    icon: <Car className="h-5 w-5 mr-2 text-blue-400" />,
    color: 'blue',
    description: 'Achievements earned through driving activities and road adventures.',
    achievements: [
      { id: 'first_drive_log', title: 'First Drive Log', points: 25, completed: true, description: 'Log your first drive in the Drive Journal', icon: '🚗' },
      { id: 'mountain_drive', title: 'Mountain Master', points: 50, completed: true, description: 'Complete a drive on a mountain road with elevation changes exceeding 1,000 feet', icon: '⛰️' },
      { id: 'night_drive', title: 'Night Owl', points: 30, completed: true, description: 'Complete and log a night drive of at least 1 hour', icon: '🌙' },
      { id: 'sunrise_drive', title: 'Sunrise Chaser', points: 40, completed: false, description: 'Complete a drive that starts before sunrise', icon: '🌅' },
      { id: 'fun_drive_plan', title: 'Route Engineer', points: 35, completed: true, description: 'Create your first custom route in the Fun Drive Planner', icon: '🗺️' },
      { id: 'long_journey', title: 'Long Hauler', points: 100, completed: false, description: 'Complete a single drive of over 200 miles', icon: '🛣️' },
      { id: 'different_seasons', title: 'Four Season Driver', points: 120, completed: false, description: 'Log drives in all four seasons', icon: '🍂' },
      { id: 'different_weather', title: 'Weather Warrior', points: 75, completed: false, description: 'Log drives in 5 different weather conditions', icon: '🌦️' }
    ]
  },
  { 
    id: 'detailing', 
    name: 'Detailing Excellence', 
    icon: <SprayCan className="h-5 w-5 mr-2 text-green-400" />,
    color: 'green',
    description: 'Achievements earned through vehicle care and detailing activities.',
    achievements: [
      { id: 'first_wash', title: 'First Wash', points: 20, completed: true, description: 'Complete your first documented vehicle wash', icon: '💦' },
      { id: 'juice_box', title: 'Juice Box Explorer', points: 30, completed: true, description: 'Browse all sections of the Juice Box', icon: '📦' },
      { id: 'gloss_reset', title: 'Gloss Reset Master', points: 75, completed: false, description: 'Complete a full Gloss Reset procedure', icon: '✨' },
      { id: 'seasonal_prep', title: 'Seasonal Preparer', points: 50, completed: false, description: 'Complete a seasonal checklist and detailing session', icon: '🍁' },
      { id: 'product_collection', title: 'Product Collector', points: 60, completed: true, description: 'Add 10+ products to your detailing collection', icon: '🧴' },
      { id: 'wheels_deep_clean', title: 'Wheel Wizard', points: 45, completed: true, description: 'Perform a deep clean of wheels and calipers', icon: '🛞' },
      { id: 'paint_correction', title: 'Paint Perfectionist', points: 100, completed: false, description: 'Complete your first paint correction process', icon: '🎨' },
      { id: 'ceramic_coat', title: 'Ceramic Master', points: 150, completed: false, description: 'Apply a ceramic coating to your vehicle', icon: '🔮' }
    ]
  },
  { 
    id: 'track_days', 
    name: 'Track Performance', 
    icon: <Gauge className="h-5 w-5 mr-2 text-red-400" />,
    color: 'red',
    description: 'Achievements earned through track days and performance driving.',
    achievements: [
      { id: 'first_track_day', title: 'Track Day Rookie', points: 75, completed: true, description: 'Attend your first track day event', icon: '🏁' },
      { id: 'apex_hunter', title: 'Apex Hunter', points: 100, completed: false, description: 'Master the racing line at a track session', icon: '📐' },
      { id: 'lap_time', title: 'Personal Best', points: 120, completed: false, description: 'Beat your personal lap time by at least 5%', icon: '⏱️' },
      { id: 'different_tracks', title: 'Track Explorer', points: 150, completed: false, description: 'Drive on 3 different tracks', icon: '🗺️' },
      { id: 'racing_school', title: 'Student of Speed', points: 200, completed: false, description: 'Complete a performance driving school course', icon: '🎓' },
      { id: 'autocross', title: 'Cone Slayer', points: 100, completed: true, description: 'Participate in an autocross event', icon: '🏎️' },
      { id: 'drag_strip', title: 'Straight Line Specialist', points: 100, completed: false, description: 'Run your car at a drag strip', icon: '🚀' },
      { id: 'endurance_event', title: 'Endurance Pilot', points: 250, completed: false, description: 'Participate in an endurance racing event', icon: '⏳' }
    ]
  },
  { 
    id: 'events', 
    name: 'Events & Meets', 
    icon: <Calendar className="h-5 w-5 mr-2 text-purple-400" />,
    color: 'purple',
    description: 'Achievements earned through attending automotive events and meets.',
    achievements: [
      { id: 'first_car_meet', title: 'First Meet', points: 50, completed: true, description: 'Attend your first car meet or show', icon: '👥' },
      { id: 'car_show_entry', title: 'Show Entrant', points: 75, completed: true, description: 'Enter your vehicle in a car show', icon: '🏆' },
      { id: 'first_trophy', title: 'Trophy Hunter', points: 100, completed: false, description: 'Win an award at a car show or event', icon: '🏆' },
      { id: 'charity_event', title: 'Charitable Driver', points: 75, completed: false, description: 'Participate in a charity automotive event', icon: '❤️' },
      { id: 'road_rally', title: 'Rally Participant', points: 100, completed: true, description: 'Participate in an organized road rally', icon: '🚩' },
      { id: 'major_auto_show', title: 'Show Explorer', points: 80, completed: false, description: 'Attend a major international auto show', icon: '🌎' },
      { id: 'manufacturer_event', title: 'Brand Loyalty', points: 70, completed: false, description: 'Attend a manufacturer-specific event', icon: '🏭' },
      { id: 'overnight_event', title: 'Weekend Warrior', points: 120, completed: false, description: 'Attend a multi-day automotive event', icon: '🌙' }
    ]
  },
  { 
    id: 'community', 
    name: 'Community Impact', 
    icon: <Users className="h-5 w-5 mr-2 text-orange-400" />,
    color: 'orange',
    description: 'Achievements earned through community interaction and contribution.',
    achievements: [
      { id: 'profile_complete', title: 'Identity Established', points: 25, completed: true, description: 'Complete your driver profile', icon: '👤' },
      { id: 'forum_posts', title: 'Voice in the Community', points: 50, completed: true, description: 'Make 10+ posts in the community forums', icon: '💬' },
      { id: 'photo_share', title: 'Photographer', points: 40, completed: true, description: 'Share 5+ photos of your vehicle', icon: '📸' },
      { id: 'tech_advice', title: 'Knowledge Sharer', points: 60, completed: false, description: 'Help 5+ members with technical advice', icon: '🧠' },
      { id: 'new_member', title: 'Recruiter', points: 75, completed: false, description: 'Refer a new member who joins Paddock20', icon: '👋' },
      { id: 'meet_organizer', title: 'Event Organizer', points: 100, completed: false, description: 'Organize a community meet or drive', icon: '📅' },
      { id: 'tutorial_share', title: 'Mentor', points: 80, completed: false, description: 'Create and share a tutorial or guide', icon: '📚' },
      { id: 'featured_member', title: 'Community Star', points: 150, completed: false, description: 'Be featured as Member of the Month', icon: '⭐' }
    ]
  },
  { 
    id: 'collector', 
    name: 'Collector Journey', 
    icon: <Briefcase className="h-5 w-5 mr-2 text-yellow-400" />,
    color: 'yellow',
    description: 'Achievements earned through vehicle collection and ownership.',
    achievements: [
      { id: 'first_garage_entry', title: 'Garage Initialized', points: 20, completed: true, description: 'Add your first vehicle to the Garage Vault', icon: '🚘' },
      { id: 'vehicle_history', title: 'Historian', points: 50, completed: true, description: 'Complete full vehicle history documentation', icon: '📜' },
      { id: 'multi_vehicle', title: 'Collection Started', points: 75, completed: false, description: 'Add a second vehicle to your garage', icon: '🏎️' },
      { id: 'classic_car', title: 'Vintage Soul', points: 100, completed: false, description: 'Own a classic car (25+ years old)', icon: '🕰️' },
      { id: 'timepiece_collector', title: 'Time Connoisseur', points: 75, completed: false, description: 'Add your first timepiece to your collection', icon: '⌚' },
      { id: 'rare_vehicle', title: 'Rarity Hunter', points: 150, completed: false, description: 'Own a limited production vehicle (under 5,000 units)', icon: '💎' },
      { id: 'different_brands', title: 'Brand Explorer', points: 120, completed: false, description: 'Own vehicles from 3+ different manufacturers', icon: '🔄' },
      { id: 'investment_grade', title: 'Investment Visionary', points: 200, completed: false, description: 'Own an investment-grade collector vehicle', icon: '📈' }
    ]
  }
];

const PodiumPursuitPage: React.FC = () => {
  const { userRewards, pointsToNextLevel } = useRewards();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedAchievements, setExpandedAchievements] = useState<{[key: string]: boolean}>({});
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);

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

  // Calculate total achievements and completion ratio
  const calculateProgress = (categoryId: string | null) => {
    const relevantCategories = categoryId 
      ? ACHIEVEMENT_CATEGORIES.filter(cat => cat.id === categoryId)
      : ACHIEVEMENT_CATEGORIES;
    
    const totalAchievements = relevantCategories.reduce((acc, cat) => acc + cat.achievements.length, 0);
    const completedAchievements = relevantCategories.reduce((acc, cat) => 
      acc + cat.achievements.filter(ach => ach.completed).length, 0);
    
    return { total: totalAchievements, completed: completedAchievements };
  };

  // Toggle achievement details view
  const toggleAchievementDetails = (categoryId: string) => {
    setExpandedAchievements(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Get progress stats for all categories
  const allProgress = calculateProgress(null);
  const completionPercentage = Math.round((allProgress.completed / allProgress.total) * 100);

  return (
    <div className="podium-pursuit-page pb-12">
      <PageTitle 
        title="Podium Pursuit™" 
        subtitle="Your performance journey through achievements, rewards, and milestones"
        icon={<Medal className="text-blue-400 h-7 w-7" />}
      />

      {/* Main driver stats panel */}
      <section className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-xl p-6 mb-8 border border-blue-900/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col justify-center items-center md:items-start">
            <div className="flex items-center">
              {getLevelIcon()}
              <h2 className="ml-2 font-orbitron text-xl text-blue-400">Level {userRewards.level} {getLevelName()}</h2>
            </div>
            <div className="flex items-center mt-2">
              <Star className="text-yellow-400 h-5 w-5 mr-2" />
              <span className="text-yellow-400 font-bold text-lg">{userRewards.totalPoints.toLocaleString()} pts</span>
            </div>
            <div className="w-full max-w-xs bg-gray-800 rounded-full h-3 mt-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-green-500" 
                style={{ width: `${Math.min(100, (userRewards.totalPoints / (userRewards.totalPoints + pointsToNextLevel)) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between w-full max-w-xs text-xs text-gray-400 mt-1">
              <span>Level {userRewards.level}</span>
              <span className="flex items-center">
                <Trophy className="inline h-3 w-3 mr-1 text-blue-400" />
                {pointsToNextLevel.toLocaleString()} pts to Level {userRewards.level + 1}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center">
            <div className="w-32 h-32 relative">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="12" />
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="12" 
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 * (1 - completionPercentage / 100)} 
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="font-orbitron text-3xl text-white">{completionPercentage}%</span>
                <span className="text-xs text-gray-400">Completed</span>
              </div>
            </div>
            <p className="mt-3 text-center text-gray-300">
              {allProgress.completed} of {allProgress.total} achievements unlocked
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ACHIEVEMENT_CATEGORIES.map(category => (
              <div 
                key={category.id}
                className="bg-gray-800/50 border border-gray-700 rounded p-2 text-center hover:bg-gray-700/50 cursor-pointer transition-colors"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex justify-center mb-1">
                  {category.icon}
                </div>
                <p className="text-xs text-gray-300">{category.name}</p>
                <div className="mt-1 text-xs text-gray-400">
                  {calculateProgress(category.id).completed}/{calculateProgress(category.id).total}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Achievements Section */}
      <section className="mb-8">
        <h3 className="text-lg font-orbitron text-white mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-400" />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userRewards && userRewards.rewards ? 
            userRewards.rewards.slice(-4).map((reward) => (
              <div key={reward.id} className="bg-gray-900/90 border border-blue-900/20 p-4 rounded-lg flex items-start">
                <div className="mr-3 text-2xl">{reward.icon}</div>
                <div>
                  <div className="text-white font-medium">{reward.title}</div>
                  <div className="text-sm text-blue-300 mt-1">{reward.points} pts</div>
                  <div className="text-xs text-gray-400 mt-1">Earned today</div>
                </div>
              </div>
            ))
           : 
            <div className="col-span-4 bg-gray-900/90 border border-blue-900/20 p-4 rounded-lg">
              <p className="text-gray-400 text-center">No recent achievements yet. Complete challenges to earn rewards!</p>
            </div>
          }
        </div>
      </section>

      {/* Achievement Categories Section */}
      <section>
        <h3 className="text-lg font-orbitron text-white mb-4 flex items-center">
          <Flag className="h-5 w-5 mr-2 text-blue-400" />
          Achievement Categories
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ACHIEVEMENT_CATEGORIES.map(category => {
            const progress = calculateProgress(category.id);
            const categoryPercentage = Math.round((progress.completed / progress.total) * 100);
            
            return (
              <div 
                key={category.id} 
                className={`bg-gray-900/90 border border-${category.color}-900/30 rounded-lg overflow-hidden`}
              >
                {/* Category Header */}
                <div 
                  className={`bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center justify-between cursor-pointer`}
                  onClick={() => toggleAchievementDetails(category.id)}
                >
                  <div className="flex items-center">
                    {category.icon}
                    <h4 className="font-orbitron text-white">{category.name}</h4>
                  </div>
                  <div className="flex items-center">
                    <div className="text-sm text-gray-400 mr-3">
                      {progress.completed}/{progress.total}
                    </div>
                    <div className="w-20 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full bg-${category.color}-500`}
                        style={{ width: `${categoryPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Achievement List */}
                {expandedAchievements[category.id] && (
                  <div className="p-4">
                    <p className="text-sm text-gray-400 mb-4">{category.description}</p>
                    
                    <div className="space-y-3">
                      {category.achievements.map(achievement => (
                        <div 
                          key={achievement.id} 
                          className={`p-3 rounded-lg ${achievement.completed ? 'bg-gray-800/50' : 'bg-gray-800/20'}`}
                        >
                          <div className="flex items-start">
                            <div className="mr-3 text-xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <h5 className={`font-medium ${achievement.completed ? 'text-white' : 'text-gray-400'}`}>
                                  {achievement.title}
                                </h5>
                                {achievement.completed && (
                                  <CircleCheck className="h-4 w-4 ml-2 text-green-500" />
                                )}
                                <div className="group relative ml-2">
                                  <AlertCircle className="h-4 w-4 text-blue-400 cursor-help" />
                                  <div className="absolute z-50 invisible group-hover:visible bg-gray-900 border border-blue-900/50 p-3 rounded-md 
                                    shadow-xl w-64 left-0 md:left-auto md:right-0 mt-2 text-sm">
                                    <span className="font-medium text-white block mb-1">How to earn points:</span>
                                    <ul className="text-gray-300 text-xs space-y-1.5">
                                      {category.id === 'driving' && achievement.id === 'first_drive_log' && (
                                        <>
                                          <li>• Log your first drive in the Drive Journal (+25 pts)</li>
                                          <li>• Include route details and at least one photo (+5 bonus pts)</li>
                                          <li>• Add mood and weather conditions (+5 bonus pts)</li>
                                        </>
                                      )}
                                      {category.id === 'driving' && achievement.id === 'mountain_drive' && (
                                        <>
                                          <li>• Log a drive with elevation change exceeding 1,000 ft (+50 pts)</li>
                                          <li>• Upload GPS data verifying elevation change (+10 bonus pts)</li>
                                          <li>• Include 3+ photos from different elevations (+10 bonus pts)</li>
                                        </>
                                      )}
                                      {category.id === 'detailing' && achievement.id === 'first_wash' && (
                                        <>
                                          <li>• Complete and document your first wash (+20 pts)</li>
                                          <li>• Log all products used in the process (+5 bonus pts)</li>
                                          <li>• Include before/after photos (+5 bonus pts)</li>
                                        </>
                                      )}
                                      {category.id === 'detailing' && achievement.id === 'gloss_reset' && (
                                        <>
                                          <li>• Complete all steps in the Gloss Reset procedure (+75 pts)</li>
                                          <li>• Document each step with photos (+15 bonus pts)</li>
                                          <li>• Log time spent on each phase (+10 bonus pts)</li>
                                        </>
                                      )}
                                      {category.id === 'track_days' && achievement.id === 'first_track_day' && (
                                        <>
                                          <li>• Log your first track day event (+75 pts)</li>
                                          <li>• Record lap times for at least 3 laps (+15 bonus pts)</li>
                                          <li>• Include video of your best lap (+25 bonus pts)</li>
                                        </>
                                      )}
                                      {category.id === 'community' && achievement.id === 'profile_complete' && (
                                        <>
                                          <li>• Complete all required profile fields (+25 pts)</li>
                                          <li>• Add a profile photo (+5 bonus pts)</li>
                                          <li>• Link your social accounts (+5 bonus pts)</li>
                                        </>
                                      )}
                                      {category.id === 'collector' && achievement.id === 'first_garage_entry' && (
                                        <>
                                          <li>• Add your first vehicle to the Garage Vault (+20 pts)</li>
                                          <li>• Include comprehensive vehicle details (+5 bonus pts)</li>
                                          <li>• Add at least 3 photos of your vehicle (+5 bonus pts)</li>
                                        </>
                                      )}
                                      {/* Default explanation for achievements without specific tooltips */}
                                      {!((category.id === 'driving' && (achievement.id === 'first_drive_log' || achievement.id === 'mountain_drive')) ||
                                         (category.id === 'detailing' && (achievement.id === 'first_wash' || achievement.id === 'gloss_reset')) ||
                                         (category.id === 'track_days' && achievement.id === 'first_track_day') ||
                                         (category.id === 'community' && achievement.id === 'profile_complete') ||
                                         (category.id === 'collector' && achievement.id === 'first_garage_entry')) && (
                                        <>
                                          <li>• Complete the specified achievement (+{achievement.points} pts)</li>
                                          <li>• Add supporting documentation (+bonus pts)</li>
                                          <li>• Share your achievement in the community (+bonus pts)</li>
                                        </>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                              <div className="text-sm text-blue-300 mt-1">{achievement.points} pts</div>
                            </div>
                            <div className="ml-2">
                              {achievement.completed ? (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Open the activity log dialog for this achievement
                                    setSelectedAchievement(achievement.id);
                                  }}
                                  className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded hover:bg-green-500/30 transition-colors flex items-center"
                                >
                                  <span>Activity Log</span>
                                  <ChevronRight className="h-3 w-3 ml-1" />
                                </button>
                              ) : (
                                <div className="bg-gray-700/50 text-gray-400 text-xs px-2 py-1 rounded flex items-center">
                                  <span>Incomplete</span>
                                  {category.id === 'driving' && !achievement.completed && achievement.id === 'drive-log-10' && (
                                    <span className="ml-1 text-blue-400">(7/10)</span>
                                  )}
                                  {category.id === 'detailing' && !achievement.completed && achievement.id === 'gloss-reset' && (
                                    <span className="ml-1 text-blue-400">(2/3)</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress indicators for incomplete achievements */}
                          {!achievement.completed && (
                            <div className="mt-3 pt-2 border-t border-gray-700/50">
                              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                {category.id === 'driving' && achievement.id === 'drive-log-10' && (
                                  <span>7/10 drives logged</span>
                                )}
                                {category.id === 'detailing' && achievement.id === 'gloss-reset' && (
                                  <span>2/3 steps completed</span>
                                )}
                                {category.id === 'track_days' && achievement.id === 'different_tracks' && (
                                  <span>1/3 tracks visited</span>
                                )}
                                {category.id === 'events' && achievement.id === 'charity_event' && (
                                  <span>0/1 events attended</span>
                                )}
                                {category.id === 'community' && achievement.id === 'tech_advice' && (
                                  <span>2/5 members helped</span>
                                )}
                                {category.id === 'collector' && achievement.id === 'multi_vehicle' && (
                                  <span>1/2 vehicles added</span>
                                )}
                              </div>
                              <div className="w-full bg-gray-700/30 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-full bg-${category.color}-600/50`}
                                  style={{ 
                                    width: category.id === 'driving' && achievement.id === 'drive-log-10' ? '70%' :
                                           category.id === 'detailing' && achievement.id === 'gloss-reset' ? '66%' :
                                           category.id === 'track_days' && achievement.id === 'different_tracks' ? '33%' :
                                           category.id === 'events' && achievement.id === 'charity_event' ? '0%' :
                                           category.id === 'community' && achievement.id === 'tech_advice' ? '40%' :
                                           category.id === 'collector' && achievement.id === 'multi_vehicle' ? '50%' : '0%'
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Seasonal Events & Special Challenges */}
      <section className="mt-10">
        <h3 className="text-lg font-orbitron text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-green-400" />
          Seasonal Events & Special Challenges
        </h3>
        
        <div className="bg-gray-900/90 border border-green-900/30 rounded-lg p-6">
          <div className="text-center p-6">
            <Milestone className="h-12 w-12 mx-auto mb-4 text-green-400 opacity-70" />
            <h4 className="font-orbitron text-xl text-white mb-2">Summer Driving Season</h4>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Special seasonal challenges available June through August. 
              Complete summer-specific achievements for bonus points and exclusive rewards.
            </p>
            <button className="mt-4 px-6 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-md font-medium hover:bg-green-600/30 transition-colors">
              View Summer Challenges
            </button>
          </div>
        </div>
      </section>

      {/* Rank Progression */}
      <section className="mt-10">
        <h3 className="text-lg font-orbitron text-white mb-4 flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-blue-400" />
          Driver Rank Progression
        </h3>
        
        <div className="bg-gray-900/90 border border-blue-900/30 rounded-lg p-6">
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-gray-800"></div>
            
            {DRIVER_RANKS.slice().reverse().map((rank, index) => {
              const isCurrentRank = userRewards.level >= rank.minLevel;
              const isNextRank = !isCurrentRank && 
                DRIVER_RANKS.slice().reverse()[index - 1] && 
                userRewards.level >= DRIVER_RANKS.slice().reverse()[index - 1].minLevel;
              
              return (
                <div key={rank.title} className="relative ml-6 pb-6">
                  <div className={`absolute left-[-24px] w-5 h-5 rounded-full border-2 
                    ${isCurrentRank 
                      ? 'bg-blue-500 border-blue-300' 
                      : isNextRank 
                        ? 'bg-blue-900/50 border-blue-500' 
                        : 'bg-gray-800 border-gray-700'}`}>
                  </div>
                  
                  <div className={`flex items-center ${isCurrentRank ? 'text-white' : 'text-gray-500'}`}>
                    <div className="font-orbitron">
                      Level {rank.minLevel}+ : {rank.title}
                    </div>
                    
                    {isCurrentRank && (
                      <div className="ml-3 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        Current Rank
                      </div>
                    )}
                    
                    {isNextRank && (
                      <div className="ml-3 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                        Next Goal
                      </div>
                    )}
                  </div>
                  
                  {isNextRank && (
                    <div className="mt-1 text-sm text-blue-300">
                      {pointsToNextLevel} points needed to reach this rank
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer with links */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <button className="px-4 py-2 bg-blue-900/20 text-blue-400 border border-blue-500/30 rounded-md font-medium hover:bg-blue-900/30 transition-colors flex items-center">
          <BarChart2 className="h-4 w-4 mr-2" />
          View All Statistics
        </button>
        <button className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-md font-medium hover:bg-gray-700 transition-colors flex items-center">
          <Terminal className="h-4 w-4 mr-2" />
          Export Achievement Data
        </button>
        <button className="px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-md font-medium hover:bg-gray-700 transition-colors flex items-center">
          <Compass className="h-4 w-4 mr-2" />
          Achievement Settings
        </button>
      </div>

      {/* Activity Log Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-blue-900/30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-orbitron text-white text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-400" />
                Achievement Activity Log
              </h3>
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {(() => {
                // Find the achievement details
                let achievement;
                let category;
                
                for (const cat of ACHIEVEMENT_CATEGORIES) {
                  const found = cat.achievements.find(a => a.id === selectedAchievement);
                  if (found) {
                    achievement = found;
                    category = cat;
                    break;
                  }
                }
                
                if (!achievement) return <div>Achievement not found</div>;
                
                return (
                  <>
                    <div className="flex items-start mb-6">
                      <div className="mr-4 text-3xl">{achievement.icon}</div>
                      <div>
                        <h4 className="text-xl font-medium text-white">{achievement.title}</h4>
                        <p className="text-gray-400 mt-1">{achievement.description}</p>
                        <div className="flex items-center mt-2">
                          <div className="mr-3 bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm">
                            {achievement.points} points
                          </div>
                          <div className={`bg-${category?.color}-500/20 text-${category?.color}-400 px-2 py-1 rounded text-sm`}>
                            {category?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <h5 className="text-white font-medium mb-3 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-blue-400" />
                      Detailed Activity Log
                    </h5>
                    
                    <div className="border border-gray-800 rounded-lg overflow-hidden">
                      {/* Simulated activity log - this would be populated from user actions data */}
                      <div className="p-4 border-b border-gray-800 bg-gray-800/30">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="bg-green-500/20 text-green-500 p-1 rounded mr-3">
                              <Check className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-white font-medium">Achievement Completed</div>
                              <p className="text-sm text-gray-400 mt-1">
                                {selectedAchievement === 'first_drive_log' && 'You documented your first drive to Blue Ridge Parkway, earning this achievement'}
                                {selectedAchievement === 'mountain_drive' && 'You logged a drive on Tail of the Dragon with 1,200+ ft elevation change'}
                                {selectedAchievement === 'night_drive' && 'You completed a 2-hour night drive on April 28, 2025'}
                                {selectedAchievement === 'fun_drive_plan' && 'You created a custom route "Weekend Canyon Run" in Fun Drive Planner'}
                                {selectedAchievement === 'first_wash' && 'You documented your first complete wash and wax session'}
                                {selectedAchievement === 'juice_box' && 'You accessed all sections of the Juice Box knowledge repository'}
                                {selectedAchievement === 'product_collection' && 'You added 12 detailing products to your collection inventory'}
                                {selectedAchievement === 'wheels_deep_clean' && 'You documented a complete wheel cleaning with before/after photos'}
                                {selectedAchievement === 'first_track_day' && 'You logged your track day at Carolina Motorsports Park'}
                                {selectedAchievement === 'autocross' && 'You participated in Charlotte Region SCCA Autocross #4'}
                                {selectedAchievement === 'first_car_meet' && 'You checked in to Cars & Coffee Charlotte event'}
                                {selectedAchievement === 'car_show_entry' && 'You entered your vehicle in Concours in the Park show'}
                                {selectedAchievement === 'road_rally' && 'You participated in the Mountain Backroads Rally'}
                                {selectedAchievement === 'profile_complete' && 'You completed all sections of your driver profile'}
                                {selectedAchievement === 'forum_posts' && 'You reached 10+ posts in the community forums'}
                                {selectedAchievement === 'photo_share' && 'You shared 8 photos of your vehicle in the gallery'}
                                {selectedAchievement === 'first_garage_entry' && 'You added your first vehicle to the Garage Vault'}
                                {selectedAchievement === 'vehicle_history' && 'You completed documenting your full vehicle history'}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Today
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 border-b border-gray-800 bg-gray-800/20">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="bg-blue-500/20 text-blue-400 p-1 rounded mr-3">
                              <Activity className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-white font-medium">Progress Update</div>
                              <p className="text-sm text-gray-400 mt-1">
                                {selectedAchievement === 'first_drive_log' && 'Created a new drive entry with route details and photos'}
                                {selectedAchievement === 'mountain_drive' && 'Uploaded GPS data showing elevation changes on mountain route'}
                                {selectedAchievement === 'night_drive' && 'Completed a drive between 9:45 PM and 11:50 PM'}
                                {selectedAchievement === 'fun_drive_plan' && 'Route created and saved with 6 waypoints and route metadata'}
                                {selectedAchievement === 'first_wash' && 'Completed all steps in the wash workflow and logged results'}
                                {selectedAchievement === 'juice_box' && 'Accessed final section of Juice Box (Paint Correction Guide)'}
                                {selectedAchievement === 'product_collection' && 'Added three more products to reach the 10+ threshold'}
                                {selectedAchievement === 'wheels_deep_clean' && 'Logged wheel detailing with tire cleaning and dressing'}
                                {selectedAchievement === 'first_track_day' && 'Logged track session details, including lap count and conditions'}
                                {selectedAchievement === 'autocross' && 'Entered autocross results including cone penalties and time'}
                                {selectedAchievement === 'first_car_meet' && 'Logged event details and uploaded 3 photos'}
                                {selectedAchievement === 'car_show_entry' && 'Registered vehicle in show database and uploaded entry'}
                                {selectedAchievement === 'road_rally' && 'Logged rally checkpoint completions and finish time'}
                                {selectedAchievement === 'profile_complete' && 'Added final missing profile details (driver interests)'}
                                {selectedAchievement === 'forum_posts' && 'Made 3 more forum posts to reach the 10+ threshold'}
                                {selectedAchievement === 'photo_share' && 'Uploaded 3 more photos to reach the 5+ threshold'}
                                {selectedAchievement === 'first_garage_entry' && 'Added vehicle details including VIN and service history'}
                                {selectedAchievement === 'vehicle_history' && 'Added final maintenance records to complete history'}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Today
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/10">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div className="bg-yellow-500/20 text-yellow-400 p-1 rounded mr-3">
                              <AlertCircle className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-white font-medium">Achievement Unlocked</div>
                              <p className="text-sm text-gray-400 mt-1">
                                Achievement started tracking: {new Date().toLocaleDateString()}
                              </p>
                              <div className="mt-2 text-sm text-blue-400">
                                {achievement.points} points added to your total score
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Today
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        Achievement ID: {achievement.id}
                      </div>
                      <button className="px-3 py-1.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded font-medium hover:bg-blue-600/30 transition-colors text-sm flex items-center">
                        <FileText className="h-4 w-4 mr-1.5" />
                        Export Log
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
            
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="px-4 py-2 bg-gray-800 text-white rounded font-medium hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodiumPursuitPage;