// File: client/src/pages/admin/AdminDashboard.tsx
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
  const [, navigate] = useLocation();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.role || user.role !== 'admin') return;

    fetch(`/api/admin/users?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => data && setUsers(data));

    fetch('/api/admin/audit-log')
      .then((res) => res.json())
      .then(setLogs);
  }, [user, search]);

  const updateUserRole = async (id: number, role: string) => {
    const res = await fetch(`/api/admin/user/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    if (selectedUser?.id === updated.id) setSelectedUser(updated);
  };

  const toggleOnboarding = async () => {
    if (!selectedUser) return;
    const res = await fetch(`/api/admin/user/${selectedUser.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboardingCompleted: !selectedUser.onboardingCompleted }),
    });
    const updated = await res.json();
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setSelectedUser(updated);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center p-8 border border-red-500 rounded-md">
          <div className="text-3xl text-[#1982FC] font-['Orbitron'] mb-3">
            PADDOCK<span className="text-[#08c519]">20</span>
          </div>
          <div className="text-red-500 font-bold">Access Denied</div>
          <div className="text-gray-400 mt-2">Admin privileges required</div>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-[#1982FC] text-white rounded hover:bg-blue-600">
            Return to Paddock
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 font-['Open_Sans']">
      <header className="border-b border-zinc-800 p-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1982FC] font-['Orbitron']">
          PADDOCK<span className="text-[#08c519]">20</span> ADMIN GRID
        </h1>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="border border-[#1982FC] rounded p-4 bg-zinc-900">
            <h2 className="text-xl font-['Orbitron'] text-[#1982FC] mb-3">Search The Grid</h2>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full border p-2 rounded bg-zinc-800 text-white border-zinc-700 focus:border-[#1982FC]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-6 border border-[#1982FC] rounded p-4 bg-zinc-900">
            <h2 className="text-xl font-['Orbitron'] text-[#1982FC] mb-2">User List</h2>
            {users.length === 0 ? (
              <p className="text-gray-400">No users found</p>
            ) : (
              <ul>
                {users.map((u) => (
                  <li
                    key={u.id}
                    className="border-b border-zinc-700 py-2 hover:text-[#1982FC] cursor-pointer"
                    onClick={() => setSelectedUser(u)}
                  >
                    {u.email || u.username} {' '}
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${u.onboardingCompleted ? 'bg-[#08c519]' : 'bg-yellow-500'} text-white`}>
                      {u.onboardingCompleted ? 'Complete' : 'Pending'}
                    </span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${u.role === 'admin' ? 'bg-[#1982FC]' : 'bg-zinc-600'} text-white`}>
                      {u.role}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {selectedUser && (
          <div className="col-span-1 md:col-span-2 border border-[#1982FC] rounded p-4 bg-zinc-900">
            <h2 className="text-xl font-['Orbitron'] text-[#1982FC] mb-4">User Details</h2>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Username:</strong> {selectedUser.username}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <p><strong>Onboarding:</strong> {selectedUser.onboardingCompleted ? 'Complete' : 'Pending'}</p>

            <div className="mt-4">
              <label className="block mb-1 font-medium">User Role</label>
              <select
                value={selectedUser.role}
                onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                className="w-full border p-2 rounded bg-zinc-800 text-white border-zinc-700 focus:border-[#1982FC]"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-[#1982FC] text-white rounded hover:bg-blue-600" onClick={toggleOnboarding}>
                Toggle Onboarding
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        )}

        <div className="col-span-1 md:col-span-3 border border-[#1982FC] rounded p-4 bg-zinc-900">
          <h2 className="text-xl font-['Orbitron'] text-[#1982FC] mb-2">Recent Telemetry</h2>
          {logs.length === 0 ? (
            <p className="text-gray-400">No recent actions</p>
          ) : (
            <ul className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <li key={log.id} className="text-sm text-zinc-300">
                  <span className="block font-bold text-white">{log.action}</span>
                  <span className="text-xs text-zinc-500">{new Date(log.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}