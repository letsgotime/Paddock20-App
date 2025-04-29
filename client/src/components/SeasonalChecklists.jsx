import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CloudSnow, Sun, Wind, Leaf, 
  Check, Square, CheckSquare, ChevronDown, ChevronUp, 
  Save, Download, Upload, Info, Plus, Trash2, Edit, 
  Clipboard, FileDown, X, Lock, Unlock
} from 'lucide-react';

/**
 * SeasonalChecklists Component
 * 
 * A comprehensive, season-specific maintenance and care checklist system
 * for vehicle maintenance and detailing.
 */
const SeasonalChecklists = ({ vehicle, onSave, onExport }) => {
  // Component state
  const [activeSeason, setActiveSeason] = useState('spring');
  const [expandedSections, setExpandedSections] = useState({});
  const [completedItems, setCompletedItems] = useState({});
  const [userNotes, setUserNotes] = useState({});
  const [editingNote, setEditingNote] = useState(null);
  const [currentNote, setCurrentNote] = useState('');
  const [customizationMode, setCustomizationMode] = useState(false);
  const [editableChecklists, setEditableChecklists] = useState(null);
  const [localLocation, setLocalLocation] = useState('');
  const [hemisphereMode, setHemisphereMode] = useState('northern');
  
  // Seasonal data
  const SEASONS = [
    { id: 'spring', name: 'Spring', icon: <Leaf className="h-5 w-5 text-green-400" /> },
    { id: 'summer', name: 'Summer', icon: <Sun className="h-5 w-5 text-yellow-400" /> },
    { id: 'fall', name: 'Fall', icon: <Wind className="h-5 w-5 text-orange-400" /> },
    { id: 'winter', name: 'Winter', icon: <CloudSnow className="h-5 w-5 text-blue-400" /> }
  ];
  
  // Initial checklist data
  const initialChecklists = {
    spring: {
      name: 'Spring Checklist',
      description: 'Prepare your vehicle for warmer weather after winter',
      sections: [
        {
          name: 'Exterior Spring Readiness',
          items: [
            { id: 'spring-ext-1', text: 'Wash thoroughly including undercarriage', priority: 'high', recommended: true },
            { id: 'spring-ext-2', text: 'Check for winter damage to paint (chips, scratches)', priority: 'medium', recommended: true },
            { id: 'spring-ext-3', text: 'Inspect windshield for damage from winter debris', priority: 'high', recommended: true },
            { id: 'spring-ext-4', text: 'Clean and restore trim (salt damage)', priority: 'medium', recommended: true },
            { id: 'spring-ext-5', text: 'Apply new wax or ceramic coat protectant', priority: 'high', recommended: true },
            { id: 'spring-ext-6', text: 'Clean and lubricate door hinges & locks', priority: 'low', recommended: false },
            { id: 'spring-ext-7', text: 'Inspect and clean exterior lighting fixtures', priority: 'medium', recommended: true },
          ]
        },
        {
          name: 'Mechanical Spring Maintenance',
          items: [
            { id: 'spring-mech-1', text: 'Check and replace wiper blades (winter damage)', priority: 'high', recommended: true },
            { id: 'spring-mech-2', text: 'Rotate tires and check pressures (adjust for temp change)', priority: 'high', recommended: true },
            { id: 'spring-mech-3', text: 'Inspect suspension components for winter damage', priority: 'medium', recommended: true },
            { id: 'spring-mech-4', text: 'Check brakes for winter corrosion', priority: 'high', recommended: true },
            { id: 'spring-mech-5', text: 'Inspect and clean battery connections', priority: 'medium', recommended: true },
            { id: 'spring-mech-6', text: 'Change oil and filter (if winter weight was used)', priority: 'high', recommended: true },
            { id: 'spring-mech-7', text: 'Inspect and replace cabin air filter', priority: 'medium', recommended: true },
            { id: 'spring-mech-8', text: 'Check cooling system operation for summer readiness', priority: 'high', recommended: true },
          ]
        },
        {
          name: 'Interior Spring Care',
          items: [
            { id: 'spring-int-1', text: 'Deep clean floor mats (salt and winter grime)', priority: 'high', recommended: true },
            { id: 'spring-int-2', text: 'Vacuum and clean interior thoroughly', priority: 'medium', recommended: true },
            { id: 'spring-int-3', text: 'Treat leather/upholstery (winter dryness repair)', priority: 'medium', recommended: true },
            { id: 'spring-int-4', text: 'Check for moisture and mildew issues', priority: 'high', recommended: true },
            { id: 'spring-int-5', text: 'Clean and treat dashboard (UV protection)', priority: 'medium', recommended: true },
            { id: 'spring-int-6', text: 'Replace heavy winter floor mats with all-season', priority: 'low', recommended: false },
          ]
        }
      ]
    },
    summer: {
      name: 'Summer Checklist',
      description: 'Maintain your vehicle during the hot summer months',
      sections: [
        {
          name: 'Exterior Summer Protection',
          items: [
            { id: 'summer-ext-1', text: 'Apply paint protection with UV inhibitors', priority: 'high', recommended: true },
            { id: 'summer-ext-2', text: 'Check window tint integrity for UV protection', priority: 'medium', recommended: false },
            { id: 'summer-ext-3', text: 'Use hydrophobic windshield treatment for storms', priority: 'medium', recommended: true },
            { id: 'summer-ext-4', text: 'Protect trim and rubber from UV exposure', priority: 'medium', recommended: true },
            { id: 'summer-ext-5', text: 'Check for paint blistering or clear coat issues', priority: 'high', recommended: true },
            { id: 'summer-ext-6', text: 'Apply tire protectant (UV resistance)', priority: 'medium', recommended: true },
          ]
        },
        {
          name: 'Mechanical Summer Readiness',
          items: [
            { id: 'summer-mech-1', text: 'Check cooling system (coolant level & condition)', priority: 'high', recommended: true },
            { id: 'summer-mech-2', text: 'Inspect radiator and hoses for leaks', priority: 'high', recommended: true },
            { id: 'summer-mech-3', text: 'Test A/C system performance', priority: 'high', recommended: true },
            { id: 'summer-mech-4', text: 'Check brake fluid (heat degradation)', priority: 'high', recommended: true },
            { id: 'summer-mech-5', text: 'Test battery (heat affects performance)', priority: 'medium', recommended: true },
            { id: 'summer-mech-6', text: 'Check tire pressure frequently (heat expansion)', priority: 'high', recommended: true },
            { id: 'summer-mech-7', text: 'Inspect drive belts and hoses (heat stress)', priority: 'medium', recommended: true },
            { id: 'summer-mech-8', text: 'Change to summer-weight oil if needed', priority: 'medium', recommended: false },
          ]
        },
        {
          name: 'Interior Summer Care',
          items: [
            { id: 'summer-int-1', text: 'Use sunshades when parked outside', priority: 'high', recommended: true },
            { id: 'summer-int-2', text: 'Apply UV protectant to dashboard and trim', priority: 'high', recommended: true },
            { id: 'summer-int-3', text: 'Check window seals to maximize A/C efficiency', priority: 'medium', recommended: true },
            { id: 'summer-int-4', text: 'Clean and protect leather from heat damage', priority: 'high', recommended: true },
            { id: 'summer-int-5', text: 'Use car cover if parked outside for extended periods', priority: 'medium', recommended: false },
          ]
        }
      ]
    },
    fall: {
      name: 'Fall Checklist',
      description: 'Prepare your vehicle for the upcoming winter season',
      sections: [
        {
          name: 'Exterior Fall Preparation',
          items: [
            { id: 'fall-ext-1', text: 'Apply heavy duty wax or paint sealant before winter', priority: 'high', recommended: true },
            { id: 'fall-ext-2', text: 'Treat rubber trim with protectant for winter', priority: 'high', recommended: true },
            { id: 'fall-ext-3', text: 'Clean and seal undercarriage', priority: 'high', recommended: true },
            { id: 'fall-ext-4', text: 'Apply anti-rust spray to vulnerable areas', priority: 'high', recommended: true },
            { id: 'fall-ext-5', text: 'Check exterior lights for dark winter driving', priority: 'high', recommended: true },
            { id: 'fall-ext-6', text: 'Apply rain repellent to windshield and windows', priority: 'medium', recommended: true },
          ]
        },
        {
          name: 'Mechanical Fall Readiness',
          items: [
            { id: 'fall-mech-1', text: 'Check heater and defroster operation', priority: 'high', recommended: true },
            { id: 'fall-mech-2', text: 'Test battery (cold affects performance)', priority: 'high', recommended: true },
            { id: 'fall-mech-3', text: 'Check antifreeze protection level and condition', priority: 'high', recommended: true },
            { id: 'fall-mech-4', text: 'Consider winter tire installation', priority: 'high', recommended: true },
            { id: 'fall-mech-5', text: 'Change to winter-weight oil if needed', priority: 'medium', recommended: true },
            { id: 'fall-mech-6', text: 'Check all lights and replace any burnt out bulbs', priority: 'high', recommended: true },
            { id: 'fall-mech-7', text: 'Check wiper blades, replace if needed', priority: 'high', recommended: true },
            { id: 'fall-mech-8', text: 'Test brake system for winter reliability', priority: 'high', recommended: true },
          ]
        },
        {
          name: 'Interior Fall Preparation',
          items: [
            { id: 'fall-int-1', text: 'Replace floor mats with winter mats', priority: 'medium', recommended: true },
            { id: 'fall-int-2', text: 'Check door and window seals for drafts', priority: 'medium', recommended: true },
            { id: 'fall-int-3', text: 'Create winter emergency kit', priority: 'high', recommended: true },
            { id: 'fall-int-4', text: 'Apply anti-fog treatment to interior glass', priority: 'medium', recommended: true },
            { id: 'fall-int-5', text: 'Clean and treat leather/upholstery before dry winter air', priority: 'medium', recommended: true },
          ]
        }
      ]
    },
    winter: {
      name: 'Winter Checklist',
      description: 'Maintain your vehicle during the cold, harsh winter months',
      sections: [
        {
          name: 'Exterior Winter Protection',
          items: [
            { id: 'winter-ext-1', text: 'Wash frequently to remove road salt', priority: 'high', recommended: true },
            { id: 'winter-ext-2', text: 'Use pre-wash spray for touchless cleaning when too cold', priority: 'high', recommended: true },
            { id: 'winter-ext-3', text: 'Apply spray wax between washes for additional protection', priority: 'medium', recommended: true },
            { id: 'winter-ext-4', text: 'Keep door locks de-iced with lock lubricant', priority: 'medium', recommended: true },
            { id: 'winter-ext-5', text: 'Clear snow from all lights before driving', priority: 'high', recommended: true },
            { id: 'winter-ext-6', text: 'Check wipers aren\'t frozen to windshield before operation', priority: 'high', recommended: true },
          ]
        },
        {
          name: 'Mechanical Winter Maintenance',
          items: [
            { id: 'winter-mech-1', text: 'Keep fuel tank at least half full to prevent fuel line freezing', priority: 'high', recommended: true },
            { id: 'winter-mech-2', text: 'Check tire pressure weekly (cold decreases pressure)', priority: 'high', recommended: true },
            { id: 'winter-mech-3', text: 'Use winter-grade windshield washer fluid', priority: 'high', recommended: true },
            { id: 'winter-mech-4', text: 'Allow extra warm-up time before driving in extreme cold', priority: 'medium', recommended: true },
            { id: 'winter-mech-5', text: 'Check battery connections for corrosion', priority: 'high', recommended: true },
            { id: 'winter-mech-6', text: 'Test block heater if equipped', priority: 'medium', recommended: false },
            { id: 'winter-mech-7', text: 'Monitor exhaust pipe - keep clear of snow when parked', priority: 'high', recommended: true },
          ]
        },
        {
          name: 'Interior Winter Care',
          items: [
            { id: 'winter-int-1', text: 'Use rubber floor mats to contain melted snow', priority: 'high', recommended: true },
            { id: 'winter-int-2', text: 'Run recirculation mode minimally to reduce condensation', priority: 'medium', recommended: true },
            { id: 'winter-int-3', text: 'Keep emergency winter kit accessible', priority: 'high', recommended: true },
            { id: 'winter-int-4', text: 'Use a windshield cover to prevent overnight freezing', priority: 'medium', recommended: false },
            { id: 'winter-int-5', text: 'Clean interior windows frequently to prevent fogging', priority: 'high', recommended: true },
            { id: 'winter-int-6', text: 'Keep interior dry with moisture absorbers if needed', priority: 'medium', recommended: true },
          ]
        }
      ]
    }
  };
  
  // Initialize editable checklist data from the initial structure
  useEffect(() => {
    if (!editableChecklists) {
      setEditableChecklists(JSON.parse(JSON.stringify(initialChecklists)));
    }
    
    // Expand the first section of the active season by default
    if (editableChecklists && editableChecklists[activeSeason]?.sections[0]) {
      setExpandedSections(prev => ({
        ...prev,
        [`${activeSeason}-${0}`]: true
      }));
    }
    
    // Auto-detect the appropriate season based on the current date and hemisphere
    const detectCurrentSeason = () => {
      const date = new Date();
      const month = date.getMonth(); // 0-based: 0 is January, 11 is December
      
      // Northern hemisphere seasons
      if (hemisphereMode === 'northern') {
        if (month >= 2 && month <= 4) return 'spring';      // Mar-May
        if (month >= 5 && month <= 7) return 'summer';      // Jun-Aug
        if (month >= 8 && month <= 10) return 'fall';       // Sep-Nov
        return 'winter';                                    // Dec-Feb
      } 
      // Southern hemisphere seasons (reversed)
      else {
        if (month >= 2 && month <= 4) return 'fall';        // Mar-May
        if (month >= 5 && month <= 7) return 'winter';      // Jun-Aug
        if (month >= 8 && month <= 10) return 'spring';     // Sep-Nov
        return 'summer';                                    // Dec-Feb
      }
    };
    
    setActiveSeason(detectCurrentSeason());
  }, [hemisphereMode]);
  
  // Toggle section expansion
  const toggleSection = (seasonId, sectionIndex) => {
    const sectionKey = `${seasonId}-${sectionIndex}`;
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  
  // Toggle item completion
  const toggleItemCompletion = (itemId) => {
    setCompletedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
    
    // Auto-save after toggling if onSave function provided
    if (onSave) {
      const updatedCompletedItems = {
        ...completedItems,
        [itemId]: !completedItems[itemId]
      };
      
      onSave({
        completedItems: updatedCompletedItems,
        notes: userNotes,
        vehicle
      });
    }
  };
  
  // Start editing a note
  const handleStartEditNote = (itemId) => {
    setEditingNote(itemId);
    setCurrentNote(userNotes[itemId] || '');
  };
  
  // Save note changes
  const handleSaveNote = () => {
    if (!editingNote) return;
    
    const updatedNotes = {
      ...userNotes,
      [editingNote]: currentNote
    };
    
    setUserNotes(updatedNotes);
    setEditingNote(null);
    setCurrentNote('');
    
    // Auto-save after editing if onSave function provided
    if (onSave) {
      onSave({
        completedItems,
        notes: updatedNotes,
        vehicle
      });
    }
  };
  
  // Add a new custom item to a checklist section
  const addCustomItem = (seasonId, sectionIndex) => {
    if (!customizationMode) return;
    
    const updatedChecklists = { ...editableChecklists };
    const newItem = {
      id: `custom-${seasonId}-${sectionIndex}-${Date.now()}`,
      text: 'New custom item',
      priority: 'medium',
      recommended: false,
      custom: true
    };
    
    updatedChecklists[seasonId].sections[sectionIndex].items.push(newItem);
    setEditableChecklists(updatedChecklists);
  };
  
  // Remove a custom item
  const removeCustomItem = (seasonId, sectionIndex, itemId) => {
    if (!customizationMode) return;
    
    const updatedChecklists = { ...editableChecklists };
    updatedChecklists[seasonId].sections[sectionIndex].items = 
      updatedChecklists[seasonId].sections[sectionIndex].items.filter(item => item.id !== itemId);
    
    setEditableChecklists(updatedChecklists);
  };
  
  // Edit a checklist item
  const editItem = (seasonId, sectionIndex, itemId, field, value) => {
    if (!customizationMode) return;
    
    const updatedChecklists = { ...editableChecklists };
    const sectionItems = updatedChecklists[seasonId].sections[sectionIndex].items;
    const itemIndex = sectionItems.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      updatedChecklists[seasonId].sections[sectionIndex].items[itemIndex][field] = value;
      setEditableChecklists(updatedChecklists);
    }
  };
  
  // Add a new custom section to a season
  const addCustomSection = (seasonId) => {
    if (!customizationMode) return;
    
    const updatedChecklists = { ...editableChecklists };
    const newSection = {
      name: 'New Custom Section',
      items: [
        {
          id: `custom-${seasonId}-new-section-${Date.now()}`,
          text: 'New custom item',
          priority: 'medium',
          recommended: false,
          custom: true
        }
      ]
    };
    
    updatedChecklists[seasonId].sections.push(newSection);
    setEditableChecklists(updatedChecklists);
    
    // Expand the newly added section
    const newSectionIndex = updatedChecklists[seasonId].sections.length - 1;
    setExpandedSections(prev => ({
      ...prev,
      [`${seasonId}-${newSectionIndex}`]: true
    }));
  };
  
  // Calculate completion percentage for a season
  const calculateCompletion = (seasonId) => {
    if (!editableChecklists || !editableChecklists[seasonId]) return 0;
    
    let totalItems = 0;
    let completedCount = 0;
    
    editableChecklists[seasonId].sections.forEach(section => {
      section.items.forEach(item => {
        totalItems++;
        if (completedItems[item.id]) {
          completedCount++;
        }
      });
    });
    
    return totalItems === 0 ? 0 : Math.round((completedCount / totalItems) * 100);
  };
  
  // Export checklist to PDF
  const handleExport = (format = 'pdf') => {
    if (!onExport) return;
    
    const exportData = {
      season: activeSeason,
      checklist: editableChecklists[activeSeason],
      completedItems,
      notes: userNotes,
      vehicle,
      format
    };
    
    onExport(exportData);
  };
  
  // Save all changes
  const handleSaveAll = () => {
    if (!onSave) return;
    
    onSave({
      completedItems,
      notes: userNotes,
      customChecklists: editableChecklists,
      vehicle
    });
  };
  
  // Toggle between Northern and Southern hemispheres
  const toggleHemisphere = () => {
    setHemisphereMode(prev => prev === 'northern' ? 'southern' : 'northern');
  };
  
  // Render seasonal tabs
  const renderSeasonTabs = () => {
    return (
      <div className="flex border-b border-gray-800 mb-6 overflow-x-auto scrollbar-hide">
        {SEASONS.map(season => (
          <button
            key={season.id}
            className={`px-5 py-3 flex items-center whitespace-nowrap ${
              activeSeason === season.id
                ? 'text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => setActiveSeason(season.id)}
          >
            <span className="mr-2">{season.icon}</span>
            <span>{season.name}</span>
            {calculateCompletion(season.id) > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-gray-800">
                {calculateCompletion(season.id)}%
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };
  
  // Render priority badge
  const renderPriorityBadge = (priority) => {
    let color;
    switch (priority) {
      case 'high':
        color = 'text-red-500 bg-red-500/20';
        break;
      case 'medium':
        color = 'text-yellow-500 bg-yellow-500/20';
        break;
      case 'low':
        color = 'text-blue-500 bg-blue-500/20';
        break;
      default:
        color = 'text-gray-500 bg-gray-500/20';
    }
    
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${color}`}>
        {priority}
      </span>
    );
  };
  
  // Render checklist sections
  const renderSections = () => {
    if (!editableChecklists || !editableChecklists[activeSeason]) {
      return (
        <div className="p-8 text-center text-gray-400">
          No checklist available for this season
        </div>
      );
    }
    
    const seasonData = editableChecklists[activeSeason];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-orbitron text-blue-400">{seasonData.name}</h2>
            <p className="text-sm text-gray-400 mt-1">{seasonData.description}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleHemisphere}
              className="text-sm text-gray-400 hover:text-white flex items-center"
              title={`Switch to ${hemisphereMode === 'northern' ? 'Southern' : 'Northern'} Hemisphere`}
            >
              <Globe className="h-4 w-4 mr-1" />
              {hemisphereMode === 'northern' ? 'N' : 'S'} Hemisphere
            </button>
            
            <div className="flex items-center border-l border-gray-700 pl-3">
              <button
                onClick={() => setCustomizationMode(!customizationMode)}
                className={`p-1.5 rounded-md ${customizationMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                title={customizationMode ? "Exit customization mode" : "Enter customization mode"}
              >
                {customizationMode ? <Lock size={16} /> : <Unlock size={16} />}
              </button>
              
              <button
                onClick={() => handleExport('pdf')}
                className="p-1.5 rounded-md text-gray-400 hover:text-white"
                title="Export to PDF"
              >
                <FileDown size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {seasonData.sections.map((section, sectionIndex) => (
          <div key={`${activeSeason}-section-${sectionIndex}`} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection(activeSeason, sectionIndex)}
            >
              <h3 className="text-lg font-medium text-white">
                {section.name}
              </h3>
              <div className="flex items-center">
                {expandedSections[`${activeSeason}-${sectionIndex}`] ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedSections[`${activeSeason}-${sectionIndex}`] && (
              <div className="p-4 border-t border-gray-800">
                <ul className="space-y-4">
                  {section.items.map(item => (
                    <li 
                      key={item.id} 
                      className={`group flex items-start p-3 rounded-md ${
                        completedItems[item.id] ? 'bg-green-900/20' : 'bg-gray-800/50'
                      }`}
                    >
                      <button
                        className="mt-0.5 mr-3 flex-shrink-0"
                        onClick={() => toggleItemCompletion(item.id)}
                        aria-label={completedItems[item.id] ? "Mark as incomplete" : "Mark as complete"}
                      >
                        {completedItems[item.id] ? (
                          <CheckSquare className="h-5 w-5 text-green-500" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-grow min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={`font-medium ${completedItems[item.id] ? 'text-gray-400 line-through' : 'text-white'}`}>
                            {customizationMode ? (
                              <input
                                type="text"
                                value={item.text}
                                onChange={(e) => editItem(activeSeason, sectionIndex, item.id, 'text', e.target.value)}
                                className="bg-transparent border-b border-gray-700 focus:border-blue-500 outline-none px-1 w-full"
                              />
                            ) : (
                              item.text
                            )}
                          </span>
                          
                          {customizationMode ? (
                            <select 
                              value={item.priority}
                              onChange={(e) => editItem(activeSeason, sectionIndex, item.id, 'priority', e.target.value)}
                              className="bg-gray-800 text-xs rounded px-2 py-1 border border-gray-700"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          ) : (
                            renderPriorityBadge(item.priority)
                          )}
                          
                          {item.recommended && !customizationMode && (
                            <span className="px-2 py-0.5 text-xs rounded-full text-blue-400 bg-blue-500/20">
                              Recommended
                            </span>
                          )}
                          
                          {customizationMode && (
                            <div className="flex items-center ml-auto">
                              <label className="flex items-center text-xs text-gray-400">
                                <input
                                  type="checkbox"
                                  checked={item.recommended}
                                  onChange={(e) => editItem(activeSeason, sectionIndex, item.id, 'recommended', e.target.checked)}
                                  className="mr-1"
                                />
                                Recommended
                              </label>
                              
                              {(item.custom || customizationMode) && (
                                <button
                                  onClick={() => removeCustomItem(activeSeason, sectionIndex, item.id)}
                                  className="ml-2 text-red-500 hover:text-red-400"
                                  aria-label="Remove item"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Notes section */}
                        {editingNote === item.id ? (
                          <div className="mt-2">
                            <textarea
                              value={currentNote}
                              onChange={(e) => setCurrentNote(e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-md text-white"
                              placeholder="Add your notes here..."
                              rows={2}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => setEditingNote(null)}
                                className="px-2 py-1 text-xs text-gray-400 hover:text-white mr-2"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveNote}
                                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {userNotes[item.id] ? (
                              <div className="mt-2 text-sm bg-gray-800 rounded-md p-2 text-gray-300">
                                <div className="flex justify-between items-start">
                                  <div className="flex-grow">{userNotes[item.id]}</div>
                                  <button
                                    onClick={() => handleStartEditNote(item.id)}
                                    className="ml-2 text-gray-500 hover:text-white flex-shrink-0"
                                  >
                                    <Edit size={14} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleStartEditNote(item.id)}
                                className="mt-1 text-xs text-gray-500 hover:text-white flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit size={12} className="mr-1" />
                                Add notes
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                  
                  {/* Add custom item button (in customization mode) */}
                  {customizationMode && (
                    <li>
                      <button
                        onClick={() => addCustomItem(activeSeason, sectionIndex)}
                        className="w-full p-2 border border-dashed border-gray-700 rounded-md text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center"
                      >
                        <Plus size={16} className="mr-2" />
                        Add Custom Item
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        ))}
        
        {/* Add custom section button (in customization mode) */}
        {customizationMode && (
          <button
            onClick={() => addCustomSection(activeSeason)}
            className="w-full p-3 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-500 flex items-center justify-center"
          >
            <Plus size={18} className="mr-2" />
            Add Custom Section
          </button>
        )}
        
        {/* Save changes button (in customization mode) */}
        {customizationMode && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md flex items-center"
            >
              <Save size={16} className="mr-2" />
              Save All Changes
            </button>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="seasonal-checklists text-white">
      {renderSeasonTabs()}
      {renderSections()}
    </div>
  );
};

// Missing Globe icon component (not included in lucide-react import)
const Globe = ({ className, size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export default SeasonalChecklists;