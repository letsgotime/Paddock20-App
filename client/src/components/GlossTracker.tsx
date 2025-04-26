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
  const defaultLogs: GlossLog[] = [
    {
      date: '2024-04-15',
      action: 'Ceramic Coating Applied',
      notes: 'Full vehicle ceramic coating with Gyeon Q² Mohs+ (3-year protection).'
    },
    {
      date: '2024-03-20',
      action: 'Paint Correction',
      notes: 'Two-stage paint correction to remove swirl marks and minor scratches.'
    },
    {
      date: '2024-02-05',
      action: 'Maintenance Wash',
      notes: 'Snow foam pre-wash followed by two-bucket wash method with Gyeon Bathe.'
    }
  ];
  
  const [logs, setLogs] = useState<GlossLog[]>(glossHistory.length > 0 ? glossHistory : defaultLogs);
  const [newLog, setNewLog] = useState<GlossLog>({
    date: '',
    action: '',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewLog(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.date && newLog.action) {
      setLogs([newLog, ...logs]);
      setNewLog({
        date: '',
        action: '',
        notes: ''
      });
    }
  };

  return (
    <div className="apex-card mb-8">
      <h2 className="apex-header-green mb-6">Gloss Tracker</h2>
      
      <form onSubmit={handleAddLog} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">Date</label>
            <input 
              type="date" 
              name="date"
              value={newLog.date}
              onChange={handleInputChange}
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Treatment/Action</label>
            <input 
              type="text" 
              name="action"
              value={newLog.action}
              onChange={handleInputChange}
              placeholder="e.g. Wax, Polish, Coating, Wash..."
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1">Details/Notes</label>
          <textarea 
            name="notes"
            value={newLog.notes}
            onChange={handleInputChange}
            placeholder="Products used, technique, areas treated..."
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white h-20"
          />
        </div>
        
        <button type="submit" className="apex-button w-full md:w-auto">
          Add Treatment Record
        </button>
      </form>
      
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="text-left py-3 px-4 text-gray-200">Date</th>
              <th className="text-left py-3 px-4 text-gray-200">Treatment</th>
              <th className="text-left py-3 px-4 text-gray-200 hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-t border-gray-700">
                <td className="py-3 px-4">{log.date}</td>
                <td className="py-3 px-4">{log.action}</td>
                <td className="py-3 px-4 hidden md:table-cell text-gray-400">{log.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-end mt-6">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500">
          Export History
        </button>
      </div>
    </div>
  );
};

export default GlossTracker;