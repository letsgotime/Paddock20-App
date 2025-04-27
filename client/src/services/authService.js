/**
 * Authentication service for handling user authentication
 * This is a basic implementation for demo purposes
 * In a real application, this would integrate with a backend authentication service
 */

// Store authentication status in localStorage for persistence across page refresh
const TOKEN_KEY = 'paddock20_auth_token';
const USER_KEY = 'paddock20_user';

/**
 * Check if user is authenticated
 * @returns {boolean} Authentication status
 */
export function isAuthenticated() {
  // For demo purposes - always return true to show protected content
  // In a real app, you would check for a valid token
  return true;
  
  // Actual implementation would look like this:
  // return localStorage.getItem(TOKEN_KEY) !== null;
}

/**
 * Sign in a user
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data
 */
export async function login(username, password) {
  // Mock login for demo
  const user = { id: 1, username, name: 'Demo User' };
  
  // Store token and user data
  localStorage.setItem(TOKEN_KEY, 'demo_token');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  return user;
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  return Promise.resolve();
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} New user data
 */
export async function register(userData) {
  // Mock registration
  const user = { 
    id: 1, 
    username: userData.username,
    name: userData.name || 'New User',
  };
  
  // Store token and user data
  localStorage.setItem(TOKEN_KEY, 'demo_token');
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  
  return user;
}

/**
 * Get the current user's data
 * @returns {Object|null} User data or null if not logged in
 */
export function getCurrentUser() {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}