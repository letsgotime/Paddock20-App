// Firebase Service for authentication and MFA
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  linkWithPhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  PhoneInfoOptions,
  multiFactor,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  MultiFactorError
} from 'firebase/auth';

// Initialize Firebase - placeholder configuration, will be overridden by env vars
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if we have all required Firebase configuration
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.authDomain && 
                      firebaseConfig.projectId && 
                      firebaseConfig.appId;

// Initialize Firebase app if we have valid configuration
export const firebaseApp = hasValidConfig ? initializeApp(firebaseConfig) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;

// Current auth state
let currentUser: User | null = null;

// Set up auth state listener when auth is available
if (auth) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log('Firebase auth state changed:', user ? user.email : 'No user');
  });
}

export const isFirebaseAvailable = (): boolean => {
  return !!firebaseApp && !!auth;
};

// Get current auth status for the app
export const getAuthStatus = (): { available: boolean, initialized: boolean, user: User | null } => {
  return {
    available: isFirebaseAvailable(),
    initialized: !!firebaseApp,
    user: currentUser
  };
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  if (!auth) throw new Error('Firebase authentication is not available');
  
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// Sign in with GitHub
export const signInWithGitHub = async (): Promise<User> => {
  if (!auth) throw new Error('Firebase authentication is not available');
  
  const provider = new GithubAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

// Sign in with email/password
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  if (!auth) throw new Error('Firebase authentication is not available');
  
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Create a new user with email/password
export const createUser = async (email: string, password: string, displayName?: string): Promise<User> => {
  if (!auth) throw new Error('Firebase authentication is not available');
  
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile if displayName is provided
  if (displayName && result.user) {
    await updateProfile(result.user, { displayName });
  }
  
  return result.user;
};

// Sign out the current user
export const signOutUser = async (): Promise<void> => {
  if (!auth) throw new Error('Firebase authentication is not available');
  return signOut(auth);
};

// Send email verification to current user
export const sendVerificationEmail = async (): Promise<void> => {
  if (!auth || !auth.currentUser) throw new Error('No authenticated user');
  return sendEmailVerification(auth.currentUser);
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  if (!auth) throw new Error('Firebase authentication is not available');
  return sendPasswordResetEmail(auth, email);
};

// Update user's password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  if (!auth || !auth.currentUser || !auth.currentUser.email) {
    throw new Error('No authenticated user or email');
  }
  
  // Re-authenticate the user first
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  
  // Now change the password
  return updatePassword(auth.currentUser, newPassword);
};

// Delete the current user account
export const deleteAccount = async (currentPassword: string): Promise<void> => {
  if (!auth || !auth.currentUser || !auth.currentUser.email) {
    throw new Error('No authenticated user or email');
  }
  
  // Re-authenticate the user first
  const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
  await reauthenticateWithCredential(auth.currentUser, credential);
  
  // Now delete the account
  return deleteUser(auth.currentUser);
};

// MFA Functions

// Check if MFA is enabled for the current user
export const isMFAEnabled = (): boolean => {
  if (!auth || !auth.currentUser) return false;
  
  const multiFactorUser = multiFactor(auth.currentUser);
  return multiFactorUser.enrolledFactors.length > 0;
};

// Get enrolled MFA factors for the current user
export const getMFAFactors = () => {
  if (!auth || !auth.currentUser) return [];
  
  const multiFactorUser = multiFactor(auth.currentUser);
  return multiFactorUser.enrolledFactors;
};

// Enroll a new phone as MFA
export const enrollPhoneMFA = async (phoneNumber: string): Promise<string> => {
  if (!auth || !auth.currentUser) throw new Error('No authenticated user');
  
  const multiFactorUser = multiFactor(auth.currentUser);
  
  // Create a reCAPTCHA verifier
  const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
    size: 'invisible',
  });
  
  // Start enrollment
  const phoneInfoOptions: PhoneInfoOptions = {
    phoneNumber: phoneNumber,
    session: await multiFactorUser.getSession()
  };
  
  // This will send the SMS verification code
  const phoneAuthProvider = new PhoneAuthProvider(auth);
  const verificationId = await phoneAuthProvider.verifyPhoneNumber(
    phoneInfoOptions, 
    recaptchaVerifier
  );
  
  // Return the verification ID which will be used in the next step
  return verificationId;
};

// Complete phone MFA enrollment with verification code
export const completePhoneMFAEnrollment = async (
  verificationId: string, 
  verificationCode: string,
  displayName: string = 'My Phone'
): Promise<void> => {
  if (!auth || !auth.currentUser) throw new Error('No authenticated user');
  
  const multiFactorUser = multiFactor(auth.currentUser);
  const phoneAuthProvider = new PhoneAuthProvider(auth);
  
  // Create the phone auth credential
  const phoneAuthCredential = phoneAuthProvider.credential(
    verificationId, 
    verificationCode
  );
  
  // Complete enrollment
  const multiFactorAssertion = PhoneAuthProvider.getMultiFactorAssertion(phoneAuthCredential);
  await multiFactorUser.enroll(multiFactorAssertion, displayName);
};

// Generate TOTP (Time-based One-Time Password) secret for MFA
export const generateTOTPSecret = async (): Promise<{ secret: string, qrCodeUrl: string }> => {
  if (!auth || !auth.currentUser) throw new Error('No authenticated user');
  
  const multiFactorUser = multiFactor(auth.currentUser);
  const session = await multiFactorUser.getSession();
  
  // Generate a TOTP secret
  const totpSecret = await TotpMultiFactorGenerator.generateSecret(session);
  
  // Get the QR code URL
  const qrCodeUrl = totpSecret.qrCodeUrl;
  
  return {
    secret: totpSecret.secretKey,
    qrCodeUrl
  };
};

// Complete TOTP MFA enrollment with verification code
export const completeTOTPMFAEnrollment = async (
  secret: string, 
  verificationCode: string,
  displayName: string = 'My Authenticator'
): Promise<void> => {
  if (!auth || !auth.currentUser) throw new Error('No authenticated user');
  
  const multiFactorUser = multiFactor(auth.currentUser);
  
  // Create the TOTP assertion
  const credential = TotpMultiFactorGenerator.generateCredential(secret, verificationCode);
  
  // Complete enrollment
  await multiFactorUser.enroll(credential, displayName);
};

// Handle MFA during sign in
export const handleMFASignIn = async (
  mfaError: MultiFactorError,
  selectedFactorId: string,
  verificationCode: string
): Promise<User> => {
  if (!auth) throw new Error('Firebase authentication is not available');
  
  try {
    // Get the resolver from the error
    const resolver = getMultiFactorResolver(auth, mfaError);
    
    // Find the selected factor
    const selectedHint = resolver.hints.find(
      hint => hint.uid === selectedFactorId
    );
    
    if (!selectedHint) {
      throw new Error('Selected factor not found');
    }
    
    let credential;
    if (selectedHint.factorId === PhoneAuthProvider.FACTOR_ID) {
      // Phone MFA
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      credential = phoneAuthProvider.credential(
        resolver.session.verificationId,
        verificationCode
      );
      
      const multiFactorAssertion = PhoneAuthProvider.getMultiFactorAssertion(credential);
      const result = await resolver.resolveSignIn(multiFactorAssertion);
      return result.user;
    } else if (selectedHint.factorId === TotpMultiFactorGenerator.FACTOR_ID) {
      // TOTP MFA
      const totpAssertion = TotpMultiFactorGenerator.generateCredential(verificationCode);
      const result = await resolver.resolveSignIn(totpAssertion);
      return result.user;
    } else {
      throw new Error('Unsupported MFA method');
    }
  } catch (error) {
    console.error('MFA sign-in error:', error);
    throw error;
  }
};

// Unenroll an MFA factor
export const unenrollMFAFactor = async (factorUid: string): Promise<void> => {
  if (!auth || !auth.currentUser) throw new Error('No authenticated user');
  
  const multiFactorUser = multiFactor(auth.currentUser);
  await multiFactorUser.unenroll(factorUid);
};

export default {
  isFirebaseAvailable,
  getAuthStatus,
  signInWithGoogle,
  signInWithGitHub,
  signInWithEmail,
  createUser,
  signOutUser,
  sendVerificationEmail,
  resetPassword,
  changePassword,
  deleteAccount,
  isMFAEnabled,
  getMFAFactors,
  enrollPhoneMFA,
  completePhoneMFAEnrollment,
  generateTOTPSecret,
  completeTOTPMFAEnrollment,
  handleMFASignIn,
  unenrollMFAFactor
};