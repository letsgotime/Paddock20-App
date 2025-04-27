import React, { useState, useEffect } from 'react';

function TireLifecycleManager() {
  const [tireSets, setTireSets] = useState([
    {
      id: 1,
      brand: 'Michelin',
      model: 'Pilot Sport 4S',
      purchaseDate: '2024-01-15',
      size: '245/40R18',
      treadDepth: 8.5,
      status: 'mounted',
      vehicleId: 1,
      rotationHistory: [
        { date: '2024-03-10', mileage: 31500 }
      ],
      notes: 'Summer performance tires'
    },
    {
      id: 2,
      brand: 'Pirelli',
      model: 'P Zero',
      purchaseDate: '2023-10-05',
      size: '245/35R19',
      treadDepth: 7.2,
      status: 'stored',
      vehicleId: 1,
      rotationHistory: [
        { date: '2023-11-20', mileage: 28700 },
        { date: '2024-01-05', mileage: 30200 }
      ],
      notes: 'Great grip, moderate road noise'
    }
  ]);
  
  const [newTireSet, setNewTireSet] = useState({
    brand: '',
    model: '',
    purchaseDate: '',
    size: '',
    treadDepth: 8.0,
    status: 'stored',
    vehicleId: 1,
    notes: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTireSet({
      ...newTireSet,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing tire set
      setTireSets(tireSets.map(tireSet => 
        tireSet.id === editingId ? { ...newTireSet, id: editingId, rotationHistory: tireSet.rotationHistory } : tireSet
      ));
      setEditingId(null);
    } else {
      // Add new tire set
      const newId = Math.max(0, ...tireSets.map(t => t.id)) + 1;
      setTireSets([...tireSets, { 
        ...newTireSet, 
        id: newId,
        rotationHistory: []
      }]);
    }
    
    // Reset form
    setNewTireSet({
      brand: '',
      model: '',
      purchaseDate: '',
      size: '',
      treadDepth: 8.0,
      status: 'stored',
      vehicleId: 1,
      notes: ''
    });
    setIsFormVisible(false);
  };
  
  const handleEdit = (id) => {
    const tireToEdit = tireSets.find(tire => tire.id === id);
    setNewTireSet({ ...tireToEdit });
    setEditingId(id);
    setIsFormVisible(true);
  };
  
  const handleDelete = (id) => {
    setTireSets(tireSets.filter(tire => tire.id !== id));
  };
  
  const handleAddRotation = (tireId) => {
    const date = prompt('Enter rotation date (YYYY-MM-DD):');
    const mileage = prompt('Enter mileage at rotation:');
    
    if (date && mileage && !isNaN(parseInt(mileage))) {
      setTireSets(tireSets.map(tire => {
        if (tire.id === tireId) {
          return {
            ...tire,
            rotationHistory: [
              ...tire.rotationHistory,
              { date, mileage: parseInt(mileage) }
            ].sort((a, b) => new Date(b.date) - new Date(a.date))
          };
        }
        return tire;
      }));
    }
  };
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-blue-400 font-orbitron text-xl">Tire Lifecycle Manager</h2>
        <button 
          onClick={() => {
            setIsFormVisible(true);
            setEditingId(null);
            setNewTireSet({
              brand: '',
              model: '',
              purchaseDate: '',
              size: '',
              treadDepth: 8.0,
              status: 'stored',
              vehicleId: 1,
              notes: ''
            });
          }}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded text-sm"
        >
          Add Tire Set
        </button>
      </div>
      
      {isFormVisible && (
        <div className="mb-6 bg-black bg-opacity-30 p-4 rounded-lg">
          <h3 className="text-lg text-green-400 mb-4">{editingId ? 'Edit' : 'Add'} Tire Set</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-1">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={newTireSet.brand}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Model</label>
                <input
                  type="text"
                  name="model"
                  value={newTireSet.model}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Size</label>
                <input
                  type="text"
                  name="size"
                  value={newTireSet.size}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={newTireSet.purchaseDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Tread Depth (mm)</label>
                <input
                  type="number"
                  name="treadDepth"
                  value={newTireSet.treadDepth}
                  onChange={handleInputChange}
                  min="0"
                  max="12"
                  step="0.1"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Status</label>
                <select
                  name="status"
                  value={newTireSet.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  required
                >
                  <option value="mounted">Mounted</option>
                  <option value="stored">Stored</option>
                  <option value="disposed">Disposed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Notes</label>
              <textarea
                name="notes"
                value={newTireSet.notes}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                rows="3"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsFormVisible(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
              >
                {editingId ? 'Update' : 'Add'} Tire Set
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="space-y-4">
        {tireSets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No tire sets added yet.</div>
        ) : (
          tireSets.map(tireSet => (
            <div key={tireSet.id} className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {tireSet.brand} {tireSet.model}
                    <span className={`ml-3 inline-block px-2 py-1 text-xs rounded ${
                      tireSet.status === 'mounted' ? 'bg-green-900 text-green-300' :
                      tireSet.status === 'stored' ? 'bg-blue-900 text-blue-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {tireSet.status.charAt(0).toUpperCase() + tireSet.status.slice(1)}
                    </span>
                  </h3>
                  <p className="text-gray-400">{tireSet.size}</p>
                </div>
                <div className="flex mt-2 md:mt-0 space-x-2">
                  <button
                    onClick={() => handleEdit(tireSet.id)}
                    className="bg-blue-900 hover:bg-blue-800 text-blue-300 px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleAddRotation(tireSet.id)}
                    className="bg-green-900 hover:bg-green-800 text-green-300 px-3 py-1 rounded text-sm"
                  >
                    Add Rotation
                  </button>
                  <button
                    onClick={() => handleDelete(tireSet.id)}
                    className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Purchase Date</p>
                  <p className="text-white">{tireSet.purchaseDate}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Tread Depth</p>
                  <p className="text-white">{tireSet.treadDepth} mm</p>
                </div>
              </div>
              
              {tireSet.notes && (
                <div className="mt-3">
                  <p className="text-gray-500 text-sm">Notes</p>
                  <p className="text-gray-300">{tireSet.notes}</p>
                </div>
              )}
              
              {tireSet.rotationHistory && tireSet.rotationHistory.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-500 text-sm mb-2">Rotation History</p>
                  <div className="bg-gray-900 rounded p-2">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500">
                          <th className="px-2 py-1">Date</th>
                          <th className="px-2 py-1">Mileage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tireSet.rotationHistory.map((rotation, idx) => (
                          <tr key={idx} className="border-t border-gray-800">
                            <td className="px-2 py-1 text-gray-300">{rotation.date}</td>
                            <td className="px-2 py-1 text-gray-300">{rotation.mileage} mi</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TireLifecycleManager;