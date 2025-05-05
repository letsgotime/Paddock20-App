import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// This is a simplified auth page that should work even if there are issues with other components
const SimpleAuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Let's bypass the automatic redirection check to fix the issue
  // Instead we'll just show the login page regardless of authentication status
  useEffect(() => {
    console.log('SimpleAuthPage loaded - this is the new simplified auth page');
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    console.log('Form submitted:', isLogin ? 'Login' : 'Register', { username, password, email });
    
    // Basic validation
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }
    
    if (!isLogin && !email) {
      setErrorMessage('Please enter an email address for registration');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make the actual API call
      const endpoint = isLogin ? '/api/login' : '/api/register';
      const userData = isLogin 
        ? { username, password } 
        : { username, password, email };
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (response.ok) {
        // Success! Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Handle errors
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-400">
            PADDOCK<span style={{ color: '#08c519' }}>20</span>
          </h1>
          <p className="text-gray-300">Your automotive intelligence platform</p>
        </div>
        
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                !isLogin 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 shadow-md">
          <h2 className="mb-6 text-xl font-semibold text-gray-100">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            {!isLogin && (
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="mb-6">
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {/* Error message display */}
            {errorMessage && (
              <div className="mb-4 p-2 bg-red-900/50 border border-red-500 rounded-md text-white text-sm">
                {errorMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-md ${isSubmitting ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} py-2 font-medium text-white flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : isLogin ? (
                <>
                  Sign In
                  <LogIn className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Create Account
                  <UserPlus className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthPage;