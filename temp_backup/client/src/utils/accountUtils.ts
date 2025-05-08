/**
 * Account management utility functions
 */

/**
 * Function to delete a user account
 * Used when a user declines terms during registration or onboarding
 * @param reason - Optional reason for account deletion
 * @returns Promise indicating success of deletion
 */
export async function deleteAccount(reason: string = 'declined_terms'): Promise<boolean> {
  try {
    const response = await fetch('/api/user', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
    
    if (response.ok) {
      return true;
    } else {
      console.error('Failed to delete account:', await response.json());
      return false;
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    return false;
  }
}

/**
 * Handle user declining terms by deleting their account and redirecting to homepage
 * @param reason - Optional reason for account deletion
 * @returns Promise void
 */
export async function handleDeclineTerms(reason: string = 'declined_terms'): Promise<void> {
  try {
    const success = await deleteAccount(reason);
    
    if (success) {
      console.log('Account deleted successfully after declining terms');
      
      // Clear any local storage data
      localStorage.removeItem('userAgreements');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('vehicleProfile');
      localStorage.removeItem('dashboardPreferences');
      localStorage.removeItem('locationSettings');
      localStorage.removeItem('userRoutes');
      
      // Redirect to homepage or login
      window.location.href = '/auth';
    } else {
      console.error('Failed to delete account after declining terms');
      
      // Still redirect to login as fallback
      window.location.href = '/auth';
    }
  } catch (error) {
    console.error('Error handling declined terms:', error);
    
    // Redirect to login as fallback
    window.location.href = '/auth';
  }
}