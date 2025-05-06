import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import LegalDocumentModal from '../components/LegalDocumentModal';
// Import legal documents and define their structure
interface LegalDocument {
  title: string;
  content: string;
}

// Legal documents repository
const legalDocuments: Record<string, LegalDocument> = {
  termsOfService: {
    title: "Terms of Service",
    content: `
      <h2>PADDOCK20 Terms of Service</h2>
      <p>Last Updated: May 2025</p>
      
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using the PADDOCK20 application, you agree to be bound by these Terms of Service.</p>
      
      <h3>2. Beta Program</h3>
      <p>You acknowledge that PADDOCK20 is currently in beta testing. Features, functionality, and content may change without notice.</p>
      
      <h3>3. Privacy</h3>
      <p>Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information.</p>
      
      <h3>4. User Accounts</h3>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
      
      <h3>5. User-Generated Content</h3>
      <p>By submitting content to PADDOCK20, you grant us a worldwide, non-exclusive license to use, reproduce, and display such content.</p>
      
      <h3>6. Prohibited Conduct</h3>
      <p>You agree not to use PADDOCK20 for any unlawful purpose or in violation of these Terms.</p>
      
      <h3>7. Termination</h3>
      <p>We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of PADDOCK20, us, or third parties, or for any other reason.</p>
      
      <h3>8. Disclaimer of Warranties</h3>
      <p>PADDOCK20 is provided "as is" without warranties of any kind, either express or implied.</p>
      
      <h3>9. Limitation of Liability</h3>
      <p>In no event shall PADDOCK20 be liable for any indirect, incidental, special, consequential or punitive damages.</p>
      
      <h3>10. Changes to Terms</h3>
      <p>We reserve the right to modify these Terms at any time. Your continued use of PADDOCK20 after any such changes constitutes your acceptance of the new Terms.</p>
    `
  },
  privacyPolicy: {
    title: "Privacy Policy",
    content: `
      <h2>PADDOCK20 Privacy Policy</h2>
      <p>Last Updated: May 2025</p>
      
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our features.</p>
      
      <h3>2. How We Use Your Information</h3>
      <p>We use the information we collect to provide, maintain, and improve PADDOCK20, and to develop new products and services.</p>
      
      <h3>3. Sharing of Information</h3>
      <p>We do not share your personal information with third parties except as described in this Privacy Policy.</p>
      
      <h3>4. Data Security</h3>
      <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
      
      <h3>5. Your Choices</h3>
      <p>You can access, update, and delete certain information about you from within your account settings.</p>
      
      <h3>6. Changes to Privacy Policy</h3>
      <p>We may modify this Privacy Policy from time to time. If we make material changes, we will provide notice through PADDOCK20 or by other means.</p>
      
      <h3>7. Contact Us</h3>
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@paddock20.com.</p>
    `
  },
  betaAgreement: {
    title: "Beta Agreement",
    content: `
      <h2>PADDOCK20 Beta Agreement</h2>
      <p>Last Updated: May 2025</p>
      
      <h3>1. Beta Program</h3>
      <p>PADDOCK20 is currently in beta testing. By participating in our beta program, you agree to the following terms.</p>
      
      <h3>2. Beta User vs. Beta Tester</h3>
      <p><strong>Beta User:</strong> Receives discounted service for life with immediate access post-registration.</p>
      <p><strong>Beta Tester:</strong> Receives free service for life, requires approval via email verification, and commits to providing regular feedback.</p>
      
      <h3>3. Beta Period</h3>
      <p>The beta period will continue until the official release of PADDOCK20, or as otherwise determined by us.</p>
      
      <h3>4. Feedback</h3>
      <p>We encourage you to provide feedback on your experience with PADDOCK20. Your feedback will help us improve our product.</p>
      
      <h3>5. No Warranty</h3>
      <p>You acknowledge that beta versions of PADDOCK20 may contain bugs, errors, and other issues that may affect performance.</p>
      
      <h3>6. Beta Benefits</h3>
      <p>Benefits offered during the beta period are subject to change upon official release.</p>
      
      <h3>7. Termination</h3>
      <p>We reserve the right to terminate your participation in the beta program at any time and for any reason.</p>
    `
  },
  nonDisclosureAgreement: {
    title: "Non-Disclosure Agreement",
    content: `
      <h2>PADDOCK20 Non-Disclosure Agreement</h2>
      <p>Last Updated: May 2025</p>
      
      <h3>1. Purpose</h3>
      <p>This Non-Disclosure Agreement ("NDA") is to ensure the protection and preservation of confidential and proprietary information of PADDOCK20.</p>
      
      <h3>2. Confidential Information</h3>
      <p>Confidential Information includes all information or material that has or could have commercial value or other utility in the business in which PADDOCK20 is engaged, including but not limited to unreleased features, technical data, product plans, and marketing strategies.</p>
      
      <h3>3. Beta Tester's Obligations</h3>
      <p>As a Beta Tester, you agree to hold all Confidential Information in strict confidence and not to disclose such Confidential Information to any third parties.</p>
      
      <h3>4. Term</h3>
      <p>This NDA will remain in effect until the information is no longer confidential or until PADDOCK20 sends you written notice releasing you from this NDA, whichever occurs first.</p>
      
      <h3>5. No Rights Granted</h3>
      <p>Nothing in this NDA shall be construed as granting any rights to you, by license or otherwise, to any of PADDOCK20's Confidential Information.</p>
      
      <h3>6. Breach</h3>
      <p>You understand and acknowledge that any breach of this NDA may cause irreparable harm to PADDOCK20, for which monetary damages may be inadequate.</p>
      
      <h3>7. Governing Law</h3>
      <p>This NDA shall be governed by and construed in accordance with the laws of the United States.</p>
    `
  }
};

// Define mapping for document keys to make TypeScript happy
const documentKeyMapping: {[key: string]: keyof typeof legalDocuments} = {
  'terms': 'termsOfService',
  'privacy': 'privacyPolicy',
  'beta': 'betaAgreement',
  'nda': 'nonDisclosureAgreement'
};

/**
 * NewAuthPage - A clean implementation focused on server-side authentication
 * This component handles both login and registration with proper error handling
 * and works exclusively with the server API, avoiding any context dependencies.
 */
const NewAuthPage = () => {
  const [location, setLocation] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<{title: string, content: string, callback?: () => void}>({
    title: "",
    content: ""
  });
  
  // Reference to form elements for beta status
  const formRef = useRef<HTMLFormElement>(null);
  
  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    console.log('Checking authentication status...');
    
    // Check authentication status directly from the server
    fetch('/api/user', {
      credentials: 'include' // Important for cookies/session
    })
      .then(async response => {
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            console.log('User already authenticated:', data.user.username);
            setLocation('/dashboard');
          } else {
            console.log('Response OK but no valid user data, staying on login page');
          }
        } else {
          // Not authenticated, stay on login page
          console.log('Not authenticated, ready for login');
        }
      })
      .catch(error => {
        console.error('Auth check failed:', error);
      });
  }, [setLocation]);
  
  // Add code to toggle beta tester specific fields
  useEffect(() => {
    if (!isLogin) {
      // Show/hide beta tester specific fields based on radio selection
      const betaTesterRadio = document.getElementById('beta-tester') as HTMLInputElement;
      const betaUserRadio = document.getElementById('beta-user') as HTMLInputElement;
      const betaTesterOnlyFields = document.querySelectorAll('.beta-tester-only');
      
      const updateVisibility = () => {
        if (betaTesterRadio && betaTesterRadio.checked) {
          betaTesterOnlyFields.forEach(el => el.classList.remove('hidden'));
        } else {
          betaTesterOnlyFields.forEach(el => el.classList.add('hidden'));
        }
      };
      
      // Initial update
      updateVisibility();
      
      // Add event listeners
      if (betaTesterRadio) betaTesterRadio.addEventListener('change', updateVisibility);
      if (betaUserRadio) betaUserRadio.addEventListener('change', updateVisibility);
      
      // Cleanup
      return () => {
        if (betaTesterRadio) betaTesterRadio.removeEventListener('change', updateVisibility);
        if (betaUserRadio) betaUserRadio.removeEventListener('change', updateVisibility);
      };
    }
  }, [isLogin]);
  
  // Opens a legal document modal
  const openDocument = (documentKey: string) => {
    const mappedKey = documentKeyMapping[documentKey];
    const doc = mappedKey ? legalDocuments[mappedKey] : null;
    if (doc) {
      setCurrentDocument({
        title: doc.title,
        content: doc.content
      });
      setDocumentModalOpen(true);
    }
  };
  
  // Handle form submission for both login and registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
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
    
    // Additional validation for beta program
    let betaStatus = 'beta_user'; // Default
    let hasAgreedToNDA = false;
    let hasAgreedToTerms = false;
    let feedbackCommitment = false;
    
    // Get beta program status and agreement flags from the form
    if (!isLogin && formRef.current) {
      const form = formRef.current;
      
      // Check which beta program option is selected
      const betaTesterRadio = form.querySelector('#beta-tester') as HTMLInputElement;
      if (betaTesterRadio && betaTesterRadio.checked) {
        betaStatus = 'beta_tester';
        
        // For beta testers, verify NDA and feedback commitment
        const ndaCheckbox = form.querySelector('#nda-agreement') as HTMLInputElement;
        const feedbackCheckbox = form.querySelector('#feedback-commitment') as HTMLInputElement;
        
        hasAgreedToNDA = ndaCheckbox?.checked || false;
        feedbackCommitment = feedbackCheckbox?.checked || false;
        
        if (betaStatus === 'beta_tester' && !hasAgreedToNDA) {
          setErrorMessage('You must agree to the NDA to join as a Beta Tester');
          return;
        }
        
        if (betaStatus === 'beta_tester' && !feedbackCommitment) {
          setErrorMessage('You must commit to providing feedback to join as a Beta Tester');
          return;
        }
      }
      
      // For all users, verify terms agreement
      const termsCheckbox = form.querySelector('#terms-agreement') as HTMLInputElement;
      hasAgreedToTerms = termsCheckbox?.checked || false;
      
      if (!hasAgreedToTerms) {
        setErrorMessage('You must agree to the Terms of Service');
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        // Login through server API
        console.log('Attempting login for:', username);
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
          }),
          credentials: 'include', // Important for cookies
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          // Handle specific error responses
          console.error('Login failed with status:', response.status);
          throw new Error(data.error || 'Invalid username or password');
        }
        
        // Check for 2FA requirement
        if (data.requireTwoFactor) {
          setErrorMessage('Two-factor authentication is required but not supported in this flow.');
          return;
        }
        
        // Verify success and user data
        if (!data.success || !data.user) {
          throw new Error('Login succeeded but user data is missing');
        }
        
        console.log('Login successful:', data.user.username);
        setSuccessMessage('Login successful! Redirecting...');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          setLocation('/dashboard');
        }, 1000);
      } else {
        // Registration through server API
        console.log('Attempting registration for:', username);
        
        // Prepare registration data
        const userData = {
          username,
          email,
          password,
          confirmPassword,
          userType: betaStatus === 'beta_tester' ? 'beta_tester' : 'beta_user',
          hasAgreedToNDA,
          hasAgreedToTerms,
          feedbackCommitment
        };
        
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
          credentials: 'include', // Important for cookies
        });
        
        const data = await response.json().catch(() => ({ success: false }));
        
        if (!response.ok) {
          console.error('Registration failed with status:', response.status);
          throw new Error(data.error || 'Registration failed. Please try again.');
        }
        
        // Verify success and user data
        if (!data.success || !data.user) {
          throw new Error('Registration succeeded but user data is missing');
        }
        
        console.log('Registration successful:', data.user.username);
        setSuccessMessage('Registration successful! Redirecting to onboarding...');
        
        // Wait a moment before redirecting
        setTimeout(() => {
          setLocation('/onboarding');
        }, 1000);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Process specific error types
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('already')) {
          errorMessage = 'This username or email is already taken. Please choose a different one.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Invalid password. Please try again.';
        } else if (error.message.includes('not found') || error.message.includes('invalid login')) {
          errorMessage = 'Invalid username or password. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrorMessage(errorMessage);
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
        callback={currentDocument.callback}
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
        <div className="flex flex-col lg:flex-row items-start justify-center w-full max-w-6xl lg:space-x-8">
          {/* Left column - Brand messaging */}
          <div className="hidden lg:block flex-none w-1/2 max-w-md">
            <div className="space-y-6 sticky top-20">
              <div>
                <h1 className="text-5xl font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <span className="text-[#1982FC]">PADDOCK</span>
                  <span className="text-[#08c519]">20</span>
                </h1>
                <div className="h-1 w-32 bg-[#1982FC] mt-3"></div>
              </div>
              
              <p className="text-xl text-white font-light leading-relaxed">
                The bespoke automotive lifestyle platform with F1-precision intelligence that transforms everyday car care into a curated experience
              </p>
              
              <div className="space-y-4 mt-8">
                <div className="flex items-center">
                  <div className="h-8 w-1 bg-[#08c519] mr-4"></div>
                  <p className="text-white text-lg">Track maintenance, mods, and detailing with precision</p>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-1 bg-[#1982FC] mr-4"></div>
                  <p className="text-white text-lg">Discover perfect drives with Weather Paddock intelligence</p>
                </div>
                <div className="flex items-center">
                  <div className="h-8 w-1 bg-[#08c519] mr-4"></div>
                  <p className="text-white text-lg">Level up with premium features for the complete enthusiast</p>
                </div>
              </div>
              
              <div className="mt-4 p-4 rounded-lg bg-black/30 border border-gray-800">
                <p className="text-[#08c519] font-semibold">BETA ACCESS</p>
                <p className="text-gray-300 mt-1">
                  Join the movement. Full access to our complete ecosystem during the exclusive beta phase
                </p>
              </div>
            </div>
          </div>
          
          {/* Right column - Authentication form */}
          <div className="w-full lg:w-1/2 max-w-md mt-8 lg:mt-0">
            <div className="backdrop-blur-md bg-black/60 rounded-2xl border border-gray-800 p-8 shadow-2xl"
              style={{
                boxShadow: `0 0 40px rgba(8, 197, 25, 0.15), 
                            0 0 20px rgba(25, 130, 252, 0.15)`,
                maxHeight: 'calc(100vh - 80px)',
                overflowY: 'auto'
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
                    JOIN THE PADDOCK
                  </button>
                </div>
              </div>
              
              <h2 className="mb-6 text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                {isLogin ? 'WELCOME BACK' : 'CREATE YOUR PROFILE'}
              </h2>
            
              {/* Success message */}
              {successMessage && (
                <div className="mb-4 p-3 rounded-md bg-green-900/50 border border-green-500 text-green-100 flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  {successMessage}
                </div>
              )}
              
              {/* Error message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-md bg-[#1A0A0A] border border-red-800 text-red-200 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  {errorMessage}
                </div>
              )}
            
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {/* Username field */}
                <div>
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
                
                {/* Email field - only for registration */}
                {!isLogin && (
                  <div>
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
                
                {/* Password field */}
                <div>
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
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                {/* Confirm Password field - only for registration */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
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
                
                {/* Beta Program Selection - only for registration */}
                {!isLogin && (
                  <div>
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
                )}
                
                {/* Legal agreements - only for registration */}
                {!isLogin && (
                  <div className="p-4 bg-[#1982FC]/10 rounded-lg border border-[#1982FC]/30 space-y-3">
                    <div>
                      <p className="font-bold text-[#1982FC] text-sm tracking-wide mb-2">AGREEMENTS</p>
                      <p className="text-sm text-gray-300">
                        Please review and accept our terms to join the Paddock20 ecosystem
                      </p>
                    </div>
                    
                    {/* Terms of Service */}
                    <div className="flex items-start space-x-2">
                      <input
                        id="terms-agreement"
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="terms-agreement" className="text-sm text-gray-300">
                        I have read and agree to the{' '}
                        <button
                          type="button"
                          className="text-[#1982FC] hover:underline"
                          onClick={() => openDocument('terms')}
                        >
                          Terms of Service
                        </button>
                      </label>
                    </div>
                    
                    {/* Beta Tester NDA - conditionally shown */}
                    <div className="flex items-start space-x-2 beta-tester-only hidden">
                      <input
                        id="nda-agreement"
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="nda-agreement" className="text-sm text-gray-300">
                        I agree to the{' '}
                        <button
                          type="button"
                          className="text-[#1982FC] hover:underline"
                          onClick={() => openDocument('nda')}
                        >
                          Non-Disclosure Agreement
                        </button>{' '}
                        required for beta testing
                      </label>
                    </div>
                    
                    {/* Feedback Commitment - conditionally shown */}
                    <div className="flex items-start space-x-2 beta-tester-only hidden">
                      <input
                        id="feedback-commitment"
                        type="checkbox"
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="feedback-commitment" className="text-sm text-gray-300">
                        I commit to providing feedback on the platform to maintain my free beta tester status
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-md transition-all duration-200 ${
                    isSubmitting
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#1982FC] to-[#08c519] hover:from-[#08c519] hover:to-[#1982FC]'
                  } text-white font-medium shadow-lg`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {isLogin ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {isLogin ? (
                        <>
                          <LogIn size={18} />
                          Sign In
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          Create Account
                        </>
                      )}
                    </>
                  )}
                </button>
              </form>
              
              {/* Switch between login and registration */}
              <div className="mt-6 text-center text-sm text-gray-400">
                {isLogin ? (
                  <p>
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      className="text-[#1982FC] hover:underline"
                      onClick={() => setIsLogin(false)}
                    >
                      Join the Paddock
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      className="text-[#1982FC] hover:underline"
                      onClick={() => setIsLogin(true)}
                    >
                      Sign In
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAuthPage;