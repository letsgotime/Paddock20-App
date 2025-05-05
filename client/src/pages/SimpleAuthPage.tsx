import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// This is a simplified auth page that should work even if there are issues with other components
const SimpleAuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Let's bypass the automatic redirection check to fix the issue
  // Instead we'll just show the login page regardless of authentication status
  useEffect(() => {
    console.log('SimpleAuthPage loaded - this is the new simplified auth page');
  }, []);
  
  // Reference to form elements for beta status
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Basic validation
    if (!username || !password) {
      setErrorMessage('Please enter both username and password');
      return;
    }
    
    if (!isLogin && !email) {
      setErrorMessage('Please enter an email address for registration');
      return;
    }
    
    // Check if passwords match for registration
    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Make the actual API call
      const endpoint = isLogin ? '/api/login' : '/api/register';
      
      // Get beta program status for registration
      let betaStatus = 'beta_user'; // Default
      if (!isLogin && formRef.current) {
        const betaTesterRadio = formRef.current.querySelector('#beta-tester') as HTMLInputElement;
        if (betaTesterRadio && betaTesterRadio.checked) {
          betaStatus = 'beta_tester';
        }
      }
      
      // Construct user data based on login/register
      const userData = isLogin 
        ? { username, password } 
        : { 
            username, 
            password, 
            confirmPassword,  // Add password confirmation for the server
            email,
            betaStatus,
            agreeToTerms: true // Since the form requires this checkbox to be checked
          };
      
      console.log('Form submitted:', isLogin ? 'Login' : 'Register', userData);
        
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
        try {
          const errorData = await response.json();
          
          // Check for specific error types
          if (response.status === 400 && errorData.error && errorData.error.includes('already exists')) {
            setErrorMessage('This username is already taken. Please choose a different one.');
          } else if (response.status === 401) {
            setErrorMessage('Invalid username or password. Please try again.');
          } else {
            setErrorMessage(errorData.error || errorData.message || 'Authentication failed. Please try again.');
          }
          
          console.log('Auth error details:', errorData);
        } catch (parseError) {
          setErrorMessage('Authentication failed. Please try again.');
        }
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
          
          <form ref={formRef} onSubmit={handleSubmit}>
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
              <>
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
                
                <div className="mb-4">
                  <p className="mb-2 text-sm font-medium text-gray-300">
                    Beta Program
                  </p>
                  <div className="flex items-start space-x-2">
                    <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-2">
                      <input
                        id="beta-user"
                        type="radio"
                        name="beta-status"
                        value="beta_user"
                        defaultChecked
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <label htmlFor="beta-user" className="ml-2 text-sm font-medium text-gray-300">
                        Beta User
                      </label>
                    </div>
                    <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-2">
                      <input
                        id="beta-tester"
                        type="radio"
                        name="beta-status"
                        value="beta_tester"
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                      />
                      <label htmlFor="beta-tester" className="ml-2 text-sm font-medium text-gray-300">
                        Beta Tester
                      </label>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    Beta Users get discounted service for life. Beta Testers get free service for life but require approval.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        required
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <label htmlFor="terms" className="ml-2 text-xs font-medium text-gray-300">
                      I agree to the <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>. I also agree to the NDA terms for the Beta Program.
                    </label>
                  </div>
                </div>
              </>
            )}
            
            <div className="mb-4">
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
            
            {!isLogin && (
              <div className="mb-6">
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
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