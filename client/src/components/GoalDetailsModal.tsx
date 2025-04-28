import React from "react";
import { Goal, GoalMedia, Milestone, BudgetEntry, DailyCheckin } from "../types/manifestation";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { PlusIcon, X } from "lucide-react";

interface GoalDetailsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  goal: Goal;
  setGoal: (goal: Goal) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  newCheckIn: DailyCheckin;
  setNewCheckIn: (checkIn: DailyCheckin) => void;
  newBudgetEntry: BudgetEntry;
  setNewBudgetEntry: (entry: BudgetEntry) => void;
  handleDailyCheckIn: (goalId: number) => void;
  handleAddBudgetEntry: () => void;
  setShowPhotoUploadModal: (show: boolean) => void;
}

// Helper functions
const getStatusBadgeColor = (status: 'new' | 'in_progress' | 'manifested') => {
  switch (status) {
    case 'new':
      return 'bg-blue-900/20 text-blue-400';
    case 'in_progress':
      return 'bg-yellow-900/20 text-yellow-400';
    case 'manifested':
      return 'bg-green-900/20 text-green-400';
    default:
      return 'bg-gray-900/20 text-gray-400';
  }
};

const getStatusLabel = (status: 'new' | 'in_progress' | 'manifested') => {
  switch (status) {
    case 'new':
      return 'New';
    case 'in_progress':
      return 'In Progress';
    case 'manifested':
      return 'Manifested';
    default:
      return 'Unknown';
  }
};

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({
  isOpen,
  setIsOpen,
  goal,
  setGoal,
  activeTab,
  setActiveTab,
  newCheckIn,
  setNewCheckIn,
  newBudgetEntry,
  setNewBudgetEntry,
  handleDailyCheckIn,
  handleAddBudgetEntry,
  setShowPhotoUploadModal
}) => {
  // Add state for editing mode
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedGoal, setEditedGoal] = React.useState<Goal>(goal);
  
  // Update edited goal when the original goal changes
  React.useEffect(() => {
    setEditedGoal(goal);
  }, [goal]);
  
  // Function to save edits
  const saveEdits = () => {
    setGoal(editedGoal);
    setIsEditing(false);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-0 max-w-5xl w-full border border-gray-700 overflow-hidden">
        {/* Modal Header with Telemetry Style */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="h-8 w-1 bg-blue-400 rounded-full mr-3"></div>
              <h2 className="text-blue-400 font-orbitron text-2xl">{goal.goalName}</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-sm px-3 py-1 rounded ${isEditing ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Dream'}
              </button>
              {isEditing && (
                <button
                  onClick={saveEdits}
                  className="text-sm px-3 py-1 rounded bg-green-600 hover:bg-green-500"
                >
                  Save Changes
                </button>
              )}
              <DialogClose className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </DialogClose>
            </div>
          </div>
          
          {/* Key stats dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Progress</div>
              <div className="text-blue-400 font-mono text-lg font-medium">{goal.progressPercentage}%</div>
            </div>
            
            <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Target Date</div>
              <div className="text-green-400 font-mono text-sm">{goal.targetDate}</div>
            </div>
            
            <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Current Balance</div>
              <div className="text-blue-400 font-mono text-sm">${goal.currentAmount.toLocaleString()}</div>
            </div>
            
            <div className="bg-black/40 p-3 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-xs mb-1">Status</div>
              <div className={`px-2 py-1 rounded text-xs inline-flex items-center ${getStatusBadgeColor(goal.manifestStatus)}`}>
                <span className="h-2 w-2 rounded-full bg-current mr-1"></span>
                {getStatusLabel(goal.manifestStatus)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-700">
          <div className="flex px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === "overview" 
                  ? "border-blue-500 text-blue-500" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("finances")}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === "finances" 
                  ? "border-green-500 text-green-500" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Finances
            </button>
            <button
              onClick={() => setActiveTab("disciplines")}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === "disciplines" 
                  ? "border-purple-500 text-purple-500" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Disciplines
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`py-3 px-4 font-medium border-b-2 ${
                activeTab === "media" 
                  ? "border-indigo-500 text-indigo-500" 
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Media
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Basic Info Section */}
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-blue-400 rounded-full mr-2"></div>
                  <h3 className="text-blue-400 font-orbitron text-lg">Goal Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Goal Type</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedGoal.goalType}
                        onChange={(e) => setEditedGoal({...editedGoal, goalType: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    ) : (
                      <div className="text-white font-medium">{goal.goalType}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Target Asset</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedGoal.targetAsset}
                        onChange={(e) => setEditedGoal({...editedGoal, targetAsset: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      />
                    ) : (
                      <div className="text-white font-medium">{goal.targetAsset}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Mind Focus</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedGoal.mindFocus}
                        onChange={(e) => setEditedGoal({...editedGoal, mindFocus: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-purple-400"
                      />
                    ) : (
                      <div className="text-purple-400 font-medium">{goal.mindFocus}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Body Focus</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedGoal.bodyFocus}
                        onChange={(e) => setEditedGoal({...editedGoal, bodyFocus: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-green-400"
                      />
                    ) : (
                      <div className="text-green-400 font-medium">{goal.bodyFocus}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Spirit Focus</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedGoal.spiritFocus}
                        onChange={(e) => setEditedGoal({...editedGoal, spiritFocus: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-blue-400"
                      />
                    ) : (
                      <div className="text-blue-400 font-medium">{goal.spiritFocus}</div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Funding Plan</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedGoal.fundingPlan}
                        onChange={(e) => setEditedGoal({...editedGoal, fundingPlan: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-amber-400"
                      />
                    ) : (
                      <div className="text-amber-400 font-medium">{goal.fundingPlan}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress Timeline */}
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-green-400 rounded-full mr-2"></div>
                  <h3 className="text-green-400 font-orbitron text-lg">Timeline Progress</h3>
                </div>
                
                <div className="mb-4">
                  <div className="relative">
                    <div className="h-2 bg-gray-700 rounded-full w-full mb-6">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full" 
                        style={{ width: `${goal.progressPercentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="absolute bottom-full mb-1 text-xs text-white font-mono px-1 py-0.5 bg-blue-500 rounded"
                      style={{ left: `calc(${goal.progressPercentage}% - 15px)` }}>
                      {goal.progressPercentage}%
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">Start Date</div>
                      <div className="text-white text-sm font-mono">2024-04-01</div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">Current Date</div>
                      <div className="text-white text-sm font-mono">{new Date().toISOString().slice(0, 10)}</div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">Target Date</div>
                      <div className="text-white text-sm font-mono">{goal.targetDate}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-purple-400 rounded-full mr-2"></div>
                  <h3 className="text-purple-400 font-orbitron text-lg">Dream Description</h3>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                  {isEditing ? (
                    <textarea
                      value={editedGoal.description || ''}
                      onChange={(e) => setEditedGoal({...editedGoal, description: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white min-h-[100px]"
                    />
                  ) : (
                    <p className="text-white">{goal.description || 'No description available.'}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Finances Tab */}
          {activeTab === "finances" && (
            <div className="space-y-6">
              {/* Financial Overview */}
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="text-green-500 font-orbitron text-lg">Financial Overview</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Target Amount</div>
                    <div className="text-green-400 text-xl font-mono">${goal.targetAmount.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Current Balance</div>
                    <div className="text-blue-400 text-xl font-mono">${goal.currentAmount.toLocaleString()}</div>
                  </div>
                  
                  <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                    <div className="text-gray-400 text-xs mb-1">Remaining</div>
                    <div className="text-gray-300 text-xl font-mono">${(goal.targetAmount - goal.currentAmount).toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Financial Progress</span>
                    <span>{Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Transaction List */}
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-blue-500 rounded-full mr-2"></div>
                  <h3 className="text-blue-500 font-orbitron text-lg">Transaction History</h3>
                </div>
                
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
                  <table className="w-full">
                    <thead className="bg-gray-800 text-left text-xs text-gray-300">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Type</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                      {goal.budgetEntries.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-3 text-center text-gray-500">No transactions recorded</td>
                        </tr>
                      ) : (
                        goal.budgetEntries.map(entry => (
                          <tr key={entry.id} className="hover:bg-gray-800/50">
                            <td className="p-3 text-gray-300 text-sm">{entry.date}</td>
                            <td className="p-3 text-white">{entry.description}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                entry.type === 'deposit' 
                                  ? 'bg-green-900/20 text-green-400' 
                                  : 'bg-red-900/20 text-red-400'
                              }`}>
                                {entry.type === 'deposit' ? 'Deposit' : 'Expense'}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono">
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
              
              {/* Add Transaction */}
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-amber-500 rounded-full mr-2"></div>
                  <h3 className="text-amber-500 font-orbitron text-lg">Add Transaction</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-1">Transaction Type</label>
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
          )}
          
          {/* Disciplines Tab */}
          {activeTab === "disciplines" && (
            <div className="space-y-6">
              {/* Daily Check-in */}
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-purple-500 rounded-full mr-2"></div>
                  <h3 className="text-purple-500 font-orbitron text-lg">Daily Practice</h3>
                </div>
                
                <p className="text-gray-300 mb-4">Track your mind, body, and spirit practices to manifest your dream.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-900/30">
                    <h4 className="text-purple-400 font-medium mb-2">Mind Practice</h4>
                    <p className="text-gray-300 text-sm mb-4">{goal.mindFocus}</p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCheckIn.mindCompleted}
                        onChange={(e) => setNewCheckIn({...newCheckIn, mindCompleted: e.target.checked})}
                        className="h-5 w-5 rounded mr-2"
                      />
                      <label className="text-gray-300 text-sm">Completed today</label>
                    </div>
                  </div>
                  
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-900/30">
                    <h4 className="text-green-400 font-medium mb-2">Body Practice</h4>
                    <p className="text-gray-300 text-sm mb-4">{goal.bodyFocus}</p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCheckIn.bodyCompleted}
                        onChange={(e) => setNewCheckIn({...newCheckIn, bodyCompleted: e.target.checked})}
                        className="h-5 w-5 rounded mr-2"
                      />
                      <label className="text-gray-300 text-sm">Completed today</label>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                    <h4 className="text-blue-400 font-medium mb-2">Spirit Practice</h4>
                    <p className="text-gray-300 text-sm mb-4">{goal.spiritFocus}</p>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newCheckIn.spiritCompleted}
                        onChange={(e) => setNewCheckIn({...newCheckIn, spiritCompleted: e.target.checked})}
                        className="h-5 w-5 rounded mr-2"
                      />
                      <label className="text-gray-300 text-sm">Completed today</label>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDailyCheckIn(goal.id)}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded"
                >
                  Log Today's Practice
                </button>
              </div>
            </div>
          )}
          
          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="bg-black/30 rounded-lg border border-gray-700 p-4">
                <div className="flex items-center mb-4">
                  <div className="h-5 w-1 bg-indigo-500 rounded-full mr-2"></div>
                  <h3 className="text-indigo-500 font-orbitron text-lg">Dream Gallery</h3>
                </div>
                
                {goal.mediaGallery.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {goal.mediaGallery.map((media, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                          <img
                            src={media.url}
                            alt={media.name || "Dream Photo"}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3">
                            <p className="text-white font-medium truncate">{media.name}</p>
                            <p className="text-gray-400 text-xs mt-1">Added: {new Date(media.dateAdded).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-black/20 rounded-lg">
                    <div className="text-4xl mb-3">🖼️</div>
                    <p className="text-gray-400 mb-2">No photos added yet</p>
                    <p className="text-gray-500 text-sm">Add photos of your dream to visualize it better</p>
                  </div>
                )}
                
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowPhotoUploadModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded inline-flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Photo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalDetailsModal;