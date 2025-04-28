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
  type: 'deposit' | 'expense';
  description: string;
}

export interface GoalMedia {
  id: number;
  type: 'image' | 'file' | 'link';
  name: string;
  url: string;
  thumbnail?: string;
  description?: string;
  dateAdded: string;
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
}