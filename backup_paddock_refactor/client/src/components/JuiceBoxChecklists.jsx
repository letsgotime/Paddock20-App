import React, { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, CheckCircle, Circle, AlertCircle, Info } from 'lucide-react';
import { getUserDisplayName } from '../utils/DataIntegrityVerifier';

/**
 * JuiceBoxChecklists Component
 * Displays curated, real-world tested, gloss-backed, expert-approved
 * detailing and maintenance checklists
 */
const JuiceBoxChecklists = ({ vehicle }) => {
  // State for expanded sections
  const [expandedSections, setExpandedSections] = useState({
    weeklyWash: true,
    monthlyDetail: false,
    quarterlyMaintenance: false,
    seasonalProtection: false
  });
  
  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };
  
  // Sample data for checklists - empty placeholders encouraging interaction
  const checklists = {
    weeklyWash: {
      title: 'Weekly Wash Routine',
      description: 'The proper JuiceBox™ approved weekly wash process for maintaining optimal gloss',
      items: [
        { id: 'w1', text: 'Pre-rinse to remove loose debris', completed: false, important: true },
        { id: 'w2', text: 'Apply pH neutral snow foam', completed: false, important: true },
        { id: 'w3', text: 'Dwell for 5 minutes', completed: false, important: false },
        { id: 'w4', text: 'Rinse completely', completed: false, important: true },
        { id: 'w5', text: 'Two-bucket wash method with grit guards', completed: false, important: true },
        { id: 'w6', text: 'Rinse completely', completed: false, important: true },
        { id: 'w7', text: 'Apply iron remover if needed', completed: false, important: false },
        { id: 'w8', text: 'Perform clay bar treatment if needed', completed: false, important: false },
        { id: 'w9', text: 'Rinse completely', completed: false, important: true },
        { id: 'w10', text: 'Sheet water with open hose', completed: false, important: false },
        { id: 'w11', text: 'Dry with plush microfiber towels', completed: false, important: true },
        { id: 'w12', text: 'Apply quick detailer spray', completed: false, important: false },
        { id: 'w13', text: 'Record in your GoTime Garage Vault', completed: false, important: true }
      ]
    },
    monthlyDetail: {
      title: 'Monthly Detail Process',
      description: 'Complete monthly detailing steps for maintaining paint perfection',
      items: [
        { id: 'm1', text: 'Complete weekly wash process first', completed: false, important: true },
        { id: 'm2', text: 'Inspect paint for contaminants', completed: false, important: true },
        { id: 'm3', text: 'Check paint gloss readings', completed: false, important: true },
        { id: 'm4', text: 'Apply paint sealant if needed', completed: false, important: false },
        { id: 'm5', text: 'Clean and dress all exterior trim', completed: false, important: false },
        { id: 'm6', text: 'Apply tire dressing', completed: false, important: false },
        { id: 'm7', text: 'Clean and protect exterior glass', completed: false, important: true },
        { id: 'm8', text: 'Vacuum and clean interior', completed: false, important: true },
        { id: 'm9', text: 'Apply leather conditioner if applicable', completed: false, important: false },
        { id: 'm10', text: 'Clean interior glass', completed: false, important: true },
        { id: 'm11', text: 'Apply interior protectant', completed: false, important: false },
        { id: 'm12', text: 'Record in your GoTime Garage Vault', completed: false, important: true }
      ]
    },
    quarterlyMaintenance: {
      title: 'Quarterly Maintenance',
      description: 'Deep cleaning and maintenance items to perform every three months',
      items: [
        { id: 'q1', text: 'Complete monthly detail process first', completed: false, important: true },
        { id: 'q2', text: 'Deep clean wheels with iron remover', completed: false, important: true },
        { id: 'q3', text: 'Paint correction as needed', completed: false, important: false },
        { id: 'q4', text: 'Apply ceramic coating booster', completed: false, important: false },
        { id: 'q5', text: 'Clean and condition interior leather', completed: false, important: true },
        { id: 'q6', text: 'Treat interior fabrics with protectant', completed: false, important: false },
        { id: 'q7', text: 'Clean air vents and hard-to-reach areas', completed: false, important: false },
        { id: 'q8', text: 'Apply trim restorer', completed: false, important: false },
        { id: 'q9', text: 'Service wiper blades', completed: false, important: true },
        { id: 'q10', text: 'Full engine bay detail', completed: false, important: false },
        { id: 'q11', text: 'Clean and protect undercarriage', completed: false, important: false },
        { id: 'q12', text: 'Record in your GoTime Garage Vault', completed: false, important: true }
      ]
    },
    seasonalProtection: {
      title: 'Seasonal Protection',
      description: 'Protect your vehicle through changing seasons',
      items: [
        { id: 's1', text: 'Complete quarterly maintenance first', completed: false, important: true },
        { id: 's2', text: 'Apply long-term paint protection', completed: false, important: true },
        { id: 's3', text: 'Apply glass hydrophobic coating', completed: false, important: true },
        { id: 's4', text: 'Seal all exterior trim', completed: false, important: false },
        { id: 's5', text: 'Apply wheel ceramic coating', completed: false, important: false },
        { id: 's6', text: 'Protect all interior surfaces', completed: false, important: true },
        { id: 's7', text: 'Full undercarriage protection', completed: false, important: false },
        { id: 's8', text: 'Engine bay protection', completed: false, important: false },
        { id: 's9', text: 'Check gloss readings and document', completed: false, important: true },
        { id: 's10', text: 'Plan next season\'s maintenance', completed: false, important: true },
        { id: 's11', text: 'Record in your GoTime Garage Vault', completed: false, important: true }
      ]
    }
  };
  
  // Calculate completion percentages (0% for empty placeholders)
  const calculateCompletion = (items) => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };
  
  // Render a checklist section
  const renderChecklist = (checklist, key) => {
    const completionPercentage = calculateCompletion(checklist.items);
    
    return (
      <div className="mb-6 bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div 
          onClick={() => toggleSection(key)}
          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-800/30"
        >
          <div>
            <h3 className="text-blue-400 font-semibold">{checklist.title}</h3>
            <p className="text-gray-400 text-sm">{checklist.description}</p>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <div className="text-sm text-gray-400">Completion</div>
              <div className="flex items-center">
                <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden mr-2">
                  <div 
                    className={`h-full rounded-full ${
                      completionPercentage === 100 ? 'bg-green-500' : 
                      completionPercentage >= 75 ? 'bg-blue-500' : 
                      completionPercentage >= 50 ? 'bg-yellow-500' : 
                      completionPercentage > 0 ? 'bg-orange-500' : 'bg-gray-600'
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-300">{completionPercentage}%</span>
              </div>
            </div>
            {expandedSections[key] ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
        
        {/* Checklist items */}
        {expandedSections[key] && (
          <div className="px-4 pb-4">
            <div className="space-y-2 mt-2">
              {checklist.items.map(item => (
                <div 
                  key={item.id}
                  className={`flex items-start p-3 rounded-lg ${
                    item.completed ? 'bg-green-900/10 border border-green-900/30' : 'bg-gray-800/50 border border-gray-700/50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className={`text-sm ${item.completed ? 'text-gray-300 line-through' : 'text-white'}`}>
                      {item.text}
                      {item.important && (
                        <span className="ml-2 text-xs bg-yellow-900/30 text-yellow-500 px-2 py-0.5 rounded">
                          Important
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button 
                      className={`p-1 rounded-full ${
                        item.completed 
                          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                          : 'text-green-500 hover:bg-green-900/20'
                      }`}
                      onClick={() => {
                        // This would update the item's completion status in a real implementation
                        console.log(`Toggle completion for ${item.id}: ${!item.completed}`);
                      }}
                    >
                      {item.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </button>
                    
                    <button className="p-1 rounded-full text-blue-400 hover:bg-blue-900/20 ml-1">
                      <Info className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm inline-flex items-center"
                onClick={() => {
                  // This would save the checklist in a real implementation
                  console.log(`Save checklist: ${key}`);
                }}
              >
                <Check className="h-4 w-4 mr-2" />
                Complete {checklist.title}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="juice-box-checklists">
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(checklists).map(([key, checklist]) => 
          renderChecklist(checklist, key)
        )}
      </div>
      
      <div className="text-center mt-6">
        <p className="text-gray-400 text-sm mb-4">
          JuiceBox™ Checklists are curated by GoTime Motorsports experts for maximum gloss and protection
        </p>
        <div className="inline-flex items-center space-x-2 text-sm">
          <button className="text-blue-400 hover:text-blue-300 flex items-center">
            <Info className="h-4 w-4 mr-1" />
            About JuiceBox™
          </button>
          <span className="text-gray-600">|</span>
          <button className="text-blue-400 hover:text-blue-300">View All Guides</button>
          <span className="text-gray-600">|</span>
          <button className="text-blue-400 hover:text-blue-300">Print Checklist</button>
        </div>
      </div>
    </div>
  );
};

export default JuiceBoxChecklists;