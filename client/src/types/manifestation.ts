export interface Milestone {
  id: number;
  name: string;
  targetDate: string;
  notes: string;
  completed: boolean;
}

export interface BudgetEntry {
  id: number;
  date: string;
  amount: number;
  type: 'deposit' | 'expense' | 'investment' | 'payment' | 'refund';
  description: string;
  category?: string;
  receiptUrl?: string;
}

export interface GoalMedia {
  id: number;
  type: 'image' | 'file' | 'link' | 'video' | 'audio' | 'document';
  name: string;
  url: string;
  thumbnail?: string;
  description?: string;
  dateAdded: string;
  tags?: string[];
  isInspirational?: boolean;
}

export interface HustlePillar {
  id: number;
  type: 'body' | 'mind' | 'spirit' | 'activity' | 'education' | 'intention' | 'celebration';
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  completed: boolean;
  actions: Array<{
    id: number;
    name: string;
    completed: boolean;
    date?: string;
    notes?: string;
  }>;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'once';
  startDate?: string;
  endDate?: string;
}

export interface DisciplineStreak {
  type: 'activity' | 'education' | 'intention';
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  totalCompleted: number;
  history: Array<{
    date: string;
    completed: boolean;
    minutes?: number;
    notes?: string;
  }>;
}

export interface HustleMetric {
  id: number;
  name: string;
  value: number;
  unit: string;
  date: string;
  category: 'financial' | 'skill' | 'health' | 'spiritual';
  goalId: number; // related to which goal
  notes?: string;
}

export interface VictoryAchievement {
  id: number;
  goalId: number;
  title: string;
  description: string;
  date: string;
  badgeUrl?: string;
  certificateUrl?: string;
  celebrationType?: 'badge' | 'certificate' | 'animation' | 'all';
  shared?: boolean;
}

export interface Goal {
  id: number;
  goalName: string;
  goalType: string;
  targetAsset: string;
  targetDate: string;
  fundingPlan: string;
  mindFocus: string;
  bodyFocus: string;
  spiritFocus: string;
  milestones: Milestone[];
  completedMilestones: Milestone[];
  manifestStatus: 'new' | 'in_progress' | 'manifested' | 'complete';
  description?: string;
  progressPercentage: number;
  // Budget tracking
  targetAmount: number;
  currentAmount: number;
  budgetEntries: BudgetEntry[];
  // Media gallery
  mediaGallery: GoalMedia[];
  // New fields for 2.0
  hustlePillars?: HustlePillar[];
  disciplineStreaks?: {
    activity: DisciplineStreak;
    education: DisciplineStreak;
    intention: DisciplineStreak;
  };
  hustleMetrics?: HustleMetric[];
  victoryAchievements?: VictoryAchievement[];
  timeline?: Array<{
    date: string;
    event: string;
    type: 'milestone' | 'checkin' | 'hustle' | 'victory';
    amount?: number;
    description?: string;
  }>;
}

export interface DailyCheckin {
  id: number;
  goalId: number;
  date: string;
  mindCompleted: boolean;
  bodyCompleted: boolean;
  spiritCompleted: boolean;
  // Track time spent on each activity
  mindMinutes?: number;
  bodyMinutes?: number;
  spiritMinutes?: number;
  // Notes for each activity
  mindNotes?: string;
  bodyNotes?: string;
  spiritNotes?: string;
  // New fields for 2.0
  hustleCompleted?: boolean;
  hustleMinutes?: number;
  hustleNotes?: string;
  financialProgress?: number;
  skillsGained?: string[];
}