/**
 * Auth0Management service
 * 
 * This service handles interactions with the Auth0 Management API through our backend routes.
 * It provides methods for managing beta tester status and other Auth0 user management tasks.
 */

/**
 * Request beta tester status for the current user
 * @param token JWT access token from Auth0
 * @returns Promise resolving to success status
 */
export const requestBetaAccess = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth0/request-beta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to request beta access');
    }
    
    return true;
  } catch (error) {
    console.error('Beta request error:', error);
    return false;
  }
};

/**
 * Fetch users with pending beta tester status
 * @param token JWT access token from Auth0 with read:users scope
 * @returns Promise resolving to array of user objects
 */
export const fetchPendingBetaTesters = async (token: string) => {
  try {
    const response = await fetch('/api/auth0/beta-testers/pending', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending beta testers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending beta testers:', error);
    throw error;
  }
};

/**
 * Fetch users with approved beta tester status
 * @param token JWT access token from Auth0 with read:users scope
 * @returns Promise resolving to array of user objects
 */
export const fetchApprovedBetaTesters = async (token: string) => {
  try {
    const response = await fetch('/api/auth0/beta-testers/approved', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch approved beta testers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching approved beta testers:', error);
    throw error;
  }
};

/**
 * Approve a beta tester
 * @param token JWT access token from Auth0 with update:users scope
 * @param userId The Auth0 user ID to approve
 * @returns Promise resolving to success status
 */
export const approveBetaTester = async (token: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/auth0/approve-beta-tester/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to approve beta tester');
    }
    
    return true;
  } catch (error) {
    console.error('Error approving beta tester:', error);
    return false;
  }
};

/**
 * Reject a beta tester
 * @param token JWT access token from Auth0 with update:users scope
 * @param userId The Auth0 user ID to reject
 * @returns Promise resolving to success status
 */
export const rejectBetaTester = async (token: string, userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/auth0/reject-beta-tester/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to reject beta tester');
    }
    
    return true;
  } catch (error) {
    console.error('Error rejecting beta tester:', error);
    return false;
  }
};

/**
 * Check if a user has the admin role
 * @param token JWT access token from Auth0
 * @returns Promise resolving to boolean indicating if user is an admin
 */
export const checkUserIsAdmin = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/auth0/check-admin', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};