import { supabase } from './supabaseClient';
import { Goal } from '../types/manifestation';
import { Vehicle } from '../types/vehicle';
import { DreamAsset } from '../types/dreamAsset';
import { Route } from '../types/route';
import { DriveLog } from '../types/driveLog';
import { MaintenanceLog } from '../types/maintenance';
import { UserProfile, UserAchievement, DriverLevel, TelemetryData } from '../types/user';
import { GalleryItem, MediaCollection } from '../types/gallery';
import { Timepiece } from '../types/timepiece';
import { EventParticipation } from '../types/event';
import { MoodEnergy } from '../types/moodEnergy';
import { JuiceBoxLoadout } from '../types/juiceBox';
import { CharitableAction } from '../types/charity';

/**
 * Central service for managing all user-related data across the application
 * This connects user profile with vehicles, manifestation goals, routes, and other data
 * 
 * This enhanced service connects all modules of the application including:
 * - Vehicle management (Garage Vault)
 * - Manifestation Station and goal tracking
 * - Drive Journal and Route Planner
 * - Telemetry and performance data
 * - Media gallery across all experiences
 * - User achievements and progression
 * - Mood and energy tracking
 * - Events and community participation
 * - Timepiece collection
 * - Charitable actions
 */
class UserDataService {
  private static instance: UserDataService;
  private user: UserProfile | null = null;
  private vehicles: Vehicle[] = [];
  private goals: Goal[] = [];
  private dreamAssets: DreamAsset[] = [];
  private routes: Route[] = [];
  private driveLogs: DriveLog[] = [];
  private maintenanceLogs: MaintenanceLog[] = [];
  private achievements: UserAchievement[] = [];
  private galleryItems: GalleryItem[] = [];
  private mediaCollections: MediaCollection[] = [];
  private timepieces: Timepiece[] = [];
  private eventParticipations: EventParticipation[] = [];
  private moodEnergyEntries: MoodEnergy[] = [];
  private juiceBoxLoadouts: JuiceBoxLoadout[] = [];
  private charitableActions: CharitableAction[] = [];
  private telemetryData: TelemetryData[] = [];
  private isInitialized: boolean = false;
  private isDemoMode: boolean = false; // Connect to real backend to enforce security

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): UserDataService {
    if (!UserDataService.instance) {
      UserDataService.instance = new UserDataService();
    }
    return UserDataService.instance;
  }

  /**
   * Initialize user data from Supabase or mock data in demo mode
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (this.isDemoMode) {
      console.log('Using mocked User Data Service in demo mode');
      await this.loadMockData();
    } else {
      try {
        await this.loadUserProfile();
        await Promise.all([
          this.loadVehicles(),
          this.loadGoals(),
          this.loadDreamAssets(),
          this.loadRoutes(),
          this.loadDriveLogs(),
          this.loadMaintenanceLogs()
        ]);
      } catch (error) {
        console.error('Error initializing UserDataService:', error);
      }
    }

    this.isInitialized = true;
  }

  /**
   * Load mock data for demo mode
   */
  private async loadMockData(): Promise<void> {
    // Load mock user profile
    this.user = {
      id: 'demo-user',
      username: 'DriverDemo',
      email: 'demo@gotime.com',
      displayName: 'Nick Driver',
      avatarUrl: '/assets/avatars/default.png',
      memberSince: '2023-01-15',
      phoneNumber: '',
      city: 'Austin',
      state: 'TX',
      bio: 'Passionate car enthusiast and weekend track driver',
      socialLinks: {
        instagram: 'driver_nick',
        twitter: 'nickdriver',
        youtube: 'NickDriverVlogs'
      },
      preferences: {
        darkMode: true,
        notifications: true,
        units: 'imperial'
      },
      membershipLevel: 'Paddock20 Pro',
      mfaEnabled: false
    };

    // Load vehicles from GarageVaultPage mock data (in real app this would be from database)
    try {
      const module = await import('../pages/GarageVaultPage');
      if (module.MOCK_VEHICLES) {
        this.vehicles = [...module.MOCK_VEHICLES];
      }
    } catch (error) {
      console.error('Error loading mock vehicles:', error);
    }

    // Load goals from ManifestationStationPage mock data
    try {
      const module = await import('../pages/ManifestationStationPage');
      if (module.MOCK_GOALS) {
        this.goals = [...module.MOCK_GOALS];
      }
    } catch (error) {
      console.error('Error loading mock goals:', error);
    }

    // Load routes from RoutePlannerPage mock data
    try {
      const module = await import('../pages/RoutePlannerPage');
      if (module.MOCK_ROUTES) {
        this.routes = [...module.MOCK_ROUTES];
      }
    } catch (error) {
      console.error('Error loading mock routes:', error);
    }

    // Add more mock data as needed
  }

  /**
   * Load user profile from Supabase
   */
  private async loadUserProfile(): Promise<void> {
    if (this.isDemoMode) return;

    const { data: user, error } = await supabase
      .from('user_profiles')
      .select('*')
      .single();

    if (error) {
      console.error('Error loading user profile:', error);
      return;
    }

    this.user = user;
  }

  /**
   * Load vehicles from Supabase
   */
  private async loadVehicles(): Promise<void> {
    if (this.isDemoMode) return;

    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', this.user?.id);

    if (error) {
      console.error('Error loading vehicles:', error);
      return;
    }

    this.vehicles = vehicles || [];
  }

  /**
   * Load goals from Supabase
   */
  private async loadGoals(): Promise<void> {
    if (this.isDemoMode) return;

    const { data: goals, error } = await supabase
      .from('manifestation_goals')
      .select('*')
      .eq('user_id', this.user?.id);

    if (error) {
      console.error('Error loading goals:', error);
      return;
    }

    this.goals = goals || [];
  }

  /**
   * Load dream assets from Supabase
   */
  private async loadDreamAssets(): Promise<void> {
    if (this.isDemoMode) return;

    const { data: dreamAssets, error } = await supabase
      .from('dream_assets')
      .select('*')
      .eq('user_id', this.user?.id);

    if (error) {
      console.error('Error loading dream assets:', error);
      return;
    }

    this.dreamAssets = dreamAssets || [];
  }

  /**
   * Load routes from Supabase
   */
  private async loadRoutes(): Promise<void> {
    if (this.isDemoMode) return;

    const { data: routes, error } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', this.user?.id);

    if (error) {
      console.error('Error loading routes:', error);
      return;
    }

    this.routes = routes || [];
  }

  /**
   * Load drive logs from Supabase
   */
  private async loadDriveLogs(): Promise<void> {
    if (this.isDemoMode) return;

    const { data: driveLogs, error } = await supabase
      .from('drive_logs')
      .select('*')
      .eq('user_id', this.user?.id);

    if (error) {
      console.error('Error loading drive logs:', error);
      return;
    }

    this.driveLogs = driveLogs || [];
  }

  /**
   * Load maintenance logs from Supabase
   */
  private async loadMaintenanceLogs(): Promise<void> {
    if (this.isDemoMode) return;

    const { data: maintenanceLogs, error } = await supabase
      .from('maintenance_logs')
      .select('*')
      .eq('user_id', this.user?.id);

    if (error) {
      console.error('Error loading maintenance logs:', error);
      return;
    }

    this.maintenanceLogs = maintenanceLogs || [];
  }

  /**
   * Get user profile
   */
  public getUserProfile(): UserProfile | null {
    return this.user;
  }

  /**
   * Get all vehicles
   */
  public getVehicles(): Vehicle[] {
    return [...this.vehicles];
  }

  /**
   * Get vehicle by ID
   */
  public getVehicleById(id: string): Vehicle | undefined {
    return this.vehicles.find(vehicle => vehicle.id === id);
  }

  /**
   * Get manifestation goals
   */
  public getGoals(): Goal[] {
    return [...this.goals];
  }

  /**
   * Get goal by ID
   */
  public getGoalById(id: number): Goal | undefined {
    return this.goals.find(goal => goal.id === id);
  }

  /**
   * Update goal
   */
  public updateGoal(updatedGoal: Goal): void {
    this.goals = this.goals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    );

    if (!this.isDemoMode) {
      // In real app, save to Supabase
      supabase
        .from('manifestation_goals')
        .update(updatedGoal)
        .eq('id', updatedGoal.id)
        .then(({ error }) => {
          if (error) console.error('Error updating goal:', error);
        });
    }
  }

  /**
   * Get dream assets
   */
  public getDreamAssets(): DreamAsset[] {
    return [...this.dreamAssets];
  }

  /**
   * Get routes
   */
  public getRoutes(): Route[] {
    return [...this.routes];
  }

  /**
   * Get drive logs
   */
  public getDriveLogs(): DriveLog[] {
    return [...this.driveLogs];
  }

  /**
   * Get maintenance logs
   */
  public getMaintenanceLogs(): MaintenanceLog[] {
    return [...this.maintenanceLogs];
  }

  /**
   * Get maintenance logs for a specific vehicle
   */
  public getMaintenanceLogsForVehicle(vehicleId: string): MaintenanceLog[] {
    return this.maintenanceLogs.filter(log => log.vehicleId === vehicleId);
  }

  /**
   * Get drive logs for a specific vehicle
   */
  public getDriveLogsForVehicle(vehicleId: string): DriveLog[] {
    return this.driveLogs.filter(log => log.vehicleId === vehicleId);
  }

  /**
   * Get multi-factor authentication status
   */
  public isMfaEnabled(): boolean {
    return this.user?.mfaEnabled || false;
  }

  /**
   * Enable MFA for the user
   */
  public async enableMfa(): Promise<boolean> {
    if (this.isDemoMode) {
      // Mock implementation for demo mode
      if (this.user) {
        this.user.mfaEnabled = true;
      }
      return true;
    }

    // Implement real MFA enablement with Firebase Authentication
    // This would typically redirect to a verification flow
    
    return false;
  }

  /**
   * Disable MFA for the user
   */
  public async disableMfa(): Promise<boolean> {
    if (this.isDemoMode) {
      // Mock implementation for demo mode
      if (this.user) {
        this.user.mfaEnabled = false;
      }
      return true;
    }

    // Implement real MFA disablement with Firebase Authentication
    
    return false;
  }

  /**
   * Get user achievements
   */
  public getAchievements(): UserAchievement[] {
    return [...this.achievements];
  }

  /**
   * Add a new achievement for the user
   */
  public addAchievement(achievement: UserAchievement): UserAchievement {
    const newAchievement = {
      ...achievement,
      id: achievement.id || `achievement-${this.achievements.length + 1}`,
      dateEarned: achievement.dateEarned || new Date().toISOString()
    };
    
    this.achievements.push(newAchievement);
    
    if (!this.isDemoMode) {
      // In real app, save to Supabase
      supabase
        .from('user_achievements')
        .insert(newAchievement)
        .then(({ error }) => {
          if (error) console.error('Error adding achievement:', error);
        });
    }
    
    return newAchievement;
  }

  /**
   * Get all gallery items across all media types
   */
  public getGalleryItems(): GalleryItem[] {
    return [...this.galleryItems];
  }

  /**
   * Get gallery items by vehicle ID
   */
  public getGalleryItemsByVehicle(vehicleId: string): GalleryItem[] {
    return this.galleryItems.filter(item => item.vehicleId === vehicleId);
  }

  /**
   * Get gallery items by drive log ID
   */
  public getGalleryItemsByDriveLog(driveLogId: string): GalleryItem[] {
    return this.galleryItems.filter(item => item.driveLogId === driveLogId);
  }

  /**
   * Add a gallery item
   */
  public addGalleryItem(item: GalleryItem): GalleryItem {
    const newItem = {
      ...item,
      id: item.id || `gallery-${this.galleryItems.length + 1}`,
      uploadDate: item.uploadDate || new Date().toISOString(),
      userId: this.user?.id || 'demo-user'
    };
    
    this.galleryItems.push(newItem);
    
    // Add to appropriate collection if specified
    if (newItem.collectionId) {
      const collection = this.mediaCollections.find(c => c.id === newItem.collectionId);
      if (collection) {
        collection.itemIds = [...(collection.itemIds || []), newItem.id];
      }
    }
    
    if (!this.isDemoMode) {
      // In real app, save to Supabase
      supabase
        .from('gallery_items')
        .insert(newItem)
        .then(({ error }) => {
          if (error) console.error('Error adding gallery item:', error);
        });
    }
    
    return newItem;
  }

  /**
   * Get all media collections
   */
  public getMediaCollections(): MediaCollection[] {
    return [...this.mediaCollections];
  }

  /**
   * Create a new media collection
   */
  public createMediaCollection(collection: Partial<MediaCollection>): MediaCollection {
    const newCollection = {
      id: `collection-${this.mediaCollections.length + 1}`,
      name: collection.name || 'Untitled Collection',
      description: collection.description || '',
      coverImageUrl: collection.coverImageUrl,
      itemIds: collection.itemIds || [],
      createdDate: new Date().toISOString(),
      type: collection.type || 'generic',
      userId: this.user?.id || 'demo-user',
      isPublic: collection.isPublic || false,
      ...collection
    };
    
    this.mediaCollections.push(newCollection);
    
    if (!this.isDemoMode) {
      // In real app, save to Supabase
      supabase
        .from('media_collections')
        .insert(newCollection)
        .then(({ error }) => {
          if (error) console.error('Error creating media collection:', error);
        });
    }
    
    return newCollection;
  }

  /**
   * Get all timepieces
   */
  public getTimepieces(): Timepiece[] {
    return [...this.timepieces];
  }

  /**
   * Get all event participations
   */
  public getEventParticipations(): EventParticipation[] {
    return [...this.eventParticipations];
  }

  /**
   * Get all mood and energy entries
   */
  public getMoodEnergyEntries(): MoodEnergy[] {
    return [...this.moodEnergyEntries];
  }

  /**
   * Add mood and energy entry
   */
  public addMoodEnergyEntry(entry: MoodEnergy): MoodEnergy {
    const newEntry = {
      ...entry,
      id: entry.id || `mood-${this.moodEnergyEntries.length + 1}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      userId: this.user?.id || 'demo-user'
    };
    
    this.moodEnergyEntries.push(newEntry);
    
    if (!this.isDemoMode) {
      // In real app, save to Supabase
      supabase
        .from('mood_energy')
        .insert(newEntry)
        .then(({ error }) => {
          if (error) console.error('Error adding mood entry:', error);
        });
    }
    
    return newEntry;
  }

  /**
   * Get mood and energy entries by vehicle ID
   */
  public getMoodEnergyEntriesByVehicle(vehicleId: string): MoodEnergy[] {
    return this.moodEnergyEntries.filter(entry => entry.vehicleId === vehicleId);
  }

  /**
   * Get all juice box loadouts
   */
  public getJuiceBoxLoadouts(): JuiceBoxLoadout[] {
    return [...this.juiceBoxLoadouts];
  }

  /**
   * Get all charitable actions
   */
  public getCharitableActions(): CharitableAction[] {
    return [...this.charitableActions];
  }

  /**
   * Add charitable action
   */
  public addCharitableAction(action: CharitableAction): CharitableAction {
    const newAction = {
      ...action,
      id: action.id || `charity-${this.charitableActions.length + 1}`,
      date: action.date || new Date().toISOString(),
      userId: this.user?.id || 'demo-user'
    };
    
    this.charitableActions.push(newAction);
    
    if (!this.isDemoMode) {
      // In real app, save to Supabase
      supabase
        .from('charitable_actions')
        .insert(newAction)
        .then(({ error }) => {
          if (error) console.error('Error adding charitable action:', error);
        });
    }
    
    return newAction;
  }

  /**
   * Get all telemetry data
   */
  public getTelemetryData(): TelemetryData[] {
    return [...this.telemetryData];
  }

  /**
   * Get telemetry data by drive log ID
   */
  public getTelemetryDataByDriveLog(driveLogId: string): TelemetryData[] {
    return this.telemetryData.filter(entry => entry.driveLogId === driveLogId);
  }

  /**
   * Get telemetry data by vehicle ID
   */
  public getTelemetryDataByVehicle(vehicleId: string): TelemetryData[] {
    return this.telemetryData.filter(entry => entry.vehicleId === vehicleId);
  }

  /**
   * Get aggregate telemetry stats for a vehicle
   */
  public getVehicleTelemetryStats(vehicleId: string): {
    maxSpeed: number;
    maxAcceleration: number;
    maxBraking: number;
    maxLateralG: number;
    totalDistance: number;
    totalDriveTime: number;
    averageSpeed: number;
  } {
    const vehicleTelemetry = this.getTelemetryDataByVehicle(vehicleId);
    
    if (vehicleTelemetry.length === 0) {
      return {
        maxSpeed: 0,
        maxAcceleration: 0,
        maxBraking: 0,
        maxLateralG: 0,
        totalDistance: 0,
        totalDriveTime: 0,
        averageSpeed: 0
      };
    }
    
    // Calculate aggregate stats
    const maxSpeed = Math.max(...vehicleTelemetry.map(t => t.speed || 0));
    const maxAcceleration = Math.max(...vehicleTelemetry.map(t => t.acceleration || 0));
    const maxBraking = Math.min(...vehicleTelemetry.map(t => t.braking || 0));
    const maxLateralG = Math.max(...vehicleTelemetry.map(t => Math.abs(t.lateralG || 0)));
    
    // Get drive logs for this vehicle
    const vehicleDriveLogs = this.getDriveLogsForVehicle(vehicleId);
    const totalDistance = vehicleDriveLogs.reduce((sum, log) => sum + (log.distance || 0), 0);
    const totalDriveTime = vehicleDriveLogs.reduce((sum, log) => sum + (log.durationMinutes || 0), 0);
    const averageSpeed = totalDriveTime > 0 ? (totalDistance / (totalDriveTime / 60)) : 0;
    
    return {
      maxSpeed,
      maxAcceleration,
      maxBraking,
      maxLateralG,
      totalDistance,
      totalDriveTime,
      averageSpeed
    };
  }

  /**
   * Calculate and return the user's driver level
   */
  public getDriverLevel(): DriverLevel {
    // Calculate driver level based on achievements, drive history, etc.
    const drivesCompleted = this.driveLogs.length;
    const achievementsEarned = this.achievements.length;
    const manifestationProgress = this.goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / 
                                 (this.goals.length || 1);
    
    // Simple algorithm to determine level
    const totalPoints = drivesCompleted * 5 + achievementsEarned * 10 + manifestationProgress * 20;
    
    if (totalPoints >= 1000) {
      return {
        title: 'Apex Legend',
        level: 5,
        points: totalPoints,
        pointsToNextLevel: 0,
        description: 'Elite driving enthusiast with mastery across all areas',
        badgeUrl: '/assets/badges/apex-legend.svg'
      };
    } else if (totalPoints >= 750) {
      return {
        title: 'Grid King',
        level: 4,
        points: totalPoints,
        pointsToNextLevel: 1000 - totalPoints,
        nextLevel: 'Apex Legend',
        description: 'Advanced driver with exceptional skill and dedication',
        badgeUrl: '/assets/badges/grid-king.svg'
      };
    } else if (totalPoints >= 500) {
      return {
        title: 'Redline Racer',
        level: 3,
        points: totalPoints,
        pointsToNextLevel: 750 - totalPoints,
        nextLevel: 'Grid King',
        description: 'Skilled enthusiast pushing the boundaries',
        badgeUrl: '/assets/badges/redline-racer.svg'
      };
    } else if (totalPoints >= 250) {
      return {
        title: 'Road Warrior',
        level: 2,
        points: totalPoints,
        pointsToNextLevel: 500 - totalPoints,
        nextLevel: 'Redline Racer',
        description: 'Dedicated driver building experience and skill',
        badgeUrl: '/assets/badges/road-warrior.svg'
      };
    } else {
      return {
        title: 'New Driver',
        level: 1,
        points: totalPoints,
        pointsToNextLevel: 250 - totalPoints,
        nextLevel: 'Road Warrior',
        description: 'Starting your journey as a driving enthusiast',
        badgeUrl: '/assets/badges/new-driver.svg'
      };
    }
  }

  /**
   * Gets all activity across the application
   * Returns a unified timeline of all user activity
   */
  public getUserActivity(): {
    id: string;
    type: 'drive' | 'maintenance' | 'goal' | 'achievement' | 'vehicle' | 'timepiece' | 'event' | 'charity';
    timestamp: string;
    title: string;
    description: string;
    relatedId?: string;
    relatedType?: string;
    imageUrl?: string;
  }[] {
    const activityItems = [];

    // Add drive logs as activity
    this.driveLogs.forEach(log => {
      activityItems.push({
        id: `drive-${log.id}`,
        type: 'drive',
        timestamp: log.date,
        title: log.title || `Drive from ${log.startLocation} to ${log.endLocation}`,
        description: `${log.distance || 0} miles in ${log.vehicle || 'vehicle'}`,
        relatedId: log.id,
        relatedType: 'driveLog',
        imageUrl: log.photos && log.photos.length > 0 ? log.photos[0] : undefined
      });
    });

    // Add maintenance logs as activity
    this.maintenanceLogs.forEach(log => {
      const vehicle = this.getVehicleById(log.vehicleId);
      activityItems.push({
        id: `maintenance-${log.id}`,
        type: 'maintenance',
        timestamp: log.date,
        title: log.serviceType,
        description: `${log.serviceType} for ${vehicle?.name || 'vehicle'}`,
        relatedId: log.id,
        relatedType: 'maintenanceLog',
        imageUrl: log.photos && log.photos.length > 0 ? log.photos[0] : undefined
      });
    });

    // Add goal updates as activity
    this.goals.forEach(goal => {
      if (goal.lastUpdated) {
        activityItems.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          timestamp: goal.lastUpdated,
          title: `Updated goal: ${goal.title}`,
          description: `Progress: ${goal.progress}%`,
          relatedId: goal.id.toString(),
          relatedType: 'goal',
          imageUrl: goal.imageUrl
        });
      }
    });

    // Add charitable actions as activity
    this.charitableActions.forEach(action => {
      activityItems.push({
        id: `charity-${action.id}`,
        type: 'charity',
        timestamp: action.date,
        title: action.actionType,
        description: action.description || '',
        relatedId: action.id,
        relatedType: 'charitableAction',
        imageUrl: action.imageUrl
      });
    });

    // Sort all activity by timestamp, most recent first
    return activityItems.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get personalized dashboard data
   * This assembles a complete package of data for the personalized dashboard
   */
  public getDashboardData() {
    return {
      userProfile: this.getUserProfile(),
      driverLevel: this.getDriverLevel(),
      recentActivity: this.getUserActivity().slice(0, 10),
      vehicles: this.getVehicles(),
      goals: this.getGoals(),
      achievements: this.getAchievements(),
      driveLogs: this.getDriveLogs().slice(0, 5),
      maintenanceLogs: this.getMaintenanceLogs().slice(0, 5),
      timepieces: this.getTimepieces(),
      upcomingEvents: this.getEventParticipations().filter(event => 
        new Date(event.date) > new Date()
      ).slice(0, 5),
      moodEnergyTrend: this.getMoodEnergyEntries().slice(-30),
      galleryHighlights: this.getGalleryItems().slice(0, 12),
      charitableActions: this.getCharitableActions().slice(0, 5)
    };
  }
}

export default UserDataService;