import React from "react";
import { useLocation } from "wouter";
import { isAuthenticated } from "../services/authService";

function PrivateRoute({ children }) {
  const [_, navigate] = useLocation();
  
  // If not authenticated, redirect to home
  if (!isAuthenticated()) {
    navigate("/");
    return null;
  }
  
  return children;
}

export default PrivateRoute;