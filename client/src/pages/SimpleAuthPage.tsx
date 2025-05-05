import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LegalDocumentModal from '../components/LegalDocumentModal';
import { legalDocuments } from '../data/legalDocuments';

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
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{title: string, content: string}>({
    title: "",
    content: ""
  });
  
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
    <div className="flex min-h-screen overflow-hidden relative">
      {/* Legal Document Modal */}
      <LegalDocumentModal
        title={currentDocument.title}
        content={currentDocument.content}
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
      />
      
      {/* Dynamic F1 background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('/assets/Stock Photos/F1/redbull-sparks-night.png')`,
          filter: 'brightness(0.3) contrast(1.1)',
        }}
      />
      
      {/* Carbon fiber texture overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70 mix-blend-multiply"
        style={{ 
          backgroundImage: `url('/assets/Stock Photos/F1/carbon-fiber-texture-dark.png')`,
        }}
      />
      
      {/* F1-inspired blue and green racing stripes */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#08c519] z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1982FC] z-10"></div>
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#1982FC] z-10"></div>
      <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#08c519] z-10"></div>
      
      {/* Blue diagonal racing stripes */}
      <div className="absolute -top-20 -left-20 w-40 h-[150vh] bg-[#1982FC] opacity-20 rotate-45 z-10"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-[150vh] bg-[#08c519] opacity-20 rotate-45 z-10"></div>
      
      {/* Content container with glassmorphism */}
      <div className="flex w-full min-h-screen items-center justify-center p-6 z-20">
        {/* Left column - Brand messaging */}
        <div className="hidden lg:flex flex-col w-1/2 pr-8 max-w-md">
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="text-[#1982FC]">PADDOCK</span>
                <span className="text-[#08c519]">20</span>
              </h1>
              <div className="h-1 w-32 bg-[#1982FC] mt-3"></div>
            </div>
            
            <p className="text-xl text-white font-light leading-relaxed">
              The ultimate automotive intelligence platform for passionate enthusiasts and drivers
            </p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-center">
                <div className="h-8 w-1 bg-[#08c519] mr-4"></div>
                <p className="text-white text-lg">Premium F1-inspired telemetry</p>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-1 bg-[#1982FC] mr-4"></div>
                <p className="text-white text-lg">Exclusive community & insights</p>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-1 bg-[#08c519] mr-4"></div>
                <p className="text-white text-lg">Advanced automotive analytics</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-lg bg-black/30 border border-gray-800">
              <p className="text-[#08c519] font-semibold">BETA ACCESS</p>
              <p className="text-gray-300 mt-1">
                You're part of an exclusive group of drivers shaping the future of automotive intelligence
              </p>
            </div>
          </div>
        </div>
        
        {/* Right column - Authentication form */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="backdrop-blur-md bg-black/60 rounded-2xl border border-gray-800 p-8 shadow-2xl"
            style={{
              boxShadow: `0 0 40px rgba(8, 197, 25, 0.15), 
                          0 0 20px rgba(25, 130, 252, 0.15)`
            }}
          >
            {/* Small brand logo on mobile */}
            <div className="mb-8 text-center block lg:hidden">
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                <span className="text-[#1982FC]">PADDOCK</span>
                <span className="text-[#08c519]">20</span>
              </h1>
            </div>
            
            {/* Toggle buttons */}
            <div className="mb-8">
              <div className="flex justify-center space-x-0 rounded-lg p-1 bg-gray-900/70 border border-gray-800">
                <button
                  type="button"
                  className={`flex-1 py-3 text-sm tracking-wider font-medium rounded-l-md transition-all duration-200 ${
                    isLogin 
                      ? 'bg-gradient-to-r from-[#1982FC]/80 to-[#08c519]/80 text-white shadow-lg' 
                      : 'bg-transparent text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setIsLogin(true)}
                >
                  SIGN IN
                </button>
                <button
                  type="button"
                  className={`flex-1 py-3 text-sm tracking-wider font-medium rounded-r-md transition-all duration-200 ${
                    !isLogin 
                      ? 'bg-gradient-to-r from-[#08c519]/80 to-[#1982FC]/80 text-white shadow-lg' 
                      : 'bg-transparent text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setIsLogin(false)}
                >
                  JOIN THE GRID
                </button>
              </div>
            </div>
            
            <h2 className="mb-6 text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              {isLogin ? 'WELCOME BACK' : 'CREATE YOUR PROFILE'}
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
                
                <div className="mb-6">
                  <div className="flex flex-col space-y-5 p-5 bg-[#1982FC]/10 rounded-lg border border-[#1982FC]/30">
                    <div>
                      <p className="font-bold text-[#1982FC] text-sm tracking-wide mb-2">PADDOCK20 BETA PROGRAM AGREEMENTS</p>
                      <p className="text-sm text-gray-300">
                        Before proceeding, you must review and agree to the following legal documents. These agreements protect both you and Paddock20 throughout your beta experience.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Terms of Service */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            id="terms"
                            type="checkbox"
                            required
                            className="w-4 h-4 text-[#08c519] bg-gray-700 border-gray-600 rounded focus:ring-[#1982FC]"
                          />
                        </div>
                        <label htmlFor="terms" className="ml-2 text-sm">
                          <span className="font-semibold text-white">I have read and agree to the </span> 
                          <button 
                            type="button"
                            onClick={() => {
                              setCurrentDocument({
                                title: "Terms of Service",
                                content: legalDocuments.termsOfService
                              });
                              setDocumentModalOpen(true);
                            }}
                            className="text-[#1982FC] hover:underline font-semibold"
                          >
                            Terms of Service
                          </button>
                          <p className="text-xs text-gray-300 mt-1">
                            The Terms of Service outline your rights and obligations when using Paddock20, including acceptable use policies, intellectual property rights, and liability limitations.
                          </p>
                        </label>
                      </div>
                      
                      {/* Privacy Policy */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            id="privacy"
                            type="checkbox"
                            required
                            className="w-4 h-4 text-[#08c519] bg-gray-700 border-gray-600 rounded focus:ring-[#1982FC]"
                          />
                        </div>
                        <label htmlFor="privacy" className="ml-2 text-sm">
                          <span className="font-semibold text-white">I have read and agree to the </span>
                          <button 
                            type="button"
                            onClick={() => {
                              setCurrentDocument({
                                title: "Privacy Policy",
                                content: legalDocuments.privacyPolicy
                              });
                              setDocumentModalOpen(true);
                            }}
                            className="text-[#1982FC] hover:underline font-semibold"
                          >
                            Privacy Policy
                          </button>
                          <p className="text-xs text-gray-300 mt-1">
                            Our Privacy Policy explains how we collect, use, store, and protect your personal information, including your rights regarding your data and our data retention practices.
                          </p>
                        </label>
                      </div>
                      
                      {/* Beta Agreement */}
                      <div className="flex items-start">
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            id="beta-agreement"
                            type="checkbox"
                            required
                            className="w-4 h-4 text-[#08c519] bg-gray-700 border-gray-600 rounded focus:ring-[#1982FC]"
                          />
                        </div>
                        <label htmlFor="beta-agreement" className="ml-2 text-sm">
                          <span className="font-semibold text-white">I have read and agree to the </span>
                          <button 
                            type="button"
                            onClick={() => {
                              setCurrentDocument({
                                title: "Beta Agreement",
                                content: legalDocuments.betaAgreement
                              });
                              setDocumentModalOpen(true);
                            }}
                            className="text-[#1982FC] hover:underline font-semibold"
                          >
                            Beta Agreement
                          </button>
                          <p className="text-xs text-gray-300 mt-1">
                            The Beta Agreement covers special considerations for beta testers, including feature limitations, feedback expectations, reporting bugs, and confidentiality requirements.
                          </p>
                        </label>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-800">
                      <p className="text-xs text-[#08c519] font-semibold">BETA PROGRAM BENEFITS</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Beta Users get discounted service for life. Beta Testers get free service for life, but require approval.
                        Thank you for supporting our Beta Program and Automotive Enthusiast community.
                      </p>
                    </div>
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
              <div className="mb-4 p-3 bg-[#1982FC]/10 border border-[#1982FC]/50 rounded-md text-white text-sm flex items-start">
                <AlertTriangle className="text-[#1982FC] mr-2 h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full rounded-md ${
                isSubmitting 
                  ? 'bg-gray-700' 
                  : isLogin 
                    ? 'bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:brightness-110' 
                    : 'bg-gradient-to-r from-[#08c519] to-[#1982FC] hover:brightness-110'
              } py-3 font-medium text-white flex items-center justify-center transition-all duration-200`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  PROCESSING...
                </>
              ) : isLogin ? (
                <>
                  SIGN IN
                  <LogIn className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  JOIN THE GRID
                  <UserPlus className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
            
            {/* Additional F1-inspired accent at the bottom of the form */}
            <div className="flex justify-center mt-8">
              <div className="h-1 w-20 bg-gradient-to-r from-[#1982FC] via-[#1982FC] to-[#08c519]"></div>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthPage;