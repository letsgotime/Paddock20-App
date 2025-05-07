import React, { useState } from 'react';
import supabase from '../services/supabaseClient';

function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        
        if (error) setMessage(error.message);
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        
        if (error) {
          setMessage(error.message);
        } else {
          setMessage('Check your email for the confirmation link!');
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apex-card max-w-md mx-auto">
      <h2 className="apex-header-green mb-6 text-center">
        {isLogin ? 'Login to Bespoke Technology Syndicate™' : 'Create Bespoke Technology Syndicate™ Account'}
      </h2>

      {message && (
        <p className={`mb-4 text-center ${message.includes('Check your email') ? 'text-green-500' : 'text-red-500'}`}>
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full p-3 rounded-lg bg-black border border-gray-700 text-white font-openSans"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className="apex-button w-full"
          disabled={loading}
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-blue-400 hover:underline mt-4 block mx-auto font-openSans"
        disabled={loading}
      >
        {isLogin ? 'Create an account' : 'Already have an account? Login'}
      </button>
    </div>
  );
}

export default AuthForm;