import { supabase } from './supabaseClient';
import { Goal } from '../types/manifestation';
import { Vehicle } from '../types/vehicle';
import { DreamAsset } from '../types/dreamAsset';
import { Route } from '../types/route';
import { DriveLog } from '../types/driveLog';
import { MaintenanceLog } from '../types/maintenance';
import { UserProfile } from '../types/user';

/**
 * Central service for managing all user-related data across the application
 * This connects user profile with vehicles, manifestation goals, routes, and other data
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
  private isInitialized: boolean = false;
  private isDemoMode: boolean = true; // Set to false when connecting to real backend

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
}

export default UserDataService;