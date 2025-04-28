import React, { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getRandomAffirmation } from "../services/affirmationsService";

// Interface for milestones
interface Milestone {
  id: number;
  name: string;
  targetDate: string;
  notes: string;
  completed: boolean;
}

// Interface for budget entries
interface BudgetEntry {
  id: number;
  date: string;
  amount: number;
  type: 'deposit' | 'expense';
  description: string;
}

// Interface for goal media
interface GoalMedia {
  id: number;
  type: 'image' | 'file' | 'link';
  name: string;
  url: string;
  thumbnail?: string;
  description?: string;
  dateAdded: string;
}

// Interface for goals/dreams
interface Goal {
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
  manifestStatus: 'new' | 'in_progress' | 'manifested';
  description?: string;
  progressPercentage: number;
  // Budget tracking
  targetAmount: number;
  currentAmount: number;
  budgetEntries: BudgetEntry[];
  // Media gallery
  mediaGallery: GoalMedia[];
}

// Interface for daily check-ins
interface DailyCheckin {
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

const ManifestationStationPage = () => {
  // State for goals with example data
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 1,
      goalName: "Ferrari 458 Italia",
      goalType: "Car",
      targetAsset: "Ferrari 458 Italia Spider",
      targetDate: "2026-09-30",
      fundingPlan: "Save",
      mindFocus: "Visualize driving through Monaco daily",
      bodyFocus: "Track day fitness training 3x weekly",
      spiritFocus: "Gratitude for current achievements",
      milestones: [
        {
          id: 101,
          name: "Meet with Ferrari specialist",
          targetDate: "2025-06-15",
          notes: "Discuss specs and options",
          completed: false
        },
        {
          id: 102,
          name: "Test drive similar model",
          targetDate: "2025-07-30",
          notes: "Schedule at Atlanta dealership",
          completed: false
        }
      ],
      completedMilestones: [
        {
          id: 103,
          name: "Financial consultation",
          targetDate: "2025-05-01",
          notes: "Reviewed savings strategy",
          completed: true
        }
      ],
      manifestStatus: 'in_progress',
      progressPercentage: 35,
      description: "The ultimate driving machine that represents true craftsmanship and passion for performance.",
      targetAmount: 275000,
      currentAmount: 96250,
      budgetEntries: [
        {
          id: 201,
          date: "2025-01-15",
          amount: 50000,
          type: 'deposit',
          description: "Annual bonus"
        },
        {
          id: 202,
          date: "2025-02-10",
          amount: 25000,
          type: 'deposit',
          description: "Investment returns"
        },
        {
          id: 203,
          date: "2025-03-05",
          amount: 15000,
          type: 'deposit',
          description: "Stock sale"
        },
        {
          id: 204,
          date: "2025-04-01",
          amount: 6250,
          type: 'deposit',
          description: "Monthly savings plan"
        }
      ],
      mediaGallery: [
        {
          id: 301,
          type: 'image',
          name: 'Ferrari 458 Spider - Red',
          url: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVycmFyaSUyMDQ1OHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVycmFyaSUyMDQ1OHxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          description: 'Dream configuration - Rosso Corsa with black interior and carbon fiber details',
          dateAdded: '2025-01-15'
        },
        {
          id: 302,
          type: 'link',
          name: 'Ferrari Official Configurator',
          url: 'https://www.ferrari.com/en-US/auto/car-configurator',
          description: 'Official configurator to build my dream specs',
          dateAdded: '2025-02-01'
        }
      ]
    },
    {
      id: 2,
      goalName: "Patek Philippe Nautilus",
      goalType: "Watch",
      targetAsset: "Patek Philippe Nautilus 5711/1A-010",
      targetDate: "2025-12-25",
      fundingPlan: "Save",
      mindFocus: "Study horology and craftsmanship",
      bodyFocus: "Morning routine centered on time management",
      spiritFocus: "Practice patience and appreciation for detail",
      milestones: [
        {
          id: 104,
          name: "Join waitlist",
          targetDate: "2025-06-01",
          notes: "Contact authorized dealers",
          completed: false
        }
      ],
      completedMilestones: [
        {
          id: 105,
          name: "Research authentication process",
          targetDate: "2025-04-15",
          notes: "Understand certificates and documentation",
          completed: true
        },
        {
          id: 106,
          name: "Visit boutique for sizing",
          targetDate: "2025-05-01",
          notes: "Try on similar models for wrist fit",
          completed: true
        }
      ],
      manifestStatus: 'in_progress',
      progressPercentage: 58,
      description: "The legendary stainless steel sports watch that represents timeless design and exceptional craftsmanship.",
      targetAmount: 140000,
      currentAmount: 84000,
      budgetEntries: [
        {
          id: 205,
          date: "2025-01-10",
          amount: 40000,
          type: 'deposit',
          description: "Year-end bonus"
        },
        {
          id: 206,
          date: "2025-02-15",
          amount: 24000,
          type: 'deposit',
          description: "Crypto investment gains"
        },
        {
          id: 207,
          date: "2025-03-20",
          amount: 20000,
          type: 'deposit',
          description: "Sale of vintage watch collection"
        }
      ],
      mediaGallery: [
        {
          id: 303,
          type: 'image',
          name: 'Nautilus 5711 - Blue Dial',
          url: 'https://images.unsplash.com/photo-1677507270705-9e663fd6abe2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGF0ZWslMjBwaGlsaXBwZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1677507270705-9e663fd6abe2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGF0ZWslMjBwaGlsaXBwZXxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          description: 'Iconic blue dial variation - my ultimate goal timepiece',
          dateAdded: '2025-01-20'
        },
        {
          id: 304,
          type: 'link',
          name: 'Nautilus Collection Official Website',
          url: 'https://www.patek.com/en/collection/nautilus',
          description: 'Official Patek Philippe Nautilus collection',
          dateAdded: '2025-02-05'
        }
      ]
    },
    {
      id: 3,
      goalName: "Mountain Retreat",
      goalType: "House",
      targetAsset: "Luxury Cabin in Aspen",
      targetDate: "2027-10-01",
      fundingPlan: "Finance",
      mindFocus: "Visualize entertaining friends in the space",
      bodyFocus: "Train for mountain activities",
      spiritFocus: "Daily gratitude for nature and solitude",
      milestones: [
        {
          id: 107,
          name: "Property search phase 1",
          targetDate: "2025-08-15",
          notes: "Connect with specialized real estate agent",
          completed: false
        },
        {
          id: 108,
          name: "Visit top 3 locations",
          targetDate: "2025-10-01",
          notes: "Schedule travel for property viewings",
          completed: false
        },
        {
          id: 109,
          name: "Get pre-approved for financing",
          targetDate: "2025-11-15",
          notes: "Prepare financial documents",
          completed: false
        }
      ],
      completedMilestones: [],
      manifestStatus: 'new',
      progressPercentage: 15,
      description: "A tranquil mountain sanctuary for weekend retreats and seasonal getaways.",
      targetAmount: 3500000,
      currentAmount: 525000,
      budgetEntries: [
        {
          id: 208,
          date: "2025-02-01",
          amount: 350000,
          type: 'deposit',
          description: "Property sale proceeds"
        },
        {
          id: 209,
          date: "2025-03-15",
          amount: 175000,
          type: 'deposit',
          description: "Investment portfolio rebalance"
        }
      ],
      mediaGallery: [
        {
          id: 305,
          type: 'image',
          name: 'Aspen Mountain View',
          url: 'https://images.unsplash.com/photo-1568400693779-a271b08cbd8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXNwZW4lMjBjYWJpbnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1568400693779-a271b08cbd8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXNwZW4lMjBjYWJpbnxlbnwwfHwwfHx8MA%3D%3D&w=1000&q=80',
          description: 'Ideal mountain view with private access and privacy',
          dateAdded: '2025-01-25'
        },
        {
          id: 306,
          type: 'file',
          name: 'Cabin Floor Plans',
          url: '#',
          description: 'Architect draft of preferred layout (4BR/5BA)',
          dateAdded: '2025-02-10'
        },
        {
          id: 307,
          type: 'link',
          name: 'Aspen Real Estate Portal',
          url: 'https://www.aspensnowmasssir.com/',
          description: 'Exclusive property listings in target area',
          dateAdded: '2025-03-01'
        }
      ]
    },
    {
      id: 4,
      goalName: "Monaco Grand Prix VIP",
      goalType: "Other",
      targetAsset: "Monaco F1 Grand Prix Yacht Hospitality Package",
      targetDate: "2026-05-30",
      fundingPlan: "Save",
      mindFocus: "Visualize the race day experience",
      bodyFocus: "Learn about F1 driving techniques",
      spiritFocus: "Appreciate racing heritage",
      milestones: [
        {
          id: 110,
          name: "Research best hospitality packages",
          targetDate: "2025-06-01",
          notes: "Compare yacht options and locations",
          completed: false
        },
        {
          id: 111,
          name: "Contact concierge for early booking options",
          targetDate: "2025-09-15",
          notes: "Work through Paddock20 connections",
          completed: false
        }
      ],
      completedMilestones: [
        {
          id: 112,
          name: "Join waitlist for priority access",
          targetDate: "2025-05-01",
          notes: "Through Formula 1 Paddock Club™",
          completed: true
        }
      ],
      manifestStatus: 'manifested',
      progressPercentage: 100,
      description: "The ultimate motorsport experience, witnessing the most prestigious race in the world from a luxury yacht.",
      targetAmount: 45000,
      currentAmount: 45000,
      budgetEntries: [
        {
          id: 210,
          date: "2025-01-05",
          amount: 15000,
          type: 'deposit',
          description: "Bonus allocation"
        },
        {
          id: 211,
          date: "2025-02-10",
          amount: 20000,
          type: 'deposit',
          description: "Business proceeds"
        },
        {
          id: 212,
          date: "2025-03-15",
          amount: 10000,
          type: 'deposit',
          description: "Unexpected windfall"
        }
      ],
      mediaGallery: [
        {
          id: 308,
          type: 'image',
          name: 'Monaco Grand Prix - Yacht View',
          url: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9uYWNvJTIweWFjaHR8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          thumbnail: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW9uYWNvJTIweWFjaHR8ZW58MHx8MHx8fDA%3D&w=1000&q=80',
          description: 'Ideal yacht position along the harbor section',
          dateAdded: '2025-02-01'
        },
        {
          id: 309,
          type: 'image',
          name: 'F1 Monaco Circuit Map',
          url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Monte_Carlo_Formula_1_track_map.svg',
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Monte_Carlo_Formula_1_track_map.svg',
          description: 'Circuit layout with yacht viewing areas highlighted',
          dateAdded: '2025-02-15'
        },
        {
          id: 310,
          type: 'link',
          name: 'F1 Hospitality Packages',
          url: 'https://f1experiences.com/monaco-grand-prix',
          description: 'Official F1 Experiences options',
          dateAdded: '2025-03-01'
        }
      ]
    }
  ]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  // State for modals
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showGoalDetailsModal, setShowGoalDetailsModal] = useState(false);
  
  // State for new goal
  const [newGoal, setNewGoal] = useState<Omit<Goal, 'id' | 'progressPercentage'>>({
    goalName: "",
    goalType: "Car",
    targetAsset: "",
    targetDate: "",
    fundingPlan: "Save",
    mindFocus: "Meditation",
    bodyFocus: "Exercise",
    spiritFocus: "Gratitude Log",
    milestones: [],
    completedMilestones: [],
    manifestStatus: 'new',
    description: "",
    // Budget tracking
    targetAmount: 0,
    currentAmount: 0,
    budgetEntries: [],
    // Media gallery
    mediaGallery: []
  });
  
  // State for affirmations
  const [currentAffirmation, setCurrentAffirmation] = useState("");
  
  // State for new milestone
  const [newMilestone, setNewMilestone] = useState<Omit<Milestone, 'id' | 'completed'>>({
    name: "",
    targetDate: "",
    notes: ""
  });

  // State for daily check-ins
  const [checkIns, setCheckIns] = useState<DailyCheckin[]>([]);
  const [newCheckIn, setNewCheckIn] = useState<Omit<DailyCheckin, 'id'>>({
    goalId: 0,
    date: new Date().toISOString().split('T')[0],
    mindCompleted: false,
    bodyCompleted: false,
    spiritCompleted: false
  });
  
  // State for budget entry
  const [newBudgetEntry, setNewBudgetEntry] = useState<Omit<BudgetEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'deposit',
    description: ''
  });

  // Load a new affirmation on component mount
  useEffect(() => {
    const affirmation = getRandomAffirmation();
    setCurrentAffirmation(affirmation);
    
    // Refresh affirmation every 60 seconds
    const interval = setInterval(() => {
      setCurrentAffirmation(getRandomAffirmation());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to calculate goal progress
  const calculateGoalProgress = (goal: Goal): number => {
    if (goal.milestones.length + goal.completedMilestones.length === 0) return 0;
    
    // Milestones account for 80% of progress
    const milestoneWeight = 0.8;
    const milestoneProgress = goal.completedMilestones.length / (goal.milestones.length + goal.completedMilestones.length);
    
    // Daily check-ins account for 20% of progress
    const checkInWeight = 0.2;
    const goalCheckIns = checkIns.filter(checkIn => checkIn.goalId === goal.id);
    const totalPossibleCheckIns = goalCheckIns.length * 3; // 3 checks per day (mind, body, spirit)
    const completedCheckIns = goalCheckIns.reduce((sum, checkIn) => {
      return sum + (checkIn.mindCompleted ? 1 : 0) + (checkIn.bodyCompleted ? 1 : 0) + (checkIn.spiritCompleted ? 1 : 0);
    }, 0);
    
    const checkInProgress = totalPossibleCheckIns > 0 ? completedCheckIns / totalPossibleCheckIns : 0;
    
    // Combine weighted progress
    const totalProgress = (milestoneProgress * milestoneWeight) + (checkInProgress * checkInWeight);
    return Math.round(totalProgress * 100);
  };

  // Handle adding a new goal
  const handleAddGoal = () => {
    const newId = Date.now();
    const goalWithDefaults: Goal = {
      id: newId,
      ...newGoal,
      progressPercentage: 0
    };
    
    setGoals(prevGoals => [...prevGoals, goalWithDefaults]);
    setShowAddGoalModal(false);
    
    // Reset form
    setNewGoal({
      goalName: "",
      goalType: "Car",
      targetAsset: "",
      targetDate: "",
      fundingPlan: "Save",
      mindFocus: "Meditation",
      bodyFocus: "Exercise",
      spiritFocus: "Gratitude Log",
      milestones: [],
      completedMilestones: [],
      manifestStatus: 'new',
      description: "",
      // Budget tracking
      targetAmount: 0,
      currentAmount: 0,
      budgetEntries: [],
      // Media gallery
      mediaGallery: []
    });
  };

  // Handle adding a milestone to a goal
  const handleAddMilestone = () => {
    if (!newMilestone.name || !newMilestone.targetDate) return;
    
    const milestone: Milestone = {
      id: Date.now(),
      ...newMilestone,
      completed: false
    };
    
    if (selectedGoal) {
      // Add to selected goal
      const updatedGoal = {
        ...selectedGoal,
        milestones: [...selectedGoal.milestones, milestone]
      };
      
      setSelectedGoal(updatedGoal);
      setGoals(prevGoals => prevGoals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    } else {
      // Add to new goal form
      setNewGoal(prev => ({
        ...prev,
        milestones: [...prev.milestones, milestone]
      }));
    }
    
    // Reset form
    setNewMilestone({
      name: "",
      targetDate: "",
      notes: ""
    });
  };

  // Handle completing a milestone
  const handleCompleteMilestone = (milestoneId: number) => {
    if (!selectedGoal) return;
    
    const milestone = selectedGoal.milestones.find(m => m.id === milestoneId);
    if (!milestone) return;
    
    const updatedMilestone = { ...milestone, completed: true };
    
    const updatedGoal = {
      ...selectedGoal,
      milestones: selectedGoal.milestones.filter(m => m.id !== milestoneId),
      completedMilestones: [...selectedGoal.completedMilestones, updatedMilestone],
      manifestStatus: selectedGoal.manifestStatus === 'new' ? 'in_progress' : selectedGoal.manifestStatus
    };
    
    setSelectedGoal(updatedGoal);
    setGoals(prevGoals => prevGoals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
  };

  // Handle marking a goal as manifested
  const handleMarkManifested = () => {
    if (!selectedGoal) return;
    
    const updatedGoal = {
      ...selectedGoal,
      manifestStatus: 'manifested' as const
    };
    
    setSelectedGoal(updatedGoal);
    setGoals(prevGoals => prevGoals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    setShowGoalDetailsModal(false);
  };

  // Handle adding a budget entry
  const handleAddBudgetEntry = () => {
    if (!selectedGoal || newBudgetEntry.amount <= 0 || !newBudgetEntry.description) return;
    
    const entry: BudgetEntry = {
      id: Date.now(),
      ...newBudgetEntry
    };
    
    // Calculate new current amount
    let newCurrentAmount = selectedGoal.currentAmount;
    if (entry.type === 'deposit') {
      newCurrentAmount += entry.amount;
    } else {
      newCurrentAmount -= entry.amount;
    }
    
    // Update goal with new budget entry and current amount
    const updatedGoal = {
      ...selectedGoal,
      budgetEntries: [...selectedGoal.budgetEntries, entry],
      currentAmount: newCurrentAmount
    };
    
    setSelectedGoal(updatedGoal);
    setGoals(prevGoals => prevGoals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
    
    // Reset form
    setNewBudgetEntry({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'deposit',
      description: ''
    });
  };
  
  // Handle removing a budget entry
  const handleRemoveBudgetEntry = (entryId: number) => {
    if (!selectedGoal) return;
    
    // Find the entry to remove
    const entryToRemove = selectedGoal.budgetEntries.find(entry => entry.id === entryId);
    if (!entryToRemove) return;
    
    // Calculate new current amount
    let newCurrentAmount = selectedGoal.currentAmount;
    if (entryToRemove.type === 'deposit') {
      newCurrentAmount -= entryToRemove.amount;
    } else {
      newCurrentAmount += entryToRemove.amount;
    }
    
    // Update goal with entry removed and new current amount
    const updatedGoal = {
      ...selectedGoal,
      budgetEntries: selectedGoal.budgetEntries.filter(entry => entry.id !== entryId),
      currentAmount: newCurrentAmount
    };
    
    setSelectedGoal(updatedGoal);
    setGoals(prevGoals => prevGoals.map(g => g.id === selectedGoal.id ? updatedGoal : g));
  };

  // Handle daily check-in
  const handleDailyCheckIn = (goalId: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's already a check-in for this goal today
    const existingCheckIn = checkIns.find(checkIn => 
      checkIn.goalId === goalId && checkIn.date === today
    );
    
    if (existingCheckIn) {
      // Update existing check-in
      const updatedCheckIns = checkIns.map(checkIn => {
        if (checkIn.goalId === goalId && checkIn.date === today) {
          return { ...newCheckIn, id: checkIn.id };
        }
        return checkIn;
      });
      setCheckIns(updatedCheckIns);
    } else {
      // Create new check-in
      const newEntry = {
        id: Date.now(),
        ...newCheckIn,
        goalId
      };
      setCheckIns([...checkIns, newEntry]);
    }
    
    // Update goal progress
    setGoals(prevGoals => prevGoals.map(goal => {
      if (goal.id === goalId) {
        const updatedGoal = { ...goal };
        updatedGoal.progressPercentage = calculateGoalProgress(goal);
        // If it's the first check-in and status is new, update to in_progress
        if (goal.manifestStatus === 'new') {
          updatedGoal.manifestStatus = 'in_progress';
        }
        return updatedGoal;
      }
      return goal;
    }));
    
    // Reset form
    setNewCheckIn({
      goalId,
      date: today,
      mindCompleted: false,
      bodyCompleted: false,
      spiritCompleted: false
    });
  };

  // Show goal details
  const handleViewGoalDetails = (goal: Goal) => {
    setSelectedGoal(goal);
    setNewCheckIn({
      goalId: goal.id,
      date: new Date().toISOString().split('T')[0],
      mindCompleted: false,
      bodyCompleted: false,
      spiritCompleted: false
    });
    setShowGoalDetailsModal(true);
  };

  // Get the status badge color
  const getStatusBadgeColor = (status: 'new' | 'in_progress' | 'manifested') => {
    switch (status) {
      case 'new': return 'bg-blue-900/60 text-blue-300';
      case 'in_progress': return 'bg-yellow-900/60 text-yellow-300';
      case 'manifested': return 'bg-green-900/60 text-green-300';
      default: return 'bg-gray-900/60 text-gray-300';
    }
  };

  // Get the formatted status label
  const getStatusLabel = (status: 'new' | 'in_progress' | 'manifested') => {
    switch (status) {
      case 'new': return 'New';
      case 'in_progress': return 'In Progress';
      case 'manifested': return 'Manifested';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-black max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-orbitron text-blue-400 text-4xl mb-8">🧭 Manifestation Station™</h1>

      {/* Intro */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron text-blue-400 text-2xl">Where Dreams Get Discipline.</h2>
          <div className="text-sm text-gray-400">Powered by GoTime Motorsports™</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">🧭 Why You're Here</h3>
            <p className="text-gray-300 mb-3">
              Manifestation Station™ isn't about "wishing." It's about working.
            </p>
            <p className="text-gray-300 mb-3">
              Every goal you log here — every car, watch, home, or milestone — comes with a plan built the way real winners build:
              Daily movement. Daily mindset. Daily gratitude.
            </p>
            <p className="text-gray-300">
              Because real manifestation isn't magic—it's momentum.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">🏎️ What You Get</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Dream Vault: Log your cars, watches, experiences, investments.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Goal Telemetry: Set your target, your funding path, and your timeline.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Milestone Tracking: Break down the dream into checkable steps.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Daily Discipline Tracker: Mind, Body, Spirit activities to power your progress.</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Proof of Progress System: See your real manifestation rate, not just your wish rate.</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Daily Affirmation */}
        <div className="bg-gradient-to-r from-blue-900/20 to-blue-900/5 p-4 rounded-lg border border-blue-900/30 mb-6">
          <h3 className="text-blue-400 font-medium mb-2">🙌 Today's Affirmation:</h3>
          <p className="text-white italic">"{currentAffirmation}"</p>
        </div>
        
        <div className="bg-black/30 p-4 rounded-lg mb-6">
          <p className="text-gray-300 text-center italic">
            "Manifestation Station™ isn't about posting dreams. It's about engineering victories — one daily choice at a time."
          </p>
          <p className="text-center text-gray-300 mt-2">
            <span className="text-blue-400">Dream bigger.</span> <span className="text-green-500">Work sharper.</span> <span className="text-blue-400">Drive harder.</span> <span className="text-green-500">Live better.</span>
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-lg"
          >
            ➕ Add New Goal
          </button>
        </div>
      </section>

      {/* Goals Grid */}
      <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-orbitron text-blue-400 text-2xl">🌟 Your Dream Board</h2>
          <div className="flex space-x-2">
            <div className="bg-black/30 px-3 py-1 rounded-md border border-blue-900/30">
              <span className="text-gray-400 text-xs">Dream Count:</span>
              <span className="text-blue-400 text-xs ml-2 font-mono">{goals.filter(goal => goal.manifestStatus !== 'manifested').length}</span>
            </div>
            <div className="bg-black/30 px-3 py-1 rounded-md border border-green-900/30">
              <span className="text-gray-400 text-xs">Manifested:</span>
              <span className="text-green-400 text-xs ml-2 font-mono">{goals.filter(goal => goal.manifestStatus === 'manifested').length}</span>
            </div>
          </div>
        </div>
        
        {goals.length === 0 ? (
          <div className="bg-black/20 rounded-lg border border-gray-800 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-900/20 flex items-center justify-center">
              <span className="text-blue-400 text-3xl">🧭</span>
            </div>
            <h3 className="text-blue-400 font-orbitron text-xl mb-2">Your Dreams Await</h3>
            <p className="text-gray-300 font-openSans mb-6">
              Start building your future by adding a dream to your board.
            </p>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Your First Dream
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.filter(goal => goal.manifestStatus !== 'manifested').map((goal) => (
              <div 
                key={goal.id} 
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-5 shadow-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-all hover:shadow-blue-900/20 hover:shadow-2xl"
                onClick={() => handleViewGoalDetails(goal)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-blue-400 font-orbitron text-xl">{goal.goalName}</h3>
                  <div className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(goal.manifestStatus)}`}>
                    {getStatusLabel(goal.manifestStatus)}
                  </div>
                </div>
                
                <p className="text-white mb-2 font-medium">{goal.goalType}: {goal.targetAsset}</p>
                <p className="text-gray-300 text-sm mb-1">🎯 Target Date: {goal.targetDate}</p>
                <p className="text-gray-300 text-sm mb-3">💰 Funding Plan: {goal.fundingPlan}</p>
                
                {/* Financial Progress */}
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Target Amount:</span>
                    <span className="text-green-400 font-medium">${goal.targetAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Current Savings:</span>
                    <span className="text-green-400 font-medium">${goal.currentAmount.toLocaleString()}</span>
                  </div>
                  <div className="bg-gray-700 h-2.5 w-full rounded-full">
                    <div
                      style={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
                      className="bg-green-500 h-2.5 rounded-full"
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Financial progress</span>
                    <span>{Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
                  </div>
                </div>
                
                {/* Mind-Body-Spirit Focus */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-blue-900/20 p-2 rounded border border-blue-900/30">
                    <div className="text-blue-400 text-xs font-medium mb-1">Mind</div>
                    <div className="text-white text-xs line-clamp-2">{goal.mindFocus}</div>
                  </div>
                  <div className="bg-green-900/20 p-2 rounded border border-green-900/30">
                    <div className="text-green-400 text-xs font-medium mb-1">Body</div>
                    <div className="text-white text-xs line-clamp-2">{goal.bodyFocus}</div>
                  </div>
                  <div className="bg-yellow-900/20 p-2 rounded border border-yellow-900/30">
                    <div className="text-yellow-400 text-xs font-medium mb-1">Spirit</div>
                    <div className="text-white text-xs line-clamp-2">{goal.spiritFocus}</div>
                  </div>
                </div>
                
                {/* Overall Progress */}
                <div className="mt-3 mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Overall Progress</span>
                    <span>{goal.progressPercentage}%</span>
                  </div>
                  <div className="bg-gray-700 h-3 w-full rounded-full">
                    <div
                      style={{ width: `${goal.progressPercentage}%` }}
                      className="bg-blue-500 h-3 rounded-full"
                    ></div>
                  </div>
                </div>
                
                <div className="flex mt-4 text-xs text-gray-400 justify-between">
                  <span>{goal.completedMilestones.length} / {goal.milestones.length + goal.completedMilestones.length} milestones complete</span>
                  <span className="text-blue-400">Click for details →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manifested Dreams (Archive) */}
      {goals.some(goal => goal.manifestStatus === 'manifested') && (
        <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-orbitron text-green-400 text-2xl">✨ Manifested Dreams</h2>
            <div className="bg-black/30 px-3 py-1 rounded-md border border-green-900/30">
              <span className="text-gray-400 text-xs">Success Rate:</span>
              <span className="text-green-400 text-xs ml-2 font-mono">{Math.round((goals.filter(goal => goal.manifestStatus === 'manifested').length / goals.length) * 100)}%</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-900/10 to-black/0 p-4 rounded-lg border border-green-900/20 mb-6">
            <p className="text-gray-300 font-openSans italic text-center">
              "Proof that dreams, when worked for, drive reality faster than anything else."
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.filter(goal => goal.manifestStatus === 'manifested').map((goal) => (
              <div 
                key={goal.id} 
                className="bg-gradient-to-br from-gray-800 to-green-900/20 rounded-lg p-5 shadow-xl border border-green-900/30 cursor-pointer hover:border-green-500 transition-all hover:shadow-green-900/20 hover:shadow-2xl"
                onClick={() => handleViewGoalDetails(goal)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-green-400 font-orbitron text-xl">{goal.goalName}</h3>
                  <div className="bg-green-900/60 px-2 py-1 rounded text-xs text-green-300 font-medium flex items-center">
                    <span className="mr-1">✓</span> Manifested
                  </div>
                </div>
                
                <p className="text-white mb-3 font-medium">{goal.goalType}: {goal.targetAsset}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/30 p-3 rounded-lg border border-green-900/20">
                    <div className="text-gray-400 text-xs mb-1">Target Amount</div>
                    <div className="text-green-400 font-medium">${goal.targetAmount.toLocaleString()}</div>
                  </div>
                  <div className="bg-black/30 p-3 rounded-lg border border-green-900/20">
                    <div className="text-gray-400 text-xs mb-1">Timeline</div>
                    <div className="text-green-400 font-medium">{goal.targetDate}</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/20 to-black/0 p-3 rounded-lg mb-3">
                  <div className="flex justify-between">
                    <div>
                      <span className="text-gray-400 text-xs">Milestones</span>
                      <div className="text-white font-medium">{goal.completedMilestones.length} completed</div>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Funding Plan</span>
                      <div className="text-white font-medium">{goal.fundingPlan}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-green-400 text-xs">100% Complete</span>
                  </div>
                  <span className="text-green-400 text-xs">View details →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add Goal Modal */}
      {showAddGoalModal && (
        <Dialog open={showAddGoalModal} onOpenChange={setShowAddGoalModal}>
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="font-orbitron text-blue-400 text-2xl mb-6">➕ Add New Goal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Goal Info */}
                <div className="space-y-4 col-span-1 md:col-span-2">
                  <input
                    type="text"
                    placeholder="Goal Name"
                    value={newGoal.goalName}
                    onChange={(e) => setNewGoal({ ...newGoal, goalName: e.target.value })}
                    className="bg-gray-800 text-white px-6 py-3 rounded border border-gray-700 w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Goal Type</label>
                  <Select
                    value={newGoal.goalType}
                    onValueChange={(value) => setNewGoal({ ...newGoal, goalType: value })}
                  >
                    <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                      <SelectValue placeholder="Goal Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="Car">Car</SelectItem>
                      <SelectItem value="Watch">Watch</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Target Asset (e.g., Ferrari 458, Patek 5711)"
                    value={newGoal.targetAsset}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAsset: e.target.value })}
                    className="bg-gray-800 text-white px-6 py-3 rounded border border-gray-700 w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="bg-gray-800 text-white px-6 py-3 rounded border border-gray-700 w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Funding Plan</label>
                  <Select
                    value={newGoal.fundingPlan}
                    onValueChange={(value) => setNewGoal({ ...newGoal, fundingPlan: value })}
                  >
                    <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                      <SelectValue placeholder="Funding Plan" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="Save">Save</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Trade">Trade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Dream Tracker */}
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-blue-400 font-orbitron text-lg mb-3">Daily Discipline Tracker</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm">Mind Activity</label>
                      <Select
                        value={newGoal.mindFocus}
                        onValueChange={(value) => setNewGoal({ ...newGoal, mindFocus: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                          <SelectValue placeholder="Mind Activity" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="Meditation">Meditation</SelectItem>
                          <SelectItem value="Visualization">Visualization</SelectItem>
                          <SelectItem value="Journaling">Journaling</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm">Body Activity</label>
                      <Select
                        value={newGoal.bodyFocus}
                        onValueChange={(value) => setNewGoal({ ...newGoal, bodyFocus: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                          <SelectValue placeholder="Body Activity" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="Exercise">Exercise</SelectItem>
                          <SelectItem value="Movement">Movement</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm">Spirit Activity</label>
                      <Select
                        value={newGoal.spiritFocus}
                        onValueChange={(value) => setNewGoal({ ...newGoal, spiritFocus: value })}
                      >
                        <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                          <SelectValue placeholder="Spirit Activity" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white border-gray-700">
                          <SelectItem value="Gratitude Log">Gratitude Log</SelectItem>
                          <SelectItem value="Prayer">Prayer</SelectItem>
                          <SelectItem value="Reflection">Reflection</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div className="col-span-1 md:col-span-2">
                  <textarea
                    placeholder="Additional notes or description"
                    value={newGoal.description || ""}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="bg-gray-800 text-white px-6 py-3 rounded border border-gray-700 w-full h-24"
                  />
                </div>
                
                {/* Milestones */}
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-blue-400 font-orbitron text-lg mb-3">Add Milestones</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Milestone Name"
                      value={newMilestone.name}
                      onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                      className="bg-gray-800 text-white px-6 py-3 rounded border border-gray-700"
                    />
                    
                    <input
                      type="date"
                      value={newMilestone.targetDate}
                      onChange={(e) => setNewMilestone({ ...newMilestone, targetDate: e.target.value })}
                      className="bg-gray-800 text-white px-6 py-3 rounded border border-gray-700"
                    />
                    
                    <div className="col-span-1 md:col-span-2">
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={newMilestone.notes}
                        onChange={(e) => setNewMilestone({ ...newMilestone, notes: e.target.value })}
                        className="bg-gray-800 text-white px-6 py-3 rounded border border-gray-700 w-full"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddMilestone}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Add Milestone
                  </button>
                  
                  {/* Milestone List */}
                  {newGoal.milestones.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-gray-300 font-medium mb-2">Added Milestones:</h4>
                      <ul className="space-y-2">
                        {newGoal.milestones.map((milestone) => (
                          <li key={milestone.id} className="bg-gray-700 p-2 rounded flex justify-between">
                            <span>{milestone.name} - {milestone.targetDate}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowAddGoalModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  className="bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-lg"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Goal Details Modal */}
      {showGoalDetailsModal && selectedGoal && (
        <Dialog open={showGoalDetailsModal} onOpenChange={setShowGoalDetailsModal}>
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="font-orbitron text-blue-400 text-2xl">{selectedGoal.goalName}</h2>
                <div className={`px-3 py-1 rounded text-sm ${getStatusBadgeColor(selectedGoal.manifestStatus)}`}>
                  {getStatusLabel(selectedGoal.manifestStatus)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-gray-300 text-sm mb-1">Goal Type</h3>
                  <p className="text-white font-medium">{selectedGoal.goalType}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-300 text-sm mb-1">Target Asset</h3>
                  <p className="text-white font-medium">{selectedGoal.targetAsset}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-300 text-sm mb-1">Target Date</h3>
                  <p className="text-white font-medium">{selectedGoal.targetDate}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-300 text-sm mb-1">Funding Plan</h3>
                  <p className="text-white font-medium">{selectedGoal.fundingPlan}</p>
                </div>
              </div>
              
              {/* Progress Section */}
              <div className="mb-8">
                <h3 className="text-blue-400 font-orbitron text-lg mb-3">Progress</h3>
                <div className="bg-gray-700 h-4 w-full rounded-full mb-2">
                  <div
                    style={{ width: `${selectedGoal.progressPercentage}%` }}
                    className="bg-green-500 h-4 rounded-full"
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>0%</span>
                  <span>{selectedGoal.progressPercentage}% Complete</span>
                  <span>100%</span>
                </div>
              </div>
              
              {/* Budget Tracker */}
              <div className="mb-8">
                <h3 className="text-green-400 font-orbitron text-lg mb-3">💰 Financial Telemetry</h3>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-center mb-4">
                    <div className="bg-black/30 px-4 py-2 rounded-lg border border-green-900/20">
                      <div className="text-gray-400 text-xs">Target Amount</div>
                      <div className="text-green-400 text-xl font-mono font-medium">${selectedGoal.targetAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-black/30 px-4 py-2 rounded-lg border border-blue-900/20">
                      <div className="text-gray-400 text-xs">Current Balance</div>
                      <div className="text-blue-400 text-xl font-mono font-medium">${selectedGoal.currentAmount.toLocaleString()}</div>
                    </div>
                    <div className="bg-black/30 px-4 py-2 rounded-lg border border-gray-900/20">
                      <div className="text-gray-400 text-xs">Remaining</div>
                      <div className="text-gray-200 text-xl font-mono font-medium">${(selectedGoal.targetAmount - selectedGoal.currentAmount).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Financial Progress</span>
                      <span>{Math.min(100, Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100))}%</span>
                    </div>
                    <div className="bg-gray-700 h-3 w-full rounded-full">
                      <div 
                        style={{ width: `${Math.min(100, (selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)}%` }}
                        className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full"
                      ></div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="mt-6 mb-4">
                    <h4 className="text-white font-medium mb-2">Transaction History</h4>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="w-full">
                        <thead className="text-left bg-black/40 text-gray-300 text-sm">
                          <tr>
                            <th className="py-2 px-3 rounded-tl-md">Date</th>
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3 rounded-tr-md text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {selectedGoal.budgetEntries.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-4 text-center text-gray-500">No transactions yet</td>
                            </tr>
                          ) : (
                            selectedGoal.budgetEntries.map(entry => (
                              <tr key={entry.id} className="hover:bg-black/20">
                                <td className="py-2 px-3 text-gray-300 text-sm">{entry.date}</td>
                                <td className="py-2 px-3 text-white">{entry.description}</td>
                                <td className="py-2 px-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${entry.type === 'deposit' ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                    {entry.type === 'deposit' ? 'Deposit' : 'Expense'}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right font-mono">
                                  <span className={entry.type === 'deposit' ? 'text-green-400' : 'text-red-400'}>
                                    {entry.type === 'deposit' ? '+' : '-'}${entry.amount.toLocaleString()}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add Transaction Form */}
                  <div className="mt-6 p-4 bg-black/30 rounded-lg border border-gray-700">
                    <h4 className="text-white font-medium mb-3">Add Transaction</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Type</label>
                        <select 
                          value={newBudgetEntry.type}
                          onChange={(e) => setNewBudgetEntry({...newBudgetEntry, type: e.target.value as 'deposit' | 'expense'})}
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                        >
                          <option value="deposit">Deposit</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Amount ($)</label>
                        <input
                          type="number"
                          value={newBudgetEntry.amount}
                          onChange={(e) => setNewBudgetEntry({...newBudgetEntry, amount: parseFloat(e.target.value) || 0})}
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Date</label>
                        <input
                          type="date"
                          value={newBudgetEntry.date}
                          onChange={(e) => setNewBudgetEntry({...newBudgetEntry, date: e.target.value})}
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-1">Description</label>
                        <input
                          type="text"
                          value={newBudgetEntry.description}
                          onChange={(e) => setNewBudgetEntry({...newBudgetEntry, description: e.target.value})}
                          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 w-full"
                          placeholder="e.g., Bonus, Investment, etc."
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddBudgetEntry}
                      disabled={newBudgetEntry.amount <= 0 || !newBudgetEntry.description}
                      className={`px-4 py-2 rounded text-white ${
                        newBudgetEntry.amount <= 0 || !newBudgetEntry.description
                          ? 'bg-gray-600 cursor-not-allowed'
                          : newBudgetEntry.type === 'deposit' 
                            ? 'bg-green-600 hover:bg-green-500' 
                            : 'bg-red-600 hover:bg-red-500'
                      }`}
                    >
                      {newBudgetEntry.type === 'deposit' ? 'Add Deposit' : 'Record Expense'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Daily Tracker Check-in */}
              <div className="mb-8">
                <h3 className="text-blue-400 font-orbitron text-lg mb-3">🧠 Daily Discipline Tracker</h3>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-white mb-4">Check in on your daily activities to advance your goal:</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newCheckIn.mindCompleted}
                        onChange={(e) => setNewCheckIn({...newCheckIn, mindCompleted: e.target.checked})}
                        className="h-5 w-5 rounded"
                      />
                      <label className="text-white">Mind: {selectedGoal.mindFocus}</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newCheckIn.bodyCompleted}
                        onChange={(e) => setNewCheckIn({...newCheckIn, bodyCompleted: e.target.checked})}
                        className="h-5 w-5 rounded"
                      />
                      <label className="text-white">Body: {selectedGoal.bodyFocus}</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newCheckIn.spiritCompleted}
                        onChange={(e) => setNewCheckIn({...newCheckIn, spiritCompleted: e.target.checked})}
                        className="h-5 w-5 rounded"
                      />
                      <label className="text-white">Spirit: {selectedGoal.spiritFocus}</label>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDailyCheckIn(selectedGoal.id)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Log Today's Check-in
                  </button>
                </div>
              </div>
              
              {/* Milestones */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-blue-400 font-orbitron text-lg">🚩 Milestone Tracker</h3>
                  <div className="bg-black/30 px-3 py-1 rounded-md border border-blue-900/30">
                    <span className="text-gray-400 text-xs">Progress:</span>
                    <span className="text-blue-400 text-xs ml-2 font-mono">
                      {selectedGoal.completedMilestones.length} / {selectedGoal.milestones.length + selectedGoal.completedMilestones.length}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 mb-4">
                  {/* Incomplete Milestones */}
                  {selectedGoal.milestones.length > 0 ? (
                    <div className="mb-6">
                      <div className="flex items-center mb-3">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                        <h4 className="text-yellow-400 font-medium">Pending Milestones</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedGoal.milestones.map((milestone) => (
                          <div key={milestone.id} className="bg-black/30 p-4 rounded-lg border border-gray-700 hover:border-yellow-500/30 transition-colors">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-white font-medium">{milestone.name}</p>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                  <span className="inline-block bg-gray-800 px-2 py-0.5 rounded mr-2">Target: {milestone.targetDate}</span>
                                  {new Date(milestone.targetDate) < new Date() ? (
                                    <span className="text-red-400">Overdue</span>
                                  ) : (
                                    <span className="text-yellow-400">On track</span>
                                  )}
                                </div>
                                {milestone.notes && (
                                  <div className="mt-2 text-gray-300 text-sm">
                                    <p>{milestone.notes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => handleCompleteMilestone(milestone.id)}
                                  className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1 rounded flex items-center"
                                >
                                  <span className="mr-1">✓</span> Complete
                                </button>
                                <button 
                                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                                  onClick={() => {
                                    setNewMilestone({
                                      name: milestone.name,
                                      targetDate: milestone.targetDate,
                                      notes: milestone.notes || ""
                                    });
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/20 p-4 rounded-lg text-center mb-6">
                      <p className="text-gray-400">No pending milestones</p>
                    </div>
                  )}
                  
                  {/* Completed Milestones */}
                  {selectedGoal.completedMilestones.length > 0 && (
                    <div>
                      <div className="flex items-center mb-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                        <h4 className="text-green-400 font-medium">Completed Milestones</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedGoal.completedMilestones.map((milestone) => (
                          <div key={milestone.id} className="bg-black/30 p-4 rounded-lg border border-green-900/30">
                            <div className="flex items-start">
                              <span className="text-green-500 mr-2 font-bold">✓</span>
                              <div>
                                <p className="text-gray-200 font-medium">{milestone.name}</p>
                                <p className="text-gray-400 text-xs mt-1">Completed on: {new Date().toLocaleDateString()}</p>
                                {milestone.notes && <p className="text-gray-400 text-sm mt-2">{milestone.notes}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Add milestone form */}
                <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-3">Add New Milestone</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Test drive, Dealer deposit, etc."
                        value={newMilestone.name}
                        onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-1">Target Date</label>
                      <input
                        type="date"
                        value={newMilestone.targetDate}
                        onChange={(e) => setNewMilestone({...newMilestone, targetDate: e.target.value})}
                        className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-1">Notes (optional)</label>
                    <textarea
                      placeholder="Any additional details about this milestone..."
                      value={newMilestone.notes}
                      onChange={(e) => setNewMilestone({...newMilestone, notes: e.target.value})}
                      className="bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 w-full"
                      rows={2}
                    />
                  </div>
                  
                  <button
                    onClick={handleAddMilestone}
                    disabled={!newMilestone.name || !newMilestone.targetDate}
                    className={`px-4 py-2 rounded text-white ${
                      !newMilestone.name || !newMilestone.targetDate 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    {newMilestone.name && newMilestone.targetDate ? '+ Add Milestone' : 'Name and Date Required'}
                  </button>
                </div>
              </div>
              
              {/* Media Gallery */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-blue-400 font-orbitron text-lg">🖼️ Media Gallery</h3>
                  <div className="bg-black/30 px-3 py-1 rounded-md border border-blue-900/30">
                    <span className="text-gray-400 text-xs">Files:</span>
                    <span className="text-blue-400 text-xs ml-2 font-mono">{selectedGoal.mediaGallery.length}</span>
                  </div>
                </div>
                
                {/* Telemetry-style gallery container */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 mb-4">
                  {selectedGoal.mediaGallery.length > 0 ? (
                    <div>
                      {/* Gallery filter tabs */}
                      <div className="flex mb-4 space-x-2 border-b border-gray-700 pb-2">
                        <button className="bg-blue-900/40 text-white px-3 py-1 rounded-lg text-sm">All ({selectedGoal.mediaGallery.length})</button>
                        <button className="hover:bg-gray-700/40 text-gray-300 px-3 py-1 rounded-lg text-sm">Images ({selectedGoal.mediaGallery.filter(m => m.type === 'image').length})</button>
                        <button className="hover:bg-gray-700/40 text-gray-300 px-3 py-1 rounded-lg text-sm">Files ({selectedGoal.mediaGallery.filter(m => m.type === 'file').length})</button>
                        <button className="hover:bg-gray-700/40 text-gray-300 px-3 py-1 rounded-lg text-sm">Links ({selectedGoal.mediaGallery.filter(m => m.type === 'link').length})</button>
                      </div>
                      
                      {/* Main grid display of media items */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedGoal.mediaGallery.map(media => (
                          <div 
                            key={media.id} 
                            className={`bg-black/40 rounded-lg border overflow-hidden hover:shadow-lg hover:border-blue-500/50 transition-all ${
                              media.type === 'image' ? 'border-indigo-900/30' : 
                              media.type === 'file' ? 'border-amber-900/30' : 'border-emerald-900/30'
                            }`}
                          >
                            {media.type === 'image' && (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="relative h-40 overflow-hidden bg-gray-900">
                                  <img 
                                    src={media.thumbnail || media.url} 
                                    alt={media.name}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                  />
                                  <div className="absolute top-2 left-2 bg-black/60 text-xs text-white px-2 py-1 rounded">
                                    Image
                                  </div>
                                </div>
                                <div className="p-3">
                                  <h4 className="text-white font-medium truncate">{media.name}</h4>
                                  <p className="text-gray-400 text-xs mt-1">Added: {new Date(media.dateAdded).toLocaleDateString()}</p>
                                  {media.description && (
                                    <p className="text-gray-300 text-sm mt-2 line-clamp-2">{media.description}</p>
                                  )}
                                </div>
                              </a>
                            )}

                            {media.type === 'link' && (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="p-4 block">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-emerald-900/30 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-emerald-400 text-lg">🔗</span>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium">{media.name}</h4>
                                    <p className="text-emerald-400 text-xs truncate">{media.url}</p>
                                  </div>
                                </div>
                                {media.description && (
                                  <p className="text-gray-300 text-sm mt-3 line-clamp-2">{media.description}</p>
                                )}
                                <p className="text-gray-400 text-xs mt-3">Added: {new Date(media.dateAdded).toLocaleDateString()}</p>
                              </a>
                            )}

                            {media.type === 'file' && (
                              <a href={media.url} target="_blank" rel="noopener noreferrer" className="p-4 block">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-amber-900/30 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-amber-400 text-lg">📄</span>
                                  </div>
                                  <div>
                                    <h4 className="text-white font-medium">{media.name}</h4>
                                    <p className="text-amber-400 text-xs">Document</p>
                                  </div>
                                </div>
                                {media.description && (
                                  <p className="text-gray-300 text-sm mt-3 line-clamp-2">{media.description}</p>
                                )}
                                <p className="text-gray-400 text-xs mt-3">Added: {new Date(media.dateAdded).toLocaleDateString()}</p>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-black/20 rounded-lg">
                      <div className="text-4xl mb-3">🖼️</div>
                      <p className="text-gray-400 mb-2">No media added yet</p>
                      <p className="text-gray-500 text-sm">Add images, documents, or links to visualize your goal</p>
                    </div>
                  )}
                </div>
                
                {/* Add new media section */}
                <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                  <h4 className="text-white font-medium mb-3">Add Media</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Add Image Button */}
                    <div className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 p-3 rounded-lg border border-indigo-900/30 text-center hover:border-indigo-500/50 cursor-pointer transition-colors">
                      <div className="text-3xl mb-2">🖼️</div>
                      <h5 className="font-medium text-white mb-1">Add Image</h5>
                      <p className="text-gray-400 text-xs">Upload photos of your dream asset</p>
                    </div>
                    
                    {/* Add File Button */}
                    <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 p-3 rounded-lg border border-amber-900/30 text-center hover:border-amber-500/50 cursor-pointer transition-colors">
                      <div className="text-3xl mb-2">📄</div>
                      <h5 className="font-medium text-white mb-1">Add Document</h5>
                      <p className="text-gray-400 text-xs">Upload specs, brochures, PDFs</p>
                    </div>
                    
                    {/* Add Link Button */}
                    <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 p-3 rounded-lg border border-emerald-900/30 text-center hover:border-emerald-500/50 cursor-pointer transition-colors">
                      <div className="text-3xl mb-2">🔗</div>
                      <h5 className="font-medium text-white mb-1">Add Link</h5>
                      <p className="text-gray-400 text-xs">Save websites, articles, videos</p>
                    </div>
                  </div>

                  {/* Automatic High-Res Photo Search Section */}
                  <div className="mt-4 bg-gradient-to-br from-blue-900/20 to-blue-900/5 p-4 rounded-lg border border-blue-900/30">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-blue-400 font-medium">🔍 Automatic Photo Search</h5>
                      <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded">
                        Find Photos
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Let us find high-quality images of "{selectedGoal.targetAsset}" to help you visualize your goal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setShowGoalDetailsModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg"
                >
                  Close
                </button>
                
                {selectedGoal.manifestStatus !== 'manifested' && (
                  <button
                    onClick={handleMarkManifested}
                    className="bg-green-500 hover:bg-green-400 text-black font-medium px-6 py-3 rounded-lg"
                  >
                    Mark as Manifested
                  </button>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ManifestationStationPage;