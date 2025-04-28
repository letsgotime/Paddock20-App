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
}

// Interface for daily check-ins
interface DailyCheckin {
  id: number;
  goalId: number;
  date: string;
  mindCompleted: boolean;
  bodyCompleted: boolean;
  spiritCompleted: boolean;
}

const ManifestationStationPage = () => {
  // State for goals
  const [goals, setGoals] = useState<Goal[]>([]);
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
    description: ""
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
      description: ""
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
        <h2 className="font-orbitron text-blue-400 text-2xl mb-6">🌟 Your Dream Board</h2>
        
        {goals.length === 0 ? (
          <p className="text-gray-300 font-openSans text-center py-8">
            No dreams saved yet. Start building your future by adding a goal.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.filter(goal => goal.manifestStatus !== 'manifested').map((goal) => (
              <div 
                key={goal.id} 
                className="bg-gray-800 rounded-lg p-5 shadow-lg border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => handleViewGoalDetails(goal)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-blue-400 font-orbitron text-xl">{goal.goalName}</h3>
                  <div className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(goal.manifestStatus)}`}>
                    {getStatusLabel(goal.manifestStatus)}
                  </div>
                </div>
                
                <p className="text-white mb-2">{goal.goalType}: {goal.targetAsset}</p>
                <p className="text-gray-300 text-sm mb-2">🎯 Target Date: {goal.targetDate}</p>
                <p className="text-gray-300 text-sm mb-2">💰 Funding Plan: {goal.fundingPlan}</p>
                
                <div className="mt-4 mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{goal.progressPercentage}%</span>
                  </div>
                  <div className="bg-gray-700 h-3 w-full rounded-full">
                    <div
                      style={{ width: `${goal.progressPercentage}%` }}
                      className="bg-green-500 h-3 rounded-full"
                    ></div>
                  </div>
                </div>
                
                <div className="flex mt-4 text-xs text-gray-400 justify-between">
                  <span>{goal.completedMilestones.length} / {goal.milestones.length + goal.completedMilestones.length} milestones complete</span>
                  <span>Click for details</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manifested Dreams (Archive) */}
      {goals.some(goal => goal.manifestStatus === 'manifested') && (
        <section className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
          <h2 className="font-orbitron text-blue-400 text-2xl mb-6">✨ Manifested Dreams</h2>
          <p className="text-gray-300 font-openSans mb-6 italic">
            "Proof that dreams, when worked for, drive reality faster than anything else."
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.filter(goal => goal.manifestStatus === 'manifested').map((goal) => (
              <div 
                key={goal.id} 
                className="bg-gradient-to-br from-gray-800 to-green-900/20 rounded-lg p-5 shadow-lg border border-green-900/50 cursor-pointer hover:border-green-500 transition-colors"
                onClick={() => handleViewGoalDetails(goal)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-green-400 font-orbitron text-xl">{goal.goalName}</h3>
                  <div className="bg-green-900/60 px-2 py-1 rounded text-xs text-green-300">
                    Manifested
                  </div>
                </div>
                
                <p className="text-white mb-2">{goal.goalType}: {goal.targetAsset}</p>
                <p className="text-gray-300 text-sm mb-1">
                  🎯 Target Date: {goal.targetDate}
                </p>
                <p className="text-gray-300 text-sm">
                  ✅ Completed {goal.completedMilestones.length} milestones
                </p>
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
              
              {/* Daily Tracker Check-in */}
              <div className="mb-8">
                <h3 className="text-blue-400 font-orbitron text-lg mb-3">Daily Discipline Tracker</h3>
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
                <h3 className="text-blue-400 font-orbitron text-lg mb-3">Milestones</h3>
                
                {/* Incomplete Milestones */}
                {selectedGoal.milestones.length > 0 ? (
                  <div className="mb-4">
                    <h4 className="text-gray-300 mb-2">Pending:</h4>
                    <div className="space-y-2">
                      {selectedGoal.milestones.map((milestone) => (
                        <div key={milestone.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                          <div>
                            <p className="text-white">{milestone.name}</p>
                            <p className="text-gray-400 text-xs">Target: {milestone.targetDate}</p>
                            {milestone.notes && <p className="text-gray-400 text-xs">{milestone.notes}</p>}
                          </div>
                          
                          <button
                            onClick={() => handleCompleteMilestone(milestone.id)}
                            className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1 rounded"
                          >
                            Mark Complete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 mb-4">No pending milestones</p>
                )}
                
                {/* Completed Milestones */}
                {selectedGoal.completedMilestones.length > 0 && (
                  <div>
                    <h4 className="text-gray-300 mb-2">Completed:</h4>
                    <div className="space-y-2">
                      {selectedGoal.completedMilestones.map((milestone) => (
                        <div key={milestone.id} className="bg-gray-800 p-3 rounded-lg border border-green-900/40 flex items-center">
                          <div className="text-green-400 mr-2">✓</div>
                          <div>
                            <p className="text-white">{milestone.name}</p>
                            <p className="text-gray-400 text-xs">Completed</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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