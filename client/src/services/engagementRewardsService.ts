/**
 * engagementRewardsService.ts
 * 
 * This service manages the gamified engagement rewards system for user activities
 * across the Paddock20 platform. It tracks user actions, assigns points, and
 * unlocks achievements based on different engagement metrics.
 * 
 * Design by: Replit AI & GoTime Motorsports Engineering Team
 * Last updated: May 2025
 */

import { useUserProfileStore } from './userProfileService';
import ProfileDataCollector from './ProfileDataCollector';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  category: AchievementCategory;
  requiredPoints: number;
  unlocked: boolean;
  dateUnlocked?: string;
  level: number;
  nextLevel?: {
    title: string;
    requiredPoints: number;
  };
}

export interface RewardActivity {
  id: string;
  timestamp: string;
  type: ActivityType;
  description: string;
  pointsEarned: number;
  relatedEntityId?: string;
}

export type AchievementCategory = 
  | 'driving' 
  | 'maintenance' 
  | 'detailing' 
  | 'modification' 
  | 'community' 
  | 'exploration'
  | 'collection'
  | 'mastery';

export type ActivityType = 
  | 'drive_logged' 
  | 'maintenance_logged' 
  | 'detail_session' 
  | 'mod_installed' 
  | 'photo_uploaded'
  | 'profile_updated'
  | 'weather_checked'
  | 'vehicle_added'
  | 'route_planned'
  | 'juicebox_used'
  | 'feature_explored'
  | 'goal_achieved'
  | 'goal_created'
  | 'sale_completed';

// Point values for different activities
const ACTIVITY_POINTS: Record<ActivityType, number> = {
  drive_logged: 15,
  maintenance_logged: 12,
  detail_session: 20,
  mod_installed: 18,
  photo_uploaded: 5,
  profile_updated: 3,
  weather_checked: 1,
  vehicle_added: 25,
  route_planned: 10,
  juicebox_used: 8,
  feature_explored: 5,
  goal_achieved: 30,
  goal_created: 10,
  sale_completed: 15
};

// Achievements definitions with multiple levels
const ACHIEVEMENTS: Achievement[] = [
  // Driving achievements
  {
    id: 'first_drive',
    title: 'First Journey',
    description: 'Log your first drive in the app',
    iconUrl: '/assets/badges/first_drive.svg', 
    category: 'driving',
    requiredPoints: 15,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Weekend Warrior',
      requiredPoints: 75
    }
  },
  {
    id: 'drive_master',
    title: 'Road Warrior',
    description: 'Log 10 drives in the app',
    iconUrl: '/assets/badges/drive_master.svg',
    category: 'driving',
    requiredPoints: 150,
    unlocked: false,
    level: 2,
    nextLevel: {
      title: 'Highway Legend',
      requiredPoints: 300
    }
  },
  {
    id: 'drive_legend',
    title: 'Highway Legend',
    description: 'Log 20 drives in the app',
    iconUrl: '/assets/badges/drive_legend.svg',
    category: 'driving',
    requiredPoints: 300,
    unlocked: false,
    level: 3
  },
  
  // Maintenance achievements
  {
    id: 'first_maintenance',
    title: 'Maintenance Rookie',
    description: 'Log your first maintenance record',
    iconUrl: '/assets/badges/first_maintenance.svg',
    category: 'maintenance',
    requiredPoints: 12,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Maintenance Pro',
      requiredPoints: 60
    }
  },
  {
    id: 'maintenance_pro',
    title: 'Maintenance Pro',
    description: 'Log 5 maintenance records',
    iconUrl: '/assets/badges/maintenance_pro.svg',
    category: 'maintenance',
    requiredPoints: 60,
    unlocked: false,
    level: 2,
    nextLevel: {
      title: 'Maintenance Guru',
      requiredPoints: 120
    }
  },
  
  // Detailing achievements
  {
    id: 'first_detail',
    title: 'Detail Apprentice',
    description: 'Complete your first detailing session',
    iconUrl: '/assets/badges/first_detail.svg',
    category: 'detailing',
    requiredPoints: 20,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Detail Enthusiast',
      requiredPoints: 100
    }
  },
  {
    id: 'detail_master',
    title: 'Detail Enthusiast',
    description: 'Complete 5 detailing sessions',
    iconUrl: '/assets/badges/detail_master.svg',
    category: 'detailing',
    requiredPoints: 100,
    unlocked: false,
    level: 2,
    nextLevel: {
      title: 'Gloss Master',
      requiredPoints: 200
    }
  },
  
  // Modification achievements
  {
    id: 'first_mod',
    title: 'Mod Curious',
    description: 'Install your first vehicle modification',
    iconUrl: '/assets/badges/first_mod.svg',
    category: 'modification',
    requiredPoints: 18,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Mod Enthusiast',
      requiredPoints: 90
    }
  },
  
  // Vehicle collection achievements
  {
    id: 'first_vehicle',
    title: 'Vehicle Owner',
    description: 'Add your first vehicle to the garage',
    iconUrl: '/assets/badges/first_vehicle.svg',
    category: 'collection',
    requiredPoints: 25,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Vehicle Collector',
      requiredPoints: 50
    }
  },
  {
    id: 'vehicle_collector',
    title: 'Vehicle Collector',
    description: 'Have 2 vehicles in your garage',
    iconUrl: '/assets/badges/vehicle_collector.svg',
    category: 'collection',
    requiredPoints: 50,
    unlocked: false,
    level: 2,
    nextLevel: {
      title: 'Fleet Manager',
      requiredPoints: 75
    }
  },
  
  // Explorer achievements
  {
    id: 'explorer_novice',
    title: 'Explorer Novice',
    description: 'Visit 3 different sections of the app',
    iconUrl: '/assets/badges/explorer_novice.svg',
    category: 'exploration',
    requiredPoints: 15,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Feature Explorer',
      requiredPoints: 30
    }
  },
  
  // Weather achievements
  {
    id: 'weather_watcher',
    title: 'Weather Watcher',
    description: 'Check the weather 5 times',
    iconUrl: '/assets/badges/weather_watcher.svg',
    category: 'exploration',
    requiredPoints: 5,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Weather Expert',
      requiredPoints: 10
    }
  },
  
  // Goals achievements
  {
    id: 'first_goal',
    title: 'Goal Setter',
    description: 'Create your first automotive goal',
    iconUrl: '/assets/badges/first_goal.svg',
    category: 'mastery',
    requiredPoints: 10,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Goal Achiever',
      requiredPoints: 40
    }
  },
  {
    id: 'goal_achiever',
    title: 'Goal Achiever',
    description: 'Complete your first automotive goal',
    iconUrl: '/assets/badges/goal_achiever.svg',
    category: 'mastery',
    requiredPoints: 40,
    unlocked: false,
    level: 2,
    nextLevel: {
      title: 'Automotive Visionary',
      requiredPoints: 100
    }
  },
  
  // JuiceBox achievements
  {
    id: 'juicebox_starter',
    title: 'JuiceBox Starter',
    description: 'Use JuiceBox for the first time',
    iconUrl: '/assets/badges/juicebox_starter.svg',
    category: 'mastery',
    requiredPoints: 8,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'JuiceBox Enthusiast',
      requiredPoints: 40
    }
  },
  
  // Vehicle sale achievements
  {
    id: 'first_sale',
    title: 'First Sale',
    description: 'Record your first vehicle sale',
    iconUrl: '/assets/badges/first_sale.svg',
    category: 'collection',
    requiredPoints: 15,
    unlocked: false,
    level: 1,
    nextLevel: {
      title: 'Experienced Seller',
      requiredPoints: 30
    }
  }
];

/**
 * Engagement Rewards Service class
 * Handles point tracking, achievement unlocking, and rewards progression
 */
class EngagementRewardsService {
  // Static reference to allow static methods to access the store
  private static store = useUserProfileStore.getState();
  
  // Set up subscription to keep the store reference updated when state changes
  static {
    useUserProfileStore.subscribe(state => {
      EngagementRewardsService.store = state;
    });
  }
  
  /**
   * Records an activity and awards points to the user
   * @param activityType Type of activity performed
   * @param description Description of the activity
   * @param relatedEntityId Optional ID of related entity (vehicle, goal, etc.)
   * @returns The created activity record with points
   */
  static recordActivity(
    activityType: ActivityType,
    description: string,
    relatedEntityId?: string
  ): RewardActivity {
    const { profile, updateProfile } = this.store;
    
    if (!profile) {
      console.warn('Cannot record activity: No profile found');
      return null;
    }
    
    const pointsEarned = ACTIVITY_POINTS[activityType] || 0;
    
    // Create the activity record
    const activity: RewardActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: activityType,
      description,
      pointsEarned,
      relatedEntityId
    };
    
    // Update user's records
    const updatedRewards = {
      ...(profile.rewards || {
        totalPoints: 0,
        level: 1,
        activities: [],
        achievements: ACHIEVEMENTS.map(a => ({ ...a }))
      }),
      totalPoints: (profile.rewards?.totalPoints || 0) + pointsEarned,
      activities: [activity, ...(profile.rewards?.activities || [])]
    };
    
    // Check for level ups (every 100 points = 1 level)
    const currentLevel = Math.floor(updatedRewards.totalPoints / 100) + 1;
    if (currentLevel > (profile.rewards?.level || 1)) {
      updatedRewards.level = currentLevel;
      
      // Trigger level up event
      window.dispatchEvent(new CustomEvent('user-level-up', {
        detail: {
          newLevel: currentLevel,
          totalPoints: updatedRewards.totalPoints
        }
      }));
      
      console.log(`User leveled up to Level ${currentLevel}!`);
    }
    
    // Check for achievement unlocks
    this.checkAchievements(updatedRewards);
    
    // Update the profile
    updateProfile({
      rewards: updatedRewards,
      lastActive: new Date().toISOString()
    });
    
    // Update last active timestamp
    ProfileDataCollector.updateLastActive();
    
    return activity;
  }
  
  /**
   * Checks if any achievements are unlocked based on points
   * @param rewards Current rewards data
   */
  private static checkAchievements(rewards: any) {
    if (!rewards || !rewards.achievements) return;
    
    const totalPoints = rewards.totalPoints;
    let achievementsUnlocked = false;
    
    // Check each achievement
    rewards.achievements = rewards.achievements.map((achievement: Achievement) => {
      // Skip already unlocked achievements
      if (achievement.unlocked) return achievement;
      
      // Check if the achievement should be unlocked
      if (totalPoints >= achievement.requiredPoints) {
        achievementsUnlocked = true;
        
        // Create updated achievement with unlocked status
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          dateUnlocked: new Date().toISOString()
        };
        
        // Dispatch achievement unlocked event
        window.dispatchEvent(new CustomEvent('achievement-unlocked', {
          detail: {
            achievement: unlockedAchievement
          }
        }));
        
        console.log(`Achievement unlocked: ${achievement.title}`);
        return unlockedAchievement;
      }
      
      return achievement;
    });
    
    // If any achievements were unlocked, broadcast an update
    if (achievementsUnlocked) {
      window.dispatchEvent(new CustomEvent('rewards-update', {
        detail: {
          rewards
        }
      }));
    }
  }
  
  /**
   * Gets the user's current rewards progress
   * @returns Object containing points, level, activities, and achievements
   */
  static getRewardsProgress() {
    const { profile } = this.store;
    
    if (!profile) {
      console.warn('Cannot get rewards progress: No profile found');
      return null;
    }
    
    // Initialize rewards if not present
    if (!profile.rewards) {
      return {
        totalPoints: 0,
        level: 1,
        activities: [],
        achievements: ACHIEVEMENTS.map(a => ({ ...a }))
      };
    }
    
    return profile.rewards;
  }
  
  /**
   * Gets all available achievements with unlock status
   * @returns Array of achievement objects
   */
  static getAllAchievements(): Achievement[] {
    const { profile } = this.store;
    
    if (!profile || !profile.rewards) {
      return ACHIEVEMENTS.map(a => ({ ...a }));
    }
    
    return profile.rewards.achievements || ACHIEVEMENTS.map(a => ({ ...a }));
  }
  
  /**
   * Gets achievements by category
   * @param category Achievement category to filter by
   * @returns Filtered array of achievements
   */
  static getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    const achievements = this.getAllAchievements();
    return achievements.filter(a => a.category === category);
  }
  
  /**
   * Gets unlocked achievements only
   * @returns Array of unlocked achievements
   */
  static getUnlockedAchievements(): Achievement[] {
    const achievements = this.getAllAchievements();
    return achievements.filter(a => a.unlocked);
  }
  
  /**
   * Gets recent activities
   * @param limit Maximum number of activities to return
   * @returns Array of recent activities
   */
  static getRecentActivities(limit: number = 10): RewardActivity[] {
    const { profile } = this.store;
    
    if (!profile || !profile.rewards || !profile.rewards.activities) {
      return [];
    }
    
    return profile.rewards.activities.slice(0, limit);
  }
  
  /**
   * Gets activities by type
   * @param type Activity type to filter by
   * @returns Filtered array of activities
   */
  static getActivitiesByType(type: ActivityType): RewardActivity[] {
    const { profile } = this.store;
    
    if (!profile || !profile.rewards || !profile.rewards.activities) {
      return [];
    }
    
    return profile.rewards.activities.filter(a => a.type === type);
  }
  
  /**
   * Calculates the progress toward the next level
   * @returns Object containing current level, next level points requirement, and progress percentage
   */
  static getLevelProgress() {
    const { profile } = this.store;
    
    if (!profile || !profile.rewards) {
      return { 
        currentLevel: 1, 
        pointsToNextLevel: 100, 
        progressPercentage: 0 
      };
    }
    
    const totalPoints = profile.rewards.totalPoints || 0;
    const currentLevel = profile.rewards.level || 1;
    const pointsForCurrentLevel = (currentLevel - 1) * 100;
    const pointsForNextLevel = currentLevel * 100;
    const pointsToNextLevel = pointsForNextLevel - totalPoints;
    const levelProgress = totalPoints - pointsForCurrentLevel;
    const progressPercentage = Math.min(100, Math.round((levelProgress / 100) * 100));
    
    return {
      currentLevel,
      pointsToNextLevel,
      progressPercentage
    };
  }
  
  /**
   * Handles achievements when a vehicle is sold
   * @param vehicleId ID of the vehicle that was sold
   * @param saleData Sale data including price and date
   */
  static handleVehicleSale(vehicleId: string, saleData: any) {
    const vehicle = this.getVehicleById(vehicleId);
    
    if (!vehicle) {
      console.warn(`Cannot record sale: Vehicle with ID ${vehicleId} not found`);
      return;
    }
    
    const description = `Sold ${vehicle.make} ${vehicle.model} (${vehicle.year}) for $${saleData.salePrice}`;
    
    // Record the sale activity
    this.recordActivity('sale_completed', description, vehicleId);
    
    console.log(`Recorded vehicle sale: ${description}`);
  }
  
  /**
   * Helper to get a vehicle by ID
   * @param vehicleId ID of the vehicle to find
   * @returns Vehicle data or null if not found
   */
  private static getVehicleById(vehicleId: string): any {
    const { profile } = this.store;
    
    if (!profile || !profile.vehicles) {
      return null;
    }
    
    return profile.vehicles.find(v => v.id === vehicleId);
  }
}

export default EngagementRewardsService;