import React, { useState, useEffect } from 'react';
import { 
  Save, X, Edit, RotateCcw, Check, Sliders, PlusCircle, 
  MinusCircle, Eye, EyeOff, Toggle, Info, ChevronDown, ChevronUp,
  Database, Upload, Download, RefreshCw
} from 'lucide-react';

/**
 * EditableTelemetry Component
 * 
 * A highly customizable and interactive telemetry component that allows users
 * to toggle, edit, and visualize data points with a crew chief-style interface.
 * 
 * @param {Object} props Component props
 * @param {Object} props.data The telemetry data to display/edit
 * @param {Function} props.onSave Callback function when data is saved
 * @param {String} props.title Section title
 * @param {String} props.theme Color theme (default, blue, green, amber, red)
 * @param {Boolean} props.collapsible Whether the section can be collapsed
 * @param {Boolean} props.initiallyCollapsed Whether the section starts collapsed
 * @param {String} props.className Additional CSS classes
 * @param {Boolean} props.readOnly If true, data cannot be edited (but can still be toggled)
 * @param {Object} props.telemetryOptions Dashboard customization options
 */
function EditableTelemetry({
  data = {},
  onSave = () => {},
  title = 'Telemetry Data',
  theme = 'default',
  collapsible = true,
  initiallyCollapsed = false,
  className = '',
  readOnly = false,
  telemetryOptions = {
    allowExport: true,
    allowImport: true,
    showTimestamps: true,
    compactMode: false,
    showChangeHistory: true,
    unitPreference: 'imperial', // 'imperial' or 'metric'
    alertThresholds: {} // e.g. { temperature: { min: 10, max: 90 } }
  }
}) {
  // State for the edited data
  const [editedData, setEditedData] = useState({...data});
  const [originalData, setOriginalData] = useState({...data});
  const [isEditing, setIsEditing] = useState(false);
  const [collapsed, setCollapsed] = useState(initiallyCollapsed);
  const [visibleSections, setVisibleSections] = useState({});
  const [visibleFields, setVisibleFields] = useState({});
  const [editHistory, setEditHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState(telemetryOptions);
  const [showSettings, setShowSettings] = useState(false);
  
  // Update internal state when data changes
  useEffect(() => {
    setEditedData({...data});
    setOriginalData({...data});
    
    // Initialize visibility states if not already set
    const sections = {};
    const fields = {};
    
    // Process data to set initial visibility for sections and fields
    Object.keys(data).forEach(sectionKey => {
      sections[sectionKey] = sections[sectionKey] !== undefined ? sections[sectionKey] : true;
      
      if (typeof data[sectionKey] === 'object' && data[sectionKey] !== null) {
        Object.keys(data[sectionKey]).forEach(fieldKey => {
          const fieldId = `${sectionKey}.${fieldKey}`;
          fields[fieldId] = fields[fieldId] !== undefined ? fields[fieldId] : true;
        });
      }
    });
    
    // Only set these on first load to preserve user preferences
    if (Object.keys(visibleSections).length === 0) {
      setVisibleSections(sections);
    }
    
    if (Object.keys(visibleFields).length === 0) {
      setVisibleFields(fields);
    }
  }, [data]);
  
  // Handle field editing
  const handleChange = (sectionKey, fieldKey, value) => {
    setEditedData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: value
      }
    }));
  };
  
  // Start editing mode
  const handleStartEditing = () => {
    setIsEditing(true);
  };
  
  // Cancel editing and revert changes
  const handleCancelEdit = () => {
    setEditedData({...originalData});
    setIsEditing(false);
  };
  
  // Save changes
  const handleSave = () => {
    const timestamp = new Date().toISOString();
    
    // Log changes to history
    const changes = [];
    Object.keys(editedData).forEach(sectionKey => {
      if (typeof editedData[sectionKey] === 'object' && editedData[sectionKey] !== null) {
        Object.keys(editedData[sectionKey]).forEach(fieldKey => {
          const oldValue = originalData[sectionKey]?.[fieldKey];
          const newValue = editedData[sectionKey][fieldKey];
          
          if (oldValue !== newValue) {
            changes.push({
              section: sectionKey,
              field: fieldKey,
              oldValue,
              newValue,
              timestamp
            });
          }
        });
      }
    });
    
    // Add to history if there are changes
    if (changes.length > 0) {
      setEditHistory([...changes, ...editHistory].slice(0, 100)); // Limit history to 100 entries
    }
    
    // Update original data and exit editing mode
    setOriginalData({...editedData});
    setIsEditing(false);
    
    // Call the parent's save handler
    onSave(editedData, changes);
  };
  
  // Toggle visibility of a section
  const toggleSection = (sectionKey) => {
    setVisibleSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  
  // Toggle visibility of a field
  const toggleField = (sectionKey, fieldKey) => {
    const fieldId = `${sectionKey}.${fieldKey}`;
    setVisibleFields(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };
  
  // Revert a field to its original value
  const revertField = (sectionKey, fieldKey) => {
    setEditedData(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: originalData[sectionKey]?.[fieldKey]
      }
    }));
  };
  
  // Save current data as JSON
  const exportTelemetry = () => {
    const jsonData = JSON.stringify(editedData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-telemetry-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import telemetry from a file
  const importTelemetry = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        setEditedData(importedData);
        setIsEditing(true); // Switch to editing mode to review changes
      } catch (error) {
        console.error('Failed to parse telemetry data:', error);
        // In a real app, show an error message to the user
      }
    };
    reader.readAsText(file);
    
    // Reset the input to allow re-importing the same file
    event.target.value = null;
  };
  
  // Toggle a user preference setting
  const toggleUserPreference = (key) => {
    setUserPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Format a value based on its type and user preferences
  const formatValue = (value, type = 'text') => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'temperature':
        return userPreferences.unitPreference === 'imperial' 
          ? `${value}°F`
          : `${Math.round((value - 32) * 5/9)}°C`;
      case 'distance':
        return userPreferences.unitPreference === 'imperial'
          ? `${value} mi`
          : `${Math.round(value * 1.60934)} km`;
      case 'pressure':
        return userPreferences.unitPreference === 'imperial'
          ? `${value} psi`
          : `${Math.round(value * 6.895)} kPa`;
      case 'volume':
        return userPreferences.unitPreference === 'imperial'
          ? `${value} gal`
          : `${Math.round(value * 3.78541)} L`;
      case 'weight':
        return userPreferences.unitPreference === 'imperial'
          ? `${value} lbs`
          : `${Math.round(value * 0.453592)} kg`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  };
  
  // Get appropriate style classes based on theme
  const getThemeClasses = () => {
    switch (theme) {
      case 'blue':
        return {
          header: 'bg-blue-900/30 border-blue-800',
          headerText: 'text-blue-400',
          content: 'bg-blue-900/10',
          button: 'hover:bg-blue-800/30 border-blue-800/50 text-blue-400',
          activeButton: 'bg-blue-700 border-blue-600 text-white',
          field: 'border-blue-900/30',
          input: 'bg-black/30 border-blue-900/50 focus:border-blue-700'
        };
      case 'green':
        return {
          header: 'bg-green-900/30 border-green-800',
          headerText: 'text-green-400',
          content: 'bg-green-900/10',
          button: 'hover:bg-green-800/30 border-green-800/50 text-green-400',
          activeButton: 'bg-green-700 border-green-600 text-white',
          field: 'border-green-900/30',
          input: 'bg-black/30 border-green-900/50 focus:border-green-700'
        };
      case 'amber':
        return {
          header: 'bg-amber-900/30 border-amber-800',
          headerText: 'text-amber-400',
          content: 'bg-amber-900/10',
          button: 'hover:bg-amber-800/30 border-amber-800/50 text-amber-400',
          activeButton: 'bg-amber-700 border-amber-600 text-white',
          field: 'border-amber-900/30',
          input: 'bg-black/30 border-amber-900/50 focus:border-amber-700'
        };
      case 'red':
        return {
          header: 'bg-red-900/30 border-red-800',
          headerText: 'text-red-400',
          content: 'bg-red-900/10',
          button: 'hover:bg-red-800/30 border-red-800/50 text-red-400',
          activeButton: 'bg-red-700 border-red-600 text-white',
          field: 'border-red-900/30',
          input: 'bg-black/30 border-red-900/50 focus:border-red-700'
        };
      default:
        return {
          header: 'bg-gray-900/30 border-gray-800',
          headerText: 'text-blue-400',
          content: 'bg-gray-900/10',
          button: 'hover:bg-gray-800/30 border-gray-800/50 text-blue-400',
          activeButton: 'bg-gray-700 border-gray-600 text-white',
          field: 'border-gray-900/30',
          input: 'bg-black/30 border-gray-900/50 focus:border-gray-700'
        };
    }
  };
  
  const themeClasses = getThemeClasses();
  
  // If collapsed, just show the header
  if (collapsed) {
    return (
      <div className={`${className} rounded-lg overflow-hidden border border-gray-800`}>
        <div className={`p-4 ${themeClasses.header} flex justify-between items-center`}>
          <h3 className={`font-orbitron font-medium ${themeClasses.headerText} flex items-center`}>
            {title}
          </h3>
          
          <div className="flex items-center space-x-2">
            {collapsible && (
              <button 
                onClick={() => setCollapsed(false)}
                className={`p-1 rounded hover:bg-black/30 ${themeClasses.headerText}`}
                aria-label="Expand section"
              >
                <ChevronDown size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${className} rounded-lg overflow-hidden border border-gray-800`}>
      {/* Header */}
      <div className={`p-4 ${themeClasses.header} flex justify-between items-center`}>
        <h3 className={`font-orbitron font-medium ${themeClasses.headerText} flex items-center`}>
          <Database className="mr-2 h-4 w-4" /> {title}
        </h3>
        
        <div className="flex items-center space-x-2">
          {!readOnly && !isEditing && (
            <button 
              onClick={handleStartEditing}
              className={`p-1 rounded hover:bg-black/30 ${themeClasses.headerText}`}
              aria-label="Edit data"
            >
              <Edit size={16} />
            </button>
          )}
          
          {isEditing && (
            <>
              <button 
                onClick={handleSave}
                className={`p-1 rounded hover:bg-black/30 text-green-400`}
                aria-label="Save changes"
              >
                <Save size={16} />
              </button>
              <button 
                onClick={handleCancelEdit}
                className={`p-1 rounded hover:bg-black/30 text-red-400`}
                aria-label="Cancel editing"
              >
                <X size={16} />
              </button>
            </>
          )}
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded hover:bg-black/30 ${themeClasses.headerText}`}
            aria-label="Telemetry settings"
          >
            <Sliders size={16} />
          </button>
          
          {collapsible && (
            <button 
              onClick={() => setCollapsed(true)}
              className={`p-1 rounded hover:bg-black/30 ${themeClasses.headerText}`}
              aria-label="Collapse section"
            >
              <ChevronUp size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-black/40 border-b border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Display Options</h4>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 text-xs">Compact Mode</label>
                  <button 
                    onClick={() => toggleUserPreference('compactMode')}
                    className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${userPreferences.compactMode ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block w-3 h-3 transform transition-transform rounded-full bg-white ${userPreferences.compactMode ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 text-xs">Show Timestamps</label>
                  <button 
                    onClick={() => toggleUserPreference('showTimestamps')}
                    className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${userPreferences.showTimestamps ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block w-3 h-3 transform transition-transform rounded-full bg-white ${userPreferences.showTimestamps ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 text-xs">Show Change History</label>
                  <button 
                    onClick={() => toggleUserPreference('showChangeHistory')}
                    className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${userPreferences.showChangeHistory ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    <span className={`inline-block w-3 h-3 transform transition-transform rounded-full bg-white ${userPreferences.showChangeHistory ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Unit Preferences</h4>
              
              <div className="flex items-center justify-center space-x-2">
                <button 
                  onClick={() => setUserPreferences(prev => ({ ...prev, unitPreference: 'imperial' }))}
                  className={`px-2 py-1 rounded text-xs ${userPreferences.unitPreference === 'imperial' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400'}`}
                >
                  Imperial (mi, °F)
                </button>
                <button 
                  onClick={() => setUserPreferences(prev => ({ ...prev, unitPreference: 'metric' }))}
                  className={`px-2 py-1 rounded text-xs ${userPreferences.unitPreference === 'metric' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400'}`}
                >
                  Metric (km, °C)
                </button>
              </div>
            </div>
            
            <div className="bg-black/30 p-3 rounded border border-gray-800">
              <h4 className="text-gray-300 text-sm font-medium mb-2">Data Management</h4>
              
              <div className="flex justify-between gap-2">
                {userPreferences.allowExport && (
                  <button 
                    onClick={exportTelemetry}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded flex items-center"
                  >
                    <Download size={12} className="mr-1" /> Export
                  </button>
                )}
                
                {userPreferences.allowImport && (
                  <label className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded flex items-center cursor-pointer">
                    <Upload size={12} className="mr-1" /> Import
                    <input 
                      type="file" 
                      accept=".json,application/json" 
                      onChange={importTelemetry} 
                      className="hidden" 
                    />
                  </label>
                )}
                
                <button 
                  onClick={() => setEditHistory([])}
                  className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2 py-1 rounded flex items-center"
                >
                  <RefreshCw size={12} className="mr-1" /> Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Area */}
      <div className={`p-4 ${themeClasses.content}`}>
        {Object.keys(editedData).map(sectionKey => {
          // Skip non-object sections or null values
          if (typeof editedData[sectionKey] !== 'object' || editedData[sectionKey] === null) {
            return null;
          }
          
          const isVisible = visibleSections[sectionKey];
          
          return (
            <div key={sectionKey} className="mb-4">
              {/* Section Header */}
              <div 
                className="flex justify-between items-center p-2 bg-black/30 rounded cursor-pointer"
                onClick={() => toggleSection(sectionKey)}
              >
                <h4 className="text-white font-medium capitalize">
                  {sectionKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <div className="flex items-center">
                  <button 
                    className="text-gray-400 hover:text-white p-1"
                    aria-label={isVisible ? "Hide section" : "Show section"}
                  >
                    {isVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>
              
              {/* Section Content */}
              {isVisible && (
                <div className={`mt-2 grid ${userPreferences.compactMode ? 'grid-cols-2 md:grid-cols-4 gap-2' : 'grid-cols-1 gap-3'}`}>
                  {Object.keys(editedData[sectionKey]).map(fieldKey => {
                    const fieldId = `${sectionKey}.${fieldKey}`;
                    const isFieldVisible = visibleFields[fieldId];
                    
                    // Don't render hidden fields
                    if (!isFieldVisible) return null;
                    
                    const value = editedData[sectionKey][fieldKey];
                    const originalValue = originalData[sectionKey]?.[fieldKey];
                    const hasChanged = value !== originalValue;
                    
                    // Determine field type for formatting
                    let fieldType = 'text';
                    if (fieldKey.toLowerCase().includes('date') || fieldKey.toLowerCase().includes('time')) {
                      fieldType = 'date';
                    } else if (fieldKey.toLowerCase().includes('temp')) {
                      fieldType = 'temperature';
                    } else if (fieldKey.toLowerCase().includes('miles') || fieldKey.toLowerCase().includes('distance')) {
                      fieldType = 'distance';
                    } else if (fieldKey.toLowerCase().includes('pressure')) {
                      fieldType = 'pressure';
                    } else if (fieldKey.toLowerCase().includes('volume')) {
                      fieldType = 'volume';
                    } else if (fieldKey.toLowerCase().includes('weight')) {
                      fieldType = 'weight';
                    } else if (fieldKey.toLowerCase().includes('percent')) {
                      fieldType = 'percentage';
                    } else if (fieldKey.toLowerCase().includes('price') || fieldKey.toLowerCase().includes('cost')) {
                      fieldType = 'currency';
                    }
                    
                    return (
                      <div 
                        key={fieldId} 
                        className={`${userPreferences.compactMode ? 'p-2' : 'p-3'} bg-black/20 rounded border ${hasChanged ? 'border-yellow-700' : 'border-gray-800'}`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <label className={`text-gray-400 ${userPreferences.compactMode ? 'text-xs' : 'text-sm'}`}>
                            {fieldKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                          
                          <div className="flex items-center">
                            {isEditing && hasChanged && (
                              <button 
                                onClick={() => revertField(sectionKey, fieldKey)}
                                className="text-yellow-500 hover:text-yellow-400 p-1"
                                aria-label="Revert changes"
                              >
                                <RotateCcw size={14} />
                              </button>
                            )}
                            
                            <button 
                              onClick={() => toggleField(sectionKey, fieldKey)}
                              className="text-gray-500 hover:text-gray-300 p-1"
                              aria-label={isFieldVisible ? "Hide field" : "Show field"}
                            >
                              <EyeOff size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Field Content */}
                        <div className={`${hasChanged ? 'bg-yellow-900/20' : ''} rounded`}>
                          {isEditing ? (
                            // Edit mode
                            <div>
                              {/* Different input types based on the value */}
                              {typeof value === 'boolean' ? (
                                <div className="flex items-center">
                                  <button
                                    onClick={() => handleChange(sectionKey, fieldKey, !value)}
                                    className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors ${value ? 'bg-blue-600' : 'bg-gray-700'}`}
                                  >
                                    <span className={`inline-block w-3 h-3 transform transition-transform rounded-full bg-white ${value ? 'translate-x-5' : 'translate-x-1'}`} />
                                  </button>
                                  <span className="ml-2 text-white">{value ? 'Yes' : 'No'}</span>
                                </div>
                              ) : typeof value === 'number' ? (
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => handleChange(sectionKey, fieldKey, parseFloat(e.target.value) || 0)}
                                    className={`w-full bg-black/30 border ${themeClasses.input} rounded p-1 text-white`}
                                  />
                                </div>
                              ) : fieldType === 'date' ? (
                                <input
                                  type="date"
                                  value={typeof value === 'string' ? value.split('T')[0] : ''}
                                  onChange={(e) => handleChange(sectionKey, fieldKey, e.target.value)}
                                  className={`w-full bg-black/30 border ${themeClasses.input} rounded p-1 text-white`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => handleChange(sectionKey, fieldKey, e.target.value)}
                                  className={`w-full bg-black/30 border ${themeClasses.input} rounded p-1 text-white`}
                                />
                              )}
                            </div>
                          ) : (
                            // View mode
                            <div className={`text-white ${userPreferences.compactMode ? 'text-sm' : 'text-base'} font-medium`}>
                              {formatValue(value, fieldType)}
                            </div>
                          )}
                        </div>
                        
                        {/* Display timestamp if enabled */}
                        {userPreferences.showTimestamps && fieldType === 'date' && (
                          <div className="text-gray-500 text-xs mt-1">
                            Updated: {new Date(value).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Change History */}
      {userPreferences.showChangeHistory && editHistory.length > 0 && (
        <div className="p-4 bg-black/30 border-t border-gray-800">
          <h4 className="text-gray-300 text-sm font-medium mb-2">Change History</h4>
          
          <div className="max-h-40 overflow-y-auto">
            {editHistory.slice(0, 5).map((change, index) => (
              <div key={index} className="text-xs p-2 border-b border-gray-800 flex justify-between">
                <div>
                  <span className="text-blue-400">{change.section}.{change.field}</span>: 
                  <span className="text-red-400 line-through ml-1">{formatValue(change.oldValue)}</span> → 
                  <span className="text-green-400 ml-1">{formatValue(change.newValue)}</span>
                </div>
                <div className="text-gray-500">
                  {new Date(change.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
            
            {editHistory.length > 5 && (
              <div className="text-center text-xs text-gray-500 mt-2">
                +{editHistory.length - 5} more changes
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Action Footer */}
      {isEditing && (
        <div className="p-3 bg-black/40 border-t border-gray-800 flex justify-end space-x-2">
          <button 
            onClick={handleCancelEdit}
            className="px-3 py-1 border border-gray-700 rounded text-gray-300 hover:bg-gray-800 text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 border border-blue-700 rounded text-white hover:bg-blue-700 text-sm"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default EditableTelemetry;