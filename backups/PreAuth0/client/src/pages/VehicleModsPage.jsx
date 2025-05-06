import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '../services/supabaseClient';

function VehicleModsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [mods, setMods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMod, setNewMod] = useState({ name: '', description: '', date_installed: '', cost: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editingMod, setEditingMod] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch vehicle and mods data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch vehicle details
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('Vehicles')
          .select('*')
          .eq('id', id)
          .single();

        if (vehicleError) throw vehicleError;
        setVehicle(vehicleData);

        // Fetch mods for this vehicle
        const { data: modsData, error: modsError } = await supabase
          .from('VehicleMods')
          .select('*')
          .eq('vehicle_id', id);

        if (modsError) throw modsError;
        
        console.log('Retrieved mods data:', modsData);
        
        // Sort manually since we're using a mock client
        const sortedMods = modsData ? [...modsData].sort((a, b) => {
          if (!a.date_installed) return 1;
          if (!b.date_installed) return -1;
          return new Date(b.date_installed) - new Date(a.date_installed);
        }) : [];
        
        console.log('Sorted mods data:', sortedMods);
        setMods(sortedMods);
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Failed to load vehicle data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchData();
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isEditing) {
      setEditingMod(prev => ({ ...prev, [name]: value }));
    } else {
      setNewMod(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle edit mod
  const handleEditMod = (mod) => {
    setEditingMod(mod);
    setIsEditing(true);
    setNewMod({
      name: mod.name,
      description: mod.description,
      date_installed: mod.date_installed || '',
      cost: mod.cost || ''
    });
    
    // Scroll to form
    document.getElementById("addModHeading").scrollIntoView({ behavior: "smooth" });
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingMod(null);
    setNewMod({ name: '', description: '', date_installed: '', cost: '' });
  };
  
  // Handle delete mod
  const handleDeleteMod = async (modId) => {
    if (!window.confirm("Are you sure you want to delete this modification?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('VehicleMods')
        .delete()
        .eq('id', modId);
        
      if (error) throw error;
      
      // Update local state
      setMods(mods.filter(mod => mod.id !== modId));
      
      // Announce to screen readers
      const liveRegion = document.getElementById('live-region');
      if (liveRegion) {
        liveRegion.textContent = "Modification deleted successfully";
      }
    } catch (error) {
      console.error('Error deleting mod:', error.message);
      setError('Failed to delete modification. Please try again.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!newMod.name || !newMod.description) {
        throw new Error('Name and description are required');
      }

      let response;

      if (isEditing) {
        // Update existing mod
        response = await supabase
          .from('VehicleMods')
          .update({
            name: newMod.name,
            description: newMod.description,
            date_installed: newMod.date_installed || null,
            cost: newMod.cost ? parseFloat(newMod.cost) : null
          })
          .eq('id', editingMod.id)
          .select();
          
        if (response.error) throw response.error;
        
        // Update local state
        setMods(prev => prev.map(mod => 
          mod.id === editingMod.id ? response.data[0] : mod
        ));
        
        // Announce to screen readers
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
          liveRegion.textContent = "Modification updated successfully";
        }
      } else {
        // Add new mod
        response = await supabase
          .from('VehicleMods')
          .insert([{ 
            ...newMod, 
            vehicle_id: id,
            cost: newMod.cost ? parseFloat(newMod.cost) : null 
          }])
          .select();
          
        if (response.error) throw response.error;
        
        // Update local state
        setMods(prev => [response.data[0], ...prev]);
        
        // Announce to screen readers
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
          liveRegion.textContent = "New modification added successfully";
        }
      }
      
      // Reset form state
      setNewMod({ name: '', description: '', date_installed: '', cost: '' });
      setIsEditing(false);
      setEditingMod(null);
      
    } catch (error) {
      console.error('Error saving mod:', error.message);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 bg-black min-h-screen flex items-center justify-center">
        <p className="text-gray-400" role="status" aria-live="polite">Loading vehicle data...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-10 bg-black min-h-screen">
        <div className="text-center" role="alert">
          <h2 className="apex-header-green mb-4">Vehicle Not Found</h2>
          <p className="text-white mb-6">The vehicle you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/garage-vault" className="apex-button">Return to Garage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-black min-h-screen" aria-labelledby="modsPageHeading">
      <div className="max-w-6xl mx-auto">
        <nav className="mb-6" aria-label="Breadcrumb">
          <Link to="/garage-vault" className="text-green-400 hover:text-green-300">← Back to Garage</Link>
        </nav>

        <h2 id="modsPageHeading" className="apex-header-green mb-8">
          {vehicle.car_name} | Modifications
        </h2>

        {/* Add New Modification Section */}
        <section 
          className="apex-card p-6 mb-8"
          aria-labelledby="addModHeading"
        >
          <h3 id="addModHeading" className="text-blue-400 font-orbitron text-lg mb-4">
            {isEditing ? 'Edit Modification' : 'Add New Modification'}
          </h3>
          
          {error && (
            <div className="bg-red-900 text-white p-3 mb-4 rounded" role="alert">
              {error}
            </div>
          )}
          
          {/* Hidden live region for screen reader announcements */}
          <div id="live-region" className="sr-only" aria-live="polite"></div>
          
          <form onSubmit={handleSubmit} aria-label={isEditing ? 'Edit modification form' : 'Add modification form'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-300 mb-1">
                  Modification Name*
                </label>
                <input 
                  type="text"
                  id="name"
                  name="name"
                  value={newMod.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                  aria-required="true"
                />
              </div>
              
              <div>
                <label htmlFor="date_installed" className="block text-gray-300 mb-1">
                  Date Installed
                </label>
                <input 
                  type="date"
                  id="date_installed"
                  name="date_installed"
                  value={newMod.date_installed}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                />
              </div>
              
              <div>
                <label htmlFor="cost" className="block text-gray-300 mb-1">
                  Cost (USD)
                </label>
                <input 
                  type="number"
                  id="cost"
                  name="cost"
                  value={newMod.cost}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-gray-300 mb-1">
                  Description*
                </label>
                <textarea 
                  id="description"
                  name="description"
                  value={newMod.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                  aria-required="true"
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              {isEditing && (
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                className="apex-button"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting 
                  ? (isEditing ? 'Saving...' : 'Adding...') 
                  : (isEditing ? 'Save Changes' : 'Add Modification')}
              </button>
            </div>
          </form>
        </section>

        {/* Mods List Section */}
        <section aria-labelledby="modsListHeading">
          <h3 id="modsListHeading" className="apex-header-gray mb-4">Installed Modifications</h3>
          
          {mods.length === 0 ? (
            <p className="text-gray-400 text-center py-6">
              No modifications have been added yet. Add your first mod above!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="region" aria-label="List of vehicle modifications">
              {mods.map((mod, index) => (
                <div 
                  key={mod.id || index} 
                  className="apex-card p-6 bg-gray-900 border-gray-800 hover:border-green-500 transition-all duration-300"
                  role="group"
                  aria-labelledby={`mod-${index}-title`}
                >
                  <h4 id={`mod-${index}-title`} className="text-green-500 font-orbitron text-lg mb-3">
                    {mod.name}
                  </h4>
                  
                  <div className="space-y-3 mb-4">
                    {mod.date_installed && (
                      <div className="flex items-center" aria-label="Installation Date">
                        <div className="h-4 w-4 text-blue-400 mr-2">📅</div>
                        <p className="text-gray-300">
                          Installed: {new Date(mod.date_installed).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {mod.description && (
                      <div className="flex items-start" aria-label="Notes about modification">
                        <div className="h-4 w-4 text-blue-400 mt-1 mr-2">📝</div>
                        <p className="text-gray-300">{mod.description}</p>
                      </div>
                    )}
                    
                    {mod.cost && (
                      <div className="flex items-center" aria-label="Cost of modification">
                        <div className="h-4 w-4 text-blue-400 mr-2">💰</div>
                        <p className="text-gray-300">Cost: ${parseFloat(mod.cost).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Edit and Delete Buttons with Accessibility */}
                  <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={() => handleEditMod(mod)} 
                      className="text-sm text-blue-400 hover:text-blue-300"
                      aria-label={`Edit modification ${mod.name}`}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteMod(mod.id)} 
                      className="text-sm text-red-500 hover:text-red-400"
                      aria-label={`Delete modification ${mod.name}`}
                    >
                      ❌ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default VehicleModsPage;