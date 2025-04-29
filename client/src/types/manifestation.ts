/**
 * Goal in the Manifestation Station
 */
export interface Goal {
  id: number;
  userId: string;
  title: string;
  description?: string;
  targetDate?: string;
  targetAmount?: number; // For financial goals
  currentAmount?: number; // Current saved amount
  progress: number; // 0-100 percentage
  startDate: string;
  category: GoalCategory;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'abandoned';
  imageUrl?: string;
  milestones?: Milestone[];
  actions?: ActionStep[];
  lastUpdated?: string;
  color?: string;
  icon?: string;
  
  // Related telemetry
  monthlyContributions?: number[]; // Array of monthly contributions 
  contributionFrequency?: 'daily' | 'weekly' | 'monthly';
  
  // The 7 Elements tracking
  elements?: GoalElements;
  
  // Motivation
  motivations?: string[];
  affirmations?: string[];
  obstacles?: string[];
  supportTeam?: string[];
}

/**
 * Goal category
 */
export type GoalCategory = 
  | 'vehicle' 
  | 'travel' 
  | 'financial' 
  | 'personal'
  | 'property' 
  | 'timepiece' 
  | 'education' 
  | 'business' 
  | 'charity';

/**
 * Milestone for a goal
 */
export interface Milestone {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  completedDate?: string;
  progress: number; // 0-100 percentage
  isCompleted: boolean;
}

/**
 * Action step for a goal
 */
export interface ActionStep {
  id: number;
  description: string;
  dueDate?: string;
  completedDate?: string;
  isCompleted: boolean;
  isRecurring?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: string;
}

/**
 * The 7 Elements system for goal tracking
 */
export interface GoalElements {
  vision: {
    statement: string;
    visualizationPractice?: boolean;
  };
  clarity: {
    definedOutcome: string;
    specificMetrics: string[];
  };
  knowledge: {
    requiredSkills: string[];
    learningResources: string[];
    mentors?: string[];
  };
  hustle: {
    dailyActions: string[];
    weeklyMilestones: string[];
    productivityScore?: number; // 0-100
  };
  focus: {
    distractionMitigationPlan?: string;
    prioritizationSystem?: string;
  };
  consistency: {
    routineDescription?: string;
    streak?: number; // Current streak of daily actions
    bestStreak?: number; // Best streak ever achieved
  };
  belief: {
    selfTalkPatterns?: string[];
    affirmations?: string[];
    evidenceOfCapability?: string[];
  };
}

/**
 * Daily discipline tracking
 */
export interface DailyDiscipline {
  id: string;
  userId: string;
  date: string;
  timestamp: string;
  type: 'mind' | 'body' | 'spirit';
  completed: boolean;
  notes?: string;
  duration?: number; // Duration in minutes
  impactRating?: number; // 1-10 rating of effectiveness
}

/**
 * Dream asset representing a future/aspirational item to acquire
 */
export interface DreamAsset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  category: GoalCategory;
  targetPrice: number;
  currentSavings: number;
  targetDate?: string;
  acquisitionDate?: string;
  imageUrl?: string;
  isAcquired: boolean;
  relatedGoalId?: number;
}