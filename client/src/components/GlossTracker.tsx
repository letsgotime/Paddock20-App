import React, { useState } from 'react';

interface GlossLog {
  date: string;
  action: string;
  notes: string;
}

interface GlossTrackerProps {
  glossHistory?: GlossLog[];
}

const GlossTracker: React.FC<GlossTrackerProps> = ({ glossHistory = [] }) => {
  const [logs, setLogs] = useState<GlossLog[]>(glossHistory);
  const [newLog, setNewLog] = useState<GlossLog>({
    date: new Date().toISOString().split('T')[0],
    action: '',
    notes: ''
  });

  const handleAddLog = () => {
    if (newLog.action.trim() === '') return;
    
    setLogs([...logs, { ...newLog }]);
    setNewLog({
      date: new Date().toISOString().split('T')[0],
      action: '',
      notes: ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewLog({ ...newLog, [name]: value });
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg mb-8">
      <h2 className="text-2xl text-green-400 font-orbitron uppercase mb-6">Gloss Evolution Tracking</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Current Status</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Last Gloss Boost:</span>
            <span>April 12, 2024</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Last Full Decon:</span>
            <span>March 1, 2024</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Last Sealant Refresh:</span>
            <span>March 10, 2024</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Last Paint Correction:</span>
            <span>November 15, 2023</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Last Ceramic Top Coat:</span>
            <span>September 1, 2022</span>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-md text-green-400 font-orbitron uppercase mb-3">Protection Timeline</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                  Current Protection
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-600">
                  85%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
              <div style={{ width: "85%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Next recommended maintenance: Gloss boost within 14 days
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl text-green-400 font-orbitron uppercase mb-4">Gloss Growth Log</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-orbitron uppercase text-green-400">Date</th>
                <th className="px-4 py-2 text-left text-xs font-orbitron uppercase text-green-400">Action</th>
                <th className="px-4 py-2 text-left text-xs font-orbitron uppercase text-green-400">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                  <td className="px-4 py-3">{formatDate(log.date)}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3 text-gray-300">{log.notes}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-gray-400">No gloss tracking logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gray-800 p-5 rounded-lg mb-6">
        <h3 className="text-lg text-green-400 font-orbitron uppercase mb-4">Add New Log Entry</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Date</label>
            <input 
              type="date" 
              name="date"
              value={newLog.date}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Action</label>
            <select
              name="action"
              value={newLog.action}
              onChange={handleInputChange}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">Select Action</option>
              <option value="Full Decontamination">Full Decontamination</option>
              <option value="Gloss Boost">Gloss Boost</option>
              <option value="Sealant Refresh">Sealant Refresh</option>
              <option value="Paint Correction">Paint Correction</option>
              <option value="Ceramic Coating">Ceramic Coating</option>
              <option value="Maintenance Wash">Maintenance Wash</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Notes</label>
          <textarea 
            name="notes"
            value={newLog.notes}
            onChange={handleInputChange}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white h-24"
            placeholder="Enter details about the maintenance performed..."
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={handleAddLog}
            className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
          >
            Add Log Entry
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg mr-2">
            Export Log
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
            View Analysis
          </button>
        </div>
        
        <button className="bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded-lg">
          Schedule Next Maintenance
        </button>
      </div>
    </div>
  );
};

export default GlossTracker;