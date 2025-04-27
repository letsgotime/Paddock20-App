import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Link as LinkIcon, Calendar, FileText, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

function VehicleModsPage() {
  const { id } = useParams(); // vehicle_id
  const [mods, setMods] = useState([]);
  const [modData, setModData] = useState({
    mod_title: '',
    install_date: '',
    part_link: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [vehicleName, setVehicleName] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch vehicle data (for the name)
        const vehicleResponse = await supabase
          .from('Vehicles')
          .select('car_name')
          .eq('id', id)
          .single();
          
        if (vehicleResponse.data) {
          setVehicleName(vehicleResponse.data.car_name);
        }
          
        // Fetch mods data for this vehicle
        const modsResponse = await supabase
          .from('VehicleMods')
          .select('*')
          .eq('vehicle_id', id);
          
        setMods(modsResponse.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setModData({ ...modData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Add new mod to Supabase
      const { data, error } = await supabase
        .from('VehicleMods')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user.id,
          vehicle_id: id,
          mod_title: modData.mod_title,
          install_date: modData.install_date,
          part_link: modData.part_link,
          notes: modData.notes
        });
        
      if (error) throw error;
      
      // Add to local state for immediate UI update
      setMods([...mods, {
        id: Math.floor(Math.random() * 1000),
        vehicle_id: id,
        mod_title: modData.mod_title,
        install_date: modData.install_date,
        part_link: modData.part_link,
        notes: modData.notes
      }]);
      
      // Reset form
      setModData({
        mod_title: '',
        install_date: '',
        part_link: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving mod:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 bg-gray-950 min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-950 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Link to="/garage-vault" className="mr-4 text-gray-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h2 className="apex-header-green">{vehicleName} | BUILD SHEET</h2>
        </div>

        {/* Mod Form */}
        <Card className="apex-card mb-10 p-6 bg-gray-900 border-gray-800">
          <h3 className="text-blue-400 font-orbitron text-lg mb-6 text-center">ADD NEW MODIFICATION</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="mod_title" className="block text-sm text-gray-400 mb-1">Modification Title</label>
              <Input 
                id="mod_title"
                type="text" 
                name="mod_title" 
                placeholder="e.g. Carbon Fiber Intake System" 
                value={modData.mod_title} 
                onChange={handleChange} 
                required 
                className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" 
              />
            </div>
            
            <div>
              <label htmlFor="install_date" className="block text-sm text-gray-400 mb-1">Installation Date</label>
              <Input 
                id="install_date"
                type="date" 
                name="install_date" 
                value={modData.install_date} 
                onChange={handleChange} 
                className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" 
              />
            </div>
            
            <div>
              <label htmlFor="part_link" className="block text-sm text-gray-400 mb-1">Part Link (optional)</label>
              <Input 
                id="part_link"
                type="url" 
                name="part_link" 
                placeholder="https://example.com/part" 
                value={modData.part_link} 
                onChange={handleChange} 
                className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" 
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm text-gray-400 mb-1">Notes (performance gains, installation notes)</label>
              <Textarea 
                id="notes"
                name="notes" 
                placeholder="E.g. +15hp, improves throttle response, professional installation recommended" 
                value={modData.notes} 
                onChange={handleChange} 
                className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white" 
                rows="3"
              ></Textarea>
            </div>
            
            <Button type="submit" className="apex-button w-full flex items-center justify-center">
              <Wrench className="h-4 w-4 mr-2" />
              Add Modification
            </Button>
          </form>
        </Card>

        {/* Existing Mods */}
        <h3 className="apex-header-gray mb-6">INSTALLED MODIFICATIONS</h3>
        
        {mods.length === 0 ? (
          <p className="text-gray-400 text-center p-6">No modifications have been added yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mods.map((mod, index) => (
              <Card key={index} className="apex-card p-6 bg-gray-900 border-gray-800 hover:border-green-500 transition-all duration-300">
                <h3 className="text-green-500 font-orbitron text-lg mb-3">{mod.mod_title}</h3>
                
                <div className="space-y-3 mb-4">
                  {mod.install_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-blue-400 mr-2" />
                      <p className="text-gray-300">Installed: {mod.install_date}</p>
                    </div>
                  )}
                  
                  {mod.notes && (
                    <div className="flex items-start">
                      <FileText className="h-4 w-4 text-blue-400 mt-1 mr-2" />
                      <p className="text-gray-300">{mod.notes}</p>
                    </div>
                  )}
                </div>
                
                {mod.part_link && (
                  <a 
                    href={mod.part_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-blue-400 hover:text-blue-300 mt-4"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    View Part Details
                  </a>
                )}
              </Card>
            ))}
          </div>
        )}
        
        <div className="text-center mt-10">
          <Link to="/garage-vault" className="apex-button inline-block">
            <ArrowLeft className="h-4 w-4 mr-2 inline" />
            Return to Garage Vault
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VehicleModsPage;