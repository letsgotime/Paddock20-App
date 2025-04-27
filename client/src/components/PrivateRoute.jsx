import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

function PrivateRoute({ children }) {
  // Check if user is authenticated
  const authenticated = isAuthenticated();
  
  // If not authenticated, redirect to the auth page
  if (!authenticated) {
    return <Navigate to="/" />;
  }
  
  // If authenticated, render the protected component
  return children;
}

export default PrivateRoute;