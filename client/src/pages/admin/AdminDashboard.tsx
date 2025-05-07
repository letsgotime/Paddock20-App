import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  onboardingCompleted?: boolean;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      });
  }, [user]);

  const updateUserRole = async (id: number, role: string) => {
    const response = await fetch(`/api/admin/user/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    
    const updated = await response.json();
    if (updated) {
      setUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      if (selectedUser?.id === id) setSelectedUser(updated);
    }
  };

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center p-8 border border-red-500 rounded-md">
          <div className="text-3xl text-[#1982FC] font-['Orbitron'] mb-3">
            PADDOCK<span className="text-[#08c519]">20</span>
          </div>
          <div className="text-red-500 font-bold">Access Denied</div>
          <div className="text-gray-400 mt-2">Admin privileges required</div>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-[#1982FC] text-white rounded hover:bg-blue-600"
          >
            Return to Paddock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 font-['Open_Sans']">
      <h1 className="text-3xl font-bold mb-4 text-[#1982FC] font-['Orbitron']">
        PADDOCK<span className="text-[#08c519]">20</span> ADMIN
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[#1982FC] rounded p-4 bg-zinc-900">
          <h2 className="text-xl font-semibold mb-2">All Users</h2>
          {users.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No users found</p>
          ) : (
            <ul>
              {users.map((u) => (
                <li
                  key={u.id}
                  className="border-b border-zinc-700 py-2 hover:cursor-pointer hover:text-[#1982FC]"
                  onClick={() => setSelectedUser(u)}
                >
                  {u.email || u.username} — {' '}
                  <Badge className={u.onboardingCompleted ? 'bg-[#08c519]' : 'bg-yellow-500'}>
                    {u.onboardingCompleted ? 'Onboarded' : 'Pending'}
                  </Badge>
                  <Badge className={u.role === 'admin' ? 'bg-[#1982FC] ml-2' : 'bg-zinc-600 ml-2'}>
                    {u.role}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {selectedUser && (
          <div className="border border-[#1982FC] rounded p-4 bg-zinc-900">
            <h2 className="text-xl font-semibold mb-2">User Details</h2>
            <div className="mb-1"><strong>Email:</strong> {selectedUser.email}</div>
            <div className="mb-1"><strong>Username:</strong> {selectedUser.username}</div>
            <div className="mb-1"><strong>Role:</strong> {selectedUser.role}</div>
            <div className="mb-4"><strong>Onboarding:</strong> {selectedUser.onboardingCompleted ? 'Complete' : 'Pending'}</div>
            
            <div className="mb-4">
              <label className="block mb-1 font-medium">User Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                className="w-full border p-2 rounded bg-zinc-800 text-white border-zinc-700"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button
              className="px-4 py-2 bg-[#1982FC] text-white rounded hover:bg-blue-600"
              onClick={async () => {
                const updated = await fetch(`/api/admin/user/${selectedUser.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ onboardingCompleted: !selectedUser.onboardingCompleted }),
                }).then((res) => res.json());
                
                setSelectedUser(updated);
                setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
              }}
            >
              Toggle Onboarding Status
            </button>
            
            <button
              className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}