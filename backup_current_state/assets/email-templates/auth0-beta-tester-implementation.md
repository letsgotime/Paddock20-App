# Auth0 Beta Tester Approval System Implementation

This document outlines how to implement the Beta Tester approval system using Auth0's features and custom email templates.

## Overview

The Beta Tester approval flow works as follows:

1. User selects "Beta Tester" during registration
2. Auth0 sends a verification email with custom styling
3. User verifies their email
4. User's metadata is updated to mark them as a pending beta tester
5. Admin reviews and approves beta testers
6. Upon approval, user receives a beta approval email
7. User's account is upgraded to full beta tester status

## Step 1: Configure Auth0 Dashboard

### Enable Email Verification

1. Go to the Auth0 Dashboard > Authentication > Email Templates
2. Enable email verification
3. Switch from the default template to custom HTML
4. Paste the content from `verification-email.html`
5. Save changes

### Create Email Template for Beta Approval

1. Go to Auth0 Dashboard > Emails > Templates
2. Create a new template or edit an existing one
3. Select "Customize Email Templates"
4. Paste the content from `beta-approval-email.html`
5. Save the template

## Step 2: Add Beta Tester Metadata Management

### Update User Metadata After Registration

```javascript
// In your Auth0 Rule or Action
function (user, context, callback) {
  // Check if this is a new user
  if (context.stats.loginsCount === 1) {
    // Check if they registered as a beta tester
    const betaTester = user.user_metadata && user.user_metadata.betaTesterStatus;
    
    if (betaTester) {
      // Set the beta tester status to 'pending'
      user.user_metadata = user.user_metadata || {};
      user.user_metadata.betaTesterStatus = 'pending';
      
      // Update the user metadata
      auth0.users.updateUserMetadata(user.user_id, user.user_metadata);
    }
  }
  
  // Continue with the authentication flow
  callback(null, user, context);
}
```

## Step 3: Create Admin Interface for Approval

Create a simple admin panel in your PADDOCK20 application:

```jsx
// AdminBetaApprovalPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AdminBetaApprovalPanel = () => {
  const [pendingTesters, setPendingTesters] = useState([]);
  const { getAccessTokenSilently } = useAuth0();
  
  useEffect(() => {
    // Load pending beta testers
    const loadPendingTesters = async () => {
      try {
        const token = await getAccessTokenSilently({
          audience: `https://api.paddock20.com`,
          scope: "read:users update:users"
        });
        
        // Call your server endpoint to get pending beta testers
        const response = await fetch('/api/admin/pending-beta-testers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        setPendingTesters(data.users);
      } catch (error) {
        console.error("Failed to load pending beta testers:", error);
      }
    };
    
    loadPendingTesters();
  }, [getAccessTokenSilently]);
  
  const approveBetaTester = async (userId) => {
    try {
      const token = await getAccessTokenSilently({
        audience: `https://api.paddock20.com`,
        scope: "update:users"
      });
      
      // Call your server endpoint to approve the beta tester
      await fetch(`/api/admin/approve-beta-tester/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the UI
      setPendingTesters(pendingTesters.filter(user => user.user_id !== userId));
    } catch (error) {
      console.error("Failed to approve beta tester:", error);
    }
  };
  
  return (
    <div className="admin-panel">
      <h2>Beta Tester Approval</h2>
      {pendingTesters.length === 0 ? (
        <p>No pending beta testers found.</p>
      ) : (
        <ul>
          {pendingTesters.map(user => (
            <li key={user.user_id}>
              {user.name} ({user.email})
              <button onClick={() => approveBetaTester(user.user_id)}>
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminBetaApprovalPanel;
```

## Step 4: Server Endpoints for Beta Tester Management

Create API endpoints on your server to manage beta testers:

```javascript
// server/routes.ts (add to your existing routes)

// Get all pending beta testers
app.get('/api/admin/pending-beta-testers', checkJwt, checkRole('admin'), async (req, res) => {
  try {
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });
    
    // Find users with pending beta tester status
    const users = await management.users.getAll({
      q: 'user_metadata.betaTesterStatus:"pending"',
      include_totals: true
    });
    
    res.json({ users: users.users });
  } catch (error) {
    console.error("Error fetching pending beta testers:", error);
    res.status(500).json({ error: "Failed to fetch beta testers" });
  }
});

// Approve a beta tester
app.post('/api/admin/approve-beta-tester/:userId', checkJwt, checkRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });
    
    // Update user metadata
    await management.users.updateUserMetadata({ id: userId }, {
      betaTesterStatus: 'approved'
    });
    
    // Send approval email
    await management.emails.send({
      user_id: userId,
      template: 'beta_approval',
      subject: 'Beta Tester Status Approved - PADDOCK20'
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error approving beta tester:", error);
    res.status(500).json({ error: "Failed to approve beta tester" });
  }
});
```

## Step 5: Frontend Beta Tester Status Check

Update your frontend to check for beta tester status:

```javascript
// In your Auth context or user profile component
const checkBetaTesterStatus = () => {
  const { user } = useAuth0();
  
  if (!user) return 'not_authenticated';
  
  const metadata = user.user_metadata || {};
  return metadata.betaTesterStatus || 'none';
};

// Then use it in your components
const betaStatus = checkBetaTesterStatus();

// Conditionally render premium features
{betaStatus === 'approved' && (
  <div className="premium-feature">
    <h3>Manifestation Station</h3>
    {/* Premium feature content */}
  </div>
)}

// Show pending notice
{betaStatus === 'pending' && (
  <div className="pending-notice">
    Your Beta Tester application is pending approval.
  </div>
)}
```

## Required Auth0 Configuration

1. **Auth0 Rules**: Create rules to manage user metadata
2. **Email Provider**: Configure your SMTP settings in Auth0
3. **API**: Set up an Auth0 API for your admin endpoints
4. **Permissions**: Create permissions for admin operations
5. **Management API**: Create a client for the Management API
6. **Custom Email Templates**: Upload the email templates

By following these steps, you'll have a complete Beta Tester approval system integrated with Auth0, providing a seamless experience for both users and administrators.