// File: client/src/pages/JoinTheGrid.tsx
import { useState } from 'react';
import { useLocation } from 'wouter';

export default function JoinTheGrid() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      navigate('/onboarding');
    } else {
      setError(data.message || 'Registration failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 font-['Open_Sans'] flex flex-col justify-center items-center">
      <div className="max-w-md w-full border border-[#1982FC] rounded p-6 bg-zinc-900">
        <h1 className="text-3xl mb-4 font-['Orbitron'] text-[#1982FC] text-center">
          Join the <span className="text-[#08c519]">Grid</span>
        </h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border p-2 rounded bg-zinc-800 text-white border-zinc-700 focus:border-[#1982FC]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border p-2 rounded bg-zinc-800 text-white border-zinc-700 focus:border-[#1982FC]"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border p-2 rounded bg-zinc-800 text-white border-zinc-700 focus:border-[#1982FC]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-[#1982FC] text-white rounded hover:bg-blue-600"
          >
            {loading ? 'Joining...' : 'Join the Grid'}
          </button>
        </form>
      </div>
    </div>
  );
}