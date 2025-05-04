import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Shirt, Ruler, BookPlus, Edit2, Check, ArrowRight } from 'lucide-react';

// Sample equipment data
const equipmentData = {
  helmetSize: 'Medium (58-59cm)',
  shoeSize: 'US 10.5 / EU 44',
  gloveSize: 'Medium',
  suitSize: 'M/52',
  otherEquipment: [
    { id: 1, name: 'HANS Device', status: 'Available', lastInspection: '2025-03-15' },
    { id: 2, name: 'Fireproof Balaclava', status: 'Available', lastInspection: '2025-03-15' },
    { id: 3, name: 'Racing Boots', status: 'Available', lastInspection: '2025-02-20' },
    { id: 4, name: 'FIA Approved Harness', status: 'Needs Inspection', lastInspection: '2024-05-20' }
  ]
};

const LockerRoomWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [equipment, setEquipment] = useState(equipmentData);
  
  // Edit form state
  const [formData, setFormData] = useState({
    helmetSize: equipment.helmetSize,
    shoeSize: equipment.shoeSize,
    gloveSize: equipment.gloveSize,
    suitSize: equipment.suitSize
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const saveChanges = () => {
    setEquipment({
      ...equipment,
      ...formData
    });
    setIsEditing(false);
  };
  
  return (
    <div className="h-full">
      {/* Widget header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-orbitron text-blue-300 flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          TRACK DAY LOCKER
        </h2>
        
        {isEditing ? (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)} 
              className="text-gray-400 hover:text-gray-300 text-xs px-2 py-1 rounded bg-gray-800/50"
            >
              Cancel
            </button>
            <button 
              onClick={saveChanges} 
              className="text-green-400 hover:text-green-300 text-xs px-2 py-1 rounded bg-green-900/30 flex items-center"
            >
              <Check className="h-3 w-3 mr-1" />
              Save
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEditing(true)} 
            className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 rounded bg-blue-900/30 flex items-center"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            Edit Sizes
          </button>
        )}
      </div>
      
      {/* Sizes section */}
      <div className="bg-black/40 rounded-lg border border-blue-900/30 p-3 mb-4">
        {isEditing ? (
          // Edit form
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Helmet Size</label>
              <input 
                type="text"
                name="helmetSize"
                value={formData.helmetSize}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Shoe Size</label>
              <input 
                type="text"
                name="shoeSize"
                value={formData.shoeSize}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Glove Size</label>
              <select 
                name="gloveSize"
                value={formData.gloveSize}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              >
                <option value="X-Small">X-Small</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="X-Large">X-Large</option>
                <option value="XX-Large">XX-Large</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Suit Size</label>
              <input 
                type="text"
                name="suitSize"
                value={formData.suitSize}
                onChange={handleInputChange}
                className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
              />
            </div>
          </div>
        ) : (
          // Display form
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
                  <Shirt className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Helmet Size</div>
                  <div className="font-medium text-white">{equipment.helmetSize}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
                  <Ruler className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Shoe Size</div>
                  <div className="font-medium text-white">{equipment.shoeSize}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
                  <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Glove Size</div>
                  <div className="font-medium text-white">{equipment.gloveSize}</div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center mr-2">
                  <Shirt className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Racing Suit Size</div>
                  <div className="font-medium text-white">{equipment.suitSize}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Equipment section */}
      <div>
        <h3 className="text-xs text-blue-400 font-medium uppercase mb-2">Track Day Equipment</h3>
        <div className="space-y-2">
          {equipment.otherEquipment.map(item => (
            <div 
              key={item.id} 
              className={`p-2 rounded-md border ${
                item.status === 'Available' 
                  ? 'border-green-900/30 bg-green-950/10' 
                  : 'border-yellow-900/30 bg-yellow-950/10'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-sm text-white">{item.name}</span>
                <span 
                  className={`text-xs ${
                    item.status === 'Available' ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                Last Inspection: {new Date(item.lastInspection).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add new equipment button */}
      <div className="mt-4">
        <button 
          onClick={() => navigate('/equipment-manager')}
          className="w-full py-2 bg-blue-900/30 hover:bg-blue-800/40 rounded-md flex items-center justify-center gap-2 text-blue-400 text-sm"
        >
          <BookPlus className="h-4 w-4" />
          <span>Manage Track Equipment</span>
        </button>
      </div>
      
      {/* View all link */}
      <div className="mt-4 text-right">
        <button 
          onClick={() => navigate('/track-day-checklist')}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-end ml-auto"
        >
          <span>Track Day Checklist</span>
          <ArrowRight className="h-3 w-3 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default LockerRoomWidget;