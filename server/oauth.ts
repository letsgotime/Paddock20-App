import { Request, Response } from 'express';
import axios from 'axios';

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = 'https://paddock20.replit.app/oauth2callback';

/**
 * Handle OAuth2 callback from Google
 * This endpoint will be called by Google after the user authorizes the application
 */
export async function handleGoogleOAuth2Callback(req: Request, res: Response) {
  try {
    // Get the authorization code from the query parameters
    const code = req.query.code as string;
    
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }
    
    // Exchange authorization code for access token
    let script = '';
    try {
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      });
      
      const tokenData = tokenResponse.data;
      console.log('Google OAuth token exchange successful');
      
      // For security, we don't send the tokens directly to the client
      // Instead, we'll send the code and handle the exchange server-side
      script = `
        <script>
          window.opener.postMessage({ 
            type: 'GOOGLE_AUTH_SUCCESS', 
            code: '${code}'
          }, window.location.origin);
          window.close();
        </script>
      `;
    } catch (error) {
      console.error('Error exchanging Google auth code for token:', error);
      // We still want to close the popup even if the token exchange fails
      script = `
        <script>
          window.opener.postMessage({ 
            type: 'GOOGLE_AUTH_ERROR', 
            error: 'Failed to exchange authorization code for token'
          }, window.location.origin);
          window.close();
        </script>
      `;
    }
    
    // Return HTML with a script that communicates with the parent window
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #000;
              color: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            
            .success-container {
              background-color: #1a1a1a;
              border: 1px solid #333;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              max-width: 400px;
            }
            
            h1 {
              color: #3b82f6;
              margin-top: 0;
            }
            
            p {
              color: #aaa;
              margin-bottom: 20px;
            }
            
            .success-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="success-container">
            <div class="success-icon">✅</div>
            <h1>Authentication Successful</h1>
            <p>You've successfully authenticated with Google Photos. You can close this window and return to the Paddock20 application.</p>
          </div>
          ${script}
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error handling Google OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
}

/**
 * Handle OAuth2 callback from Apple
 * This endpoint would be called by Apple after the user authorizes the application
 */
export function handleAppleOAuth2Callback(req: Request, res: Response) {
  // Similar implementation to Google, but with Apple-specific token exchange
  res.send('Apple authentication callback - to be implemented');
}