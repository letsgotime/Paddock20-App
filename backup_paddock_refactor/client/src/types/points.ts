/**
 * Point system for user rewards across the app
 * This tracks points earned for different user activities
 */
export interface PointSystem {
  userId: string;
  totalPoints: number;
  lifetimePoints: number;
  currentLevel: DriverLevel;
  pointsToNextLevel: number;
  pointsHistory: PointTransaction[];
}

/**
 * Driver level enum 
 */
export enum DriverLevel {
  NEW_DRIVER = 'New Driver',
  ROAD_WARRIOR = 'Road Warrior',
  REDLINE_RACER = 'Redline Racer',
  GRID_KING = 'Grid King',
  APEX_LEGEND = 'Apex Legend'
}

/**
 * Point transaction types
 */
export enum PointTransactionType {
  PURCHASE = 'purchase',
  EVENT_ATTENDANCE = 'event_attendance',
  GOAL_ACHIEVEMENT = 'goal_achievement',
  CHARITABLE_ACTION = 'charitable_action',
  DRIVE_LOGGED = 'drive_logged',
  MAINTENANCE_LOGGED = 'maintenance_logged',
  PROFILE_COMPLETION = 'profile_completion',
  REFERRAL = 'referral',
  SPECIAL_AWARD = 'special_award',
  SYSTEM_ADJUSTMENT = 'system_adjustment'
}

/**
 * Point transaction record
 */
export interface PointTransaction {
  id: string;
  userId: string;
  timestamp: string;
  type: PointTransactionType;
  points: number; // Can be positive or negative
  description: string;
  
  // Related records
  relatedPurchaseId?: string;
  relatedEventId?: string;
  relatedGoalId?: number;
  relatedCharitableActionId?: string;
  relatedDriveId?: string;
  relatedMaintenanceId?: string;
  relatedReferralId?: string;
  
  // Metadata
  verifiedBy?: string; // GoTime staff member who verified
  verificationDate?: string;
  notes?: string;
  expirationDate?: string; // When points expire if applicable
  isExpired?: boolean; 
  isRedeemed?: boolean;
}

/**
 * Level up requirement
 */
export interface LevelRequirement {
  level: DriverLevel;
  pointsRequired: number;
  description: string;
  additionalRequirements?: {
    minDrivesLogged?: number;
    minEventsAttended?: number;
    minCharitableActions?: number;
    minGoalsAchieved?: number;
    specificAchievements?: string[];
  };
  rewards: {
    badgeId: string;
    perks: string[];
  };
}

/**
 * Purchase record 
 */
export interface Purchase {
  id: string;
  userId: string;
  timestamp: string;
  amount: number;
  pointsEarned: number;
  items: PurchaseItem[];
  orderId: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  pointsStatus: 'pending' | 'awarded' | 'adjusted' | 'expired';
}

/**
 * Item purchased in a store transaction
 */
export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  pointValue: number; // Points earned per unit
}

/**
 * Event attendance record
 */
export interface EventAttendance {
  id: string;
  userId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  attendanceStatus: 'registered' | 'attended' | 'no_show' | 'cancelled';
  registrationDate: string;
  checkInTime?: string;
  pointsEarned: number;
  isGoTimeEvent: boolean;
  photos?: string[];
  notes?: string;
  
  // Event metadata
  eventLocation?: string;
  eventType?: string;
  eventOrganizer?: string;
  ticketId?: string;
  ticketPrice?: number;
}

/**
 * Point redemption record
 */
export interface PointRedemption {
  id: string;
  userId: string;
  timestamp: string;
  pointsRedeemed: number;
  rewardId: string;
  rewardName: string;
  redemptionStatus: 'pending' | 'completed' | 'cancelled' | 'expired';
  fulfillmentDate?: string;
  expirationDate?: string;
  notes?: string;
}

/**
 * Reward item that can be redeemed with points
 */
export interface Reward {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  category: 'merchandise' | 'discount' | 'event' | 'experience' | 'membership';
  imageUrl?: string;
  availability: 'available' | 'limited' | 'out_of_stock' | 'coming_soon';
  quantityAvailable?: number;
  startDate?: string;
  endDate?: string;
  termsAndConditions?: string;
  minimumLevel?: DriverLevel;
  featured: boolean;
}