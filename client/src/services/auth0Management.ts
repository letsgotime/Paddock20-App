import { useAuth0 } from "@auth0/auth0-react";

/**
 * Service for Auth0 Management API operations
 * Provides functions to check and manage beta tester status
 */
export const useAuth0Management = () => {
  const { user, getAccessTokenSilently } = useAuth0();

  /**
   * Check if the current user is a beta tester and their approval status
   * @returns Beta tester status (none, pending, approved)
   */
  const checkBetaTesterStatus = (): string => {
    if (!user) return "not_authenticated";
    
    // Access user metadata - Auth0 stores custom data here
    const metadata = user.user_metadata || {};
    return metadata.betaTesterStatus || "none";
  };

  /**
   * Request beta tester status for the current user
   */
  const requestBetaTesterStatus = async (): Promise<boolean> => {
    try {
      // Get access token with appropriate permissions
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "update:current_user_metadata"
        }
      });

      // Call our server API to update user metadata
      const response = await fetch("/api/auth/request-beta-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error("Failed to request beta tester status:", error);
      return false;
    }
  };

  /**
   * Admin function to get all pending beta testers
   */
  const getPendingBetaTesters = async () => {
    try {
      // Get access token with admin permissions
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "read:users"
        }
      });

      // Call admin API
      const response = await fetch("/api/admin/pending-beta-testers", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error("Failed to get pending beta testers:", error);
      throw error;
    }
  };

  /**
   * Admin function to approve a beta tester
   */
  const approveBetaTester = async (userId: string) => {
    try {
      // Get access token with admin permissions
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          scope: "update:users"
        }
      });

      // Call admin API
      const response = await fetch(`/api/admin/approve-beta-tester/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error("Failed to approve beta tester:", error);
      throw error;
    }
  };

  return {
    checkBetaTesterStatus,
    requestBetaTesterStatus,
    getPendingBetaTesters,
    approveBetaTester
  };
};