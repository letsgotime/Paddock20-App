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
  const [showBetaOnboarding, setShowBetaOnboarding] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);
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
    <>
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

      {/* Beta Onboarding Slides */}
      {showBetaOnboarding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl overflow-hidden">
            {/* Progress indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-[#1982FC] to-[#08c519]" 
                style={{ width: `${((currentOnboardingStep + 1) / 5) * 100}%` }}
              ></div>
            </div>
            
            {/* Content container */}
            <div className="px-8 py-12 md:py-16">
              {/* Step 1: Welcome */}
              {currentOnboardingStep === 0 && (
                <div className="flex flex-col items-center text-center">
                  <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      <span className="text-[#1982FC]">WELCOME TO </span>
                      <span className="text-[#08c519]">PADDOCK20</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl">
                      You're now part of an exclusive group of automotive enthusiasts shaping the future of driving intelligence
                    </p>
                  </div>
                  
                  <div className="mb-10">
                    <img 
                      src="/assets/Stock Photos/F1/paddock-entrance.png"
                      alt="Paddock20 Beta Program" 
                      className="w-full max-w-md h-auto rounded-lg shadow-xl border border-gray-800"
                    />
                  </div>
                  
                  <p className="text-gray-400 mb-10 max-w-2xl">
                    As a beta participant, you'll get early access to cutting-edge features, contribute to our development, and help shape the future of automobile intelligence. Let's get you set up for an optimal experience.
                  </p>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep + 1)}
                      className="px-8 py-3 bg-gradient-to-r from-[#1982FC] to-[#08c519] rounded-md font-medium text-white hover:brightness-110 transition-all"
                    >
                      Begin Your Journey
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Beta Program Benefits */}
              {currentOnboardingStep === 1 && (
                <div className="flex flex-col items-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <span className="text-[#1982FC]">BETA PROGRAM </span>
                    <span className="text-[#08c519]">BENEFITS</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <div className="h-10 w-1 bg-[#1982FC] mb-4"></div>
                      <h3 className="text-xl font-bold text-[#1982FC] mb-3">Early Access</h3>
                      <p className="text-gray-300">
                        Be the first to experience new features and modules before they're released to the public
                      </p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <div className="h-10 w-1 bg-[#08c519] mb-4"></div>
                      <h3 className="text-xl font-bold text-[#08c519] mb-3">Lifetime Benefits</h3>
                      <p className="text-gray-300">
                        Beta users receive permanent discounted pricing, while approved beta testers get free access for life
                      </p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <div className="h-10 w-1 bg-[#1982FC] mb-4"></div>
                      <h3 className="text-xl font-bold text-[#1982FC] mb-3">Direct Input</h3>
                      <p className="text-gray-300">
                        Your feedback shapes our development priorities and future features
                      </p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <div className="h-10 w-1 bg-[#08c519] mb-4"></div>
                      <h3 className="text-xl font-bold text-[#08c519] mb-3">Exclusive Community</h3>
                      <p className="text-gray-300">
                        Connect with other passionate automotive enthusiasts and the development team
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep - 1)}
                      className="px-6 py-3 bg-gray-800 rounded-md font-medium text-white hover:bg-gray-700 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep + 1)}
                      className="px-8 py-3 bg-gradient-to-r from-[#1982FC] to-[#08c519] rounded-md font-medium text-white hover:brightness-110 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 3: Confidentiality & NDA */}
              {currentOnboardingStep === 2 && (
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <span className="text-[#1982FC]">CONFIDENTIALITY </span>
                    <span className="text-white">& </span>
                    <span className="text-[#08c519]">NDA</span>
                  </h2>
                  
                  <p className="text-lg text-gray-300 mb-8 max-w-2xl">
                    As a beta participant, you're getting access to unreleased features and technology
                  </p>
                  
                  <div className="bg-black/50 border border-gray-800 rounded-lg p-8 mb-10 text-left max-w-3xl">
                    <div className="h-1 w-36 bg-[#1982FC] mb-6"></div>
                    
                    <h3 className="text-xl font-bold text-white mb-4">Key Confidentiality Points</h3>
                    
                    <ul className="space-y-4 text-gray-300">
                      <li className="flex">
                        <div className="h-6 w-1 bg-[#08c519] mr-3 flex-shrink-0 mt-1"></div>
                        <span>Do not share screenshots, videos, or details of unreleased features on social media or with non-participants</span>
                      </li>
                      <li className="flex">
                        <div className="h-6 w-1 bg-[#1982FC] mr-3 flex-shrink-0 mt-1"></div>
                        <span>Don't discuss specific technical implementations, bugs, or unreleased modules outside official feedback channels</span>
                      </li>
                      <li className="flex">
                        <div className="h-6 w-1 bg-[#08c519] mr-3 flex-shrink-0 mt-1"></div>
                        <span>You may discuss your general experience using the platform without revealing specific details</span>
                      </li>
                      <li className="flex">
                        <div className="h-6 w-1 bg-[#1982FC] mr-3 flex-shrink-0 mt-1"></div>
                        <span>All data, telemetry, and performance metrics collected are considered confidential</span>
                      </li>
                    </ul>
                    
                    <p className="mt-6 text-gray-400">
                      Our full NDA was included in the Beta Agreement you accepted during registration. This is an important legal agreement - violation may result in removal from the program.
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep - 1)}
                      className="px-6 py-3 bg-gray-800 rounded-md font-medium text-white hover:bg-gray-700 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep + 1)}
                      className="px-8 py-3 bg-gradient-to-r from-[#1982FC] to-[#08c519] rounded-md font-medium text-white hover:brightness-110 transition-all"
                    >
                      I Understand
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 4: Feature Overview */}
              {currentOnboardingStep === 3 && (
                <div className="flex flex-col items-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <span className="text-[#1982FC]">PADDOCK20 </span>
                    <span className="text-[#08c519]">PLATFORM</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#1982FC] mb-3">Weather Paddock</h3>
                      <p className="text-gray-300 mb-3">
                        F1-inspired weather analytics for precision driving and route planning
                      </p>
                      <div className="h-1 w-full bg-gray-800">
                        <div className="h-full w-[90%] bg-[#1982FC]"></div>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">90% Complete</p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#08c519] mb-3">Manifestation Station</h3>
                      <p className="text-gray-300 mb-3">
                        Document your dream vehicles and create a path to acquisition
                      </p>
                      <div className="h-1 w-full bg-gray-800">
                        <div className="h-full w-[85%] bg-[#08c519]"></div>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">85% Complete</p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#1982FC] mb-3">Garage Vault</h3>
                      <p className="text-gray-300 mb-3">
                        Comprehensive vehicle management and performance tracking
                      </p>
                      <div className="h-1 w-full bg-gray-800">
                        <div className="h-full w-[75%] bg-[#1982FC]"></div>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">75% Complete</p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#08c519] mb-3">Route Planner</h3>
                      <p className="text-gray-300 mb-3">
                        Plan and save your favorite driving routes with detailed metrics
                      </p>
                      <div className="h-1 w-full bg-gray-800">
                        <div className="h-full w-[80%] bg-[#08c519]"></div>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">80% Complete</p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#1982FC] mb-3">Drive Journal</h3>
                      <p className="text-gray-300 mb-3">
                        Record and analyze your drives with rich telemetry data
                      </p>
                      <div className="h-1 w-full bg-gray-800">
                        <div className="h-full w-[70%] bg-[#1982FC]"></div>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">70% Complete</p>
                    </div>
                    
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-6">
                      <h3 className="text-xl font-bold text-[#08c519] mb-3">Juice Box</h3>
                      <p className="text-gray-300 mb-3">
                        Detailing and maintenance tracking system with schedules
                      </p>
                      <div className="h-1 w-full bg-gray-800">
                        <div className="h-full w-[65%] bg-[#08c519]"></div>
                      </div>
                      <p className="text-xs mt-2 text-gray-500">65% Complete</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mb-10 max-w-2xl text-center">
                    These modules are under active development. You'll see updates and improvements throughout the beta period, and your feedback will help prioritize what we build next.
                  </p>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep - 1)}
                      className="px-6 py-3 bg-gray-800 rounded-md font-medium text-white hover:bg-gray-700 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep + 1)}
                      className="px-8 py-3 bg-gradient-to-r from-[#1982FC] to-[#08c519] rounded-md font-medium text-white hover:brightness-110 transition-all"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 5: Start Your Journey */}
              {currentOnboardingStep === 4 && (
                <div className="flex flex-col items-center text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <span className="text-[#1982FC]">READY TO </span>
                    <span className="text-[#08c519]">START?</span>
                  </h2>
                  
                  <p className="text-lg text-gray-300 mb-8 max-w-2xl">
                    Your Paddock20 beta experience is now configured and ready to go
                  </p>
                  
                  <div className="relative mb-10">
                    <img 
                      src="/assets/Stock Photos/F1/dashboard-view.png" 
                      alt="Paddock20 Dashboard" 
                      className="w-full max-w-2xl rounded-lg shadow-xl border border-gray-800"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-lg"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <p className="text-xl font-bold text-white mb-2">Your personalized dashboard awaits</p>
                      <p className="text-gray-300">Customized for your vehicles, driving habits, and preferences</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-3xl">
                    <div className="flex flex-col items-center p-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-[#1982FC]/20 rounded-full mb-3">
                        <span className="text-2xl text-[#1982FC]">1</span>
                      </div>
                      <p className="text-gray-300 text-center">Add your vehicles to the Garage Vault</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-[#08c519]/20 rounded-full mb-3">
                        <span className="text-2xl text-[#08c519]">2</span>
                      </div>
                      <p className="text-gray-300 text-center">Set up your dream vehicles in Manifestation Station</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-4">
                      <div className="h-12 w-12 flex items-center justify-center bg-[#1982FC]/20 rounded-full mb-3">
                        <span className="text-2xl text-[#1982FC]">3</span>
                      </div>
                      <p className="text-gray-300 text-center">Explore the Weather Paddock for your first drive</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setCurrentOnboardingStep(currentOnboardingStep - 1)}
                      className="px-6 py-3 bg-gray-800 rounded-md font-medium text-white hover:bg-gray-700 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => {
                        setShowBetaOnboarding(false);
                        navigate('/dashboard', { replace: true });
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-[#1982FC] to-[#08c519] rounded-md font-medium text-white hover:brightness-110 transition-all"
                    >
                      Enter Paddock20
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SimpleAuthPage;