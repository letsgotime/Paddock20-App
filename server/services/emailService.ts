import sgMail from '@sendgrid/mail';

// Configure SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send email verification to new users
 * @param email User's email address
 * @param token Verification token
 * @param username User's username
 * @param isBetaTester Whether the user is registering as a beta tester
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string,
  isBetaTester: boolean = false
): Promise<boolean> {
  try {
    // Skip sending email if SendGrid API key is not configured
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Email verification skipped.');
      return false;
    }

    // Base URL for verification link (from environment or default)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    const verificationLink = `${baseUrl}/api/verify-email/${token}`;
    
    // Create email message
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@sendgrid.net', // Using generic SendGrid email for testing
      subject: isBetaTester 
        ? 'PADDOCK20 Beta Tester Verification - Action Required' 
        : 'PADDOCK20 Account Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PADDOCK20 Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #000000; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48cGF0dGVybiBpZD0iY2FyYm9uIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiPjxwYXRoIGQ9Ik0wIDAgTDEwIDAgTDEwIDEwIEwwIDEwIFoiIGZpbGw9IiMwYzBjMGMiLz48cGF0aCBkPSJNMCAwIEwxMCAwIEw1IDUgTDAgMTAgTDAgMCIgZmlsbD0iIzA4MDgwOCIgZmlsbC1vcGFjaXR5PSIwLjQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY2FyYm9uKSIvPjwvc3ZnPg=='); color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);">
            <!-- Header with F1-style top bar -->
            <div style="height: 8px; background: linear-gradient(90deg, #1982FC 0%, #08c519 100%);"></div>
            
            <!-- Logo area -->
            <div style="text-align: center; padding: 30px 0 20px; background-color: rgba(0, 0, 0, 0.7);">
              <img src="${baseUrl}/assets/GoTime-Logo.png" alt="GoTime Motorsports" style="max-width: 180px; height: auto;">
            </div>
            
            <!-- Content area with carbon fiber background -->
            <div style="padding: 30px; background-color: rgba(12, 12, 14, 0.85); margin: 0 15px 15px; border-radius: 8px; border-left: 4px solid #1982FC; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);">
              <!-- F1-style header with colored accent -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="color: #1982FC; font-size: 28px; margin: 0 0 25px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(25, 130, 252, 0.3); padding-bottom: 15px;">
                      Security Verification
                    </h1>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #e0e0e0;">Hello <span style="color: #ffffff; font-weight: bold;">${username}</span>,</p>
              
              ${isBetaTester ? 
                `<div style="background-color: rgba(8, 197, 25, 0.1); border-left: 3px solid #08c519; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px; font-weight: 600; color: #08c519; font-size: 17px;">Thank you for applying to the PADDOCK20 Beta Testing Program!</p>
                  <p style="margin: 0; color: #e0e0e0; font-size: 15px;">As a Beta Tester, you'll receive <strong>exclusive lifetime access</strong> to premium features, early access to new modules, and direct input into platform development.</p>
                </div>` 
                : 
                `<p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #e0e0e0;">Thank you for registering with PADDOCK20!</p>`
              }
              
              <!-- Security notice -->
              <div style="background-color: rgba(25, 130, 252, 0.1); border-radius: 4px; padding: 15px; margin: 20px 0; border-left: 3px solid #1982FC;">
                <p style="margin: 0; font-size: 14px; color: #cccccc;">
                  <strong style="color: #1982FC;">SECURITY NOTICE:</strong> For your account security, this verification link will expire in 24 hours. This link can only be used once.
                </p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.5; margin: 25px 0; color: #e0e0e0;">Please verify your email address by clicking the button below:</p>
              
              <!-- CTA Button with F1-style design -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 4px;" bgcolor="#1982FC">
                          <a href="${verificationLink}" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 4px; padding: 12px 30px; border: 1px solid #1982FC; display: inline-block; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background-color: #1982FC; background-image: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%);">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 14px; line-height: 1.5; margin: 25px 0 15px; color: #999999;">Or copy and paste this secure link into your browser:</p>
              
              <!-- Verification link in a stylized box -->
              <div style="background-color: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 12px; margin-bottom: 25px;">
                <p style="font-family: monospace; font-size: 12px; line-height: 1.4; margin: 0; word-break: break-all; color: #1982FC;">${verificationLink}</p>
              </div>
              
              ${isBetaTester ? 
                `<div style="background-color: rgba(8, 197, 25, 0.05); border-radius: 4px; padding: 15px; margin: 20px 0; border: 1px dashed rgba(8, 197, 25, 0.3);">
                  <p style="margin: 0; font-size: 15px; color: #e0e0e0;">
                    <strong style="color: #08c519;">Next Steps:</strong> Once verified, our team will review your application and activate your Beta Tester status. You'll receive a welcome email when your premium access is ready.
                  </p>
                </div>` 
                : 
                `<p style="font-size: 15px; line-height: 1.5; margin-bottom: 25px; color: #e0e0e0;">After verification, you'll have immediate access to your PADDOCK20 account.</p>`
              }
              
              <!-- Security information -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="font-size: 13px; color: #888888; margin: 0 0 10px 0;">
                  <strong style="color: #999999;">Security Information:</strong> This email was sent from an unmonitored address. If you did not create an account, please ignore this email.
                </p>
                <p style="font-size: 13px; color: #888888; margin: 0;">
                  For security purposes, this request was made on ${new Date().toLocaleString()}.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px; text-align: center; font-size: 12px; color: #666666; background-color: rgba(0, 0, 0, 0.8);">
              <p style="margin: 0 0 10px;">© 2025 GoTime Motorsports™ - Bespoke Technology Syndicate™ (BTS™). All rights reserved.</p>
              <p style="margin: 0; font-size: 11px; color: #555555;">Capital Made Tangible.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Send welcome email to verified users
 * @param email User's email address
 * @param username User's username
 * @param isBetaTester Whether the user is a beta tester
 */
export async function sendWelcomeEmail(
  email: string,
  username: string,
  isBetaTester: boolean = false
): Promise<boolean> {
  try {
    // Skip sending email if SendGrid API key is not configured
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured. Welcome email skipped.');
      return false;
    }

    // Base URL for app link (from environment or default)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
    
    // Create email message
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM || 'noreply@sendgrid.net', // Using generic SendGrid email for testing
      subject: isBetaTester 
        ? 'Welcome to the PADDOCK20 Beta Testing Program!' 
        : 'Welcome to PADDOCK20!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to PADDOCK20</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #000000; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MDAiIGhlaWdodD0iMzAwIj48ZGVmcz48cGF0dGVybiBpZD0iY2FyYm9uIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiPjxwYXRoIGQ9Ik0wIDAgTDEwIDAgTDEwIDEwIEwwIDEwIFoiIGZpbGw9IiMwYzBjMGMiLz48cGF0aCBkPSJNMCAwIEwxMCAwIEw1IDUgTDAgMTAgTDAgMCIgZmlsbD0iIzA4MDgwOCIgZmlsbC1vcGFjaXR5PSIwLjQiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjY2FyYm9uKSIvPjwvc3ZnPg=='); color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);">
            <!-- Header with F1-style top bar -->
            <div style="height: 8px; background: linear-gradient(90deg, #1982FC 0%, #08c519 100%);"></div>
            
            <!-- Logo area -->
            <div style="text-align: center; padding: 30px 0 20px; background-color: rgba(0, 0, 0, 0.7);">
              <img src="${baseUrl}/assets/GoTime-Logo.png" alt="GoTime Motorsports" style="max-width: 180px; height: auto;">
            </div>
            
            <!-- Content area with carbon fiber background -->
            <div style="padding: 30px; background-color: rgba(12, 12, 14, 0.85); margin: 0 15px 15px; border-radius: 8px; border-left: 4px solid #1982FC; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);">
              <!-- F1-style header with colored accent -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="color: #1982FC; font-size: 28px; margin: 0 0 25px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid rgba(25, 130, 252, 0.3); padding-bottom: 15px;">
                      Welcome to PADDOCK20${isBetaTester ? ' Beta Program' : ''}!
                    </h1>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px; color: #e0e0e0;">Hello <span style="color: #ffffff; font-weight: bold;">${username}</span>,</p>
              
              ${isBetaTester ? 
                `<div style="background-color: rgba(8, 197, 25, 0.1); border-left: 3px solid #08c519; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px; font-weight: 600; color: #08c519; font-size: 17px;">Your Beta Tester application has been approved!</p>
                  <p style="margin: 0; color: #e0e0e0; font-size: 15px;">You now have <strong>premium lifetime access</strong> to all features of PADDOCK20.</p>
                </div>

                <div style="margin: 25px 0; background-color: rgba(25, 130, 252, 0.05); border-radius: 8px; padding: 20px; border: 1px solid rgba(25, 130, 252, 0.1);">
                  <p style="color: #1982FC; font-weight: 600; font-size: 16px; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 0.5px;">Premium Features Unlocked:</p>
                  
                  <div style="display: table; width: 100%; margin-bottom: 12px;">
                    <div style="display: table-cell; width: 36px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background-color: rgba(25, 130, 252, 0.1); border-radius: 50%; text-align: center; line-height: 24px; color: #1982FC; font-weight: bold; font-size: 14px;">P</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">
                      <p style="margin: 0; font-weight: 600; color: #e6e6e6; font-size: 15px;">Podium Pursuit</p>
                      <p style="margin: 3px 0 0; color: #bbbbbb; font-size: 13px;">Track and compete with personalized F1-style driver scores</p>
                    </div>
                  </div>
                  
                  <div style="display: table; width: 100%; margin-bottom: 12px;">
                    <div style="display: table-cell; width: 36px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background-color: rgba(25, 130, 252, 0.1); border-radius: 50%; text-align: center; line-height: 24px; color: #1982FC; font-weight: bold; font-size: 14px;">M</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">
                      <p style="margin: 0; font-weight: 600; color: #e6e6e6; font-size: 15px;">Manifestation Station</p>
                      <p style="margin: 3px 0 0; color: #bbbbbb; font-size: 13px;">Dream garage visualization and acquisition planning</p>
                    </div>
                  </div>
                  
                  <div style="display: table; width: 100%; margin-bottom: 12px;">
                    <div style="display: table-cell; width: 36px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background-color: rgba(25, 130, 252, 0.1); border-radius: 50%; text-align: center; line-height: 24px; color: #1982FC; font-weight: bold; font-size: 14px;">W</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">
                      <p style="margin: 0; font-weight: 600; color: #e6e6e6; font-size: 15px;">Advanced Weather Paddock</p>
                      <p style="margin: 3px 0 0; color: #bbbbbb; font-size: 13px;">Premium automotive-specific forecasting</p>
                    </div>
                  </div>
                  
                  <div style="display: table; width: 100%; margin-bottom: 0;">
                    <div style="display: table-cell; width: 36px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background-color: rgba(25, 130, 252, 0.1); border-radius: 50%; text-align: center; line-height: 24px; color: #1982FC; font-weight: bold; font-size: 14px;">B</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">
                      <p style="margin: 0; font-weight: 600; color: #e6e6e6; font-size: 15px;">Exclusive Beta Tester Community</p>
                      <p style="margin: 3px 0 0; color: #bbbbbb; font-size: 13px;">Direct access to development team and early features</p>
                    </div>
                  </div>
                </div>` 
                : 
                `<div style="margin: 25px 0; background-color: rgba(25, 130, 252, 0.05); border-radius: 8px; padding: 20px; border: 1px solid rgba(25, 130, 252, 0.1);">
                  <p style="color: #1982FC; font-weight: 600; font-size: 16px; margin: 0 0 15px; text-transform: uppercase; letter-spacing: 0.5px;">Core Features Available:</p>
                  
                  <div style="display: table; width: 100%; margin-bottom: 12px;">
                    <div style="display: table-cell; width: 36px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background-color: rgba(25, 130, 252, 0.1); border-radius: 50%; text-align: center; line-height: 24px; color: #1982FC; font-weight: bold; font-size: 14px;">G</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">
                      <p style="margin: 0; font-weight: 600; color: #e6e6e6; font-size: 15px;">Garage Vault</p>
                      <p style="margin: 3px 0 0; color: #bbbbbb; font-size: 13px;">Track and manage your vehicles</p>
                    </div>
                  </div>
                  
                  <div style="display: table; width: 100%; margin-bottom: 12px;">
                    <div style="display: table-cell; width: 36px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background-color: rgba(25, 130, 252, 0.1); border-radius: 50%; text-align: center; line-height: 24px; color: #1982FC; font-weight: bold; font-size: 14px;">W</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">
                      <p style="margin: 0; font-weight: 600; color: #e6e6e6; font-size: 15px;">Weather Paddock</p>
                      <p style="margin: 3px 0 0; color: #bbbbbb; font-size: 13px;">Plan your drives with automotive-specific forecasting</p>
                    </div>
                  </div>
                  
                  <div style="display: table; width: 100%; margin-bottom: 0;">
                    <div style="display: table-cell; width: 36px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; background-color: rgba(25, 130, 252, 0.1); border-radius: 50%; text-align: center; line-height: 24px; color: #1982FC; font-weight: bold; font-size: 14px;">D</div>
                    </div>
                    <div style="display: table-cell; vertical-align: top;">
                      <p style="margin: 0; font-weight: 600; color: #e6e6e6; font-size: 15px;">Drive Journal</p>
                      <p style="margin: 3px 0 0; color: #bbbbbb; font-size: 13px;">Record and share your automotive experiences</p>
                    </div>
                  </div>
                </div>`
              }
              
              <!-- CTA Button with F1-style design -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center" style="border-radius: 4px;" bgcolor="#1982FC">
                          <a href="${baseUrl}/dashboard" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 4px; padding: 12px 30px; border: 1px solid #1982FC; display: inline-block; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background-color: #1982FC; background-image: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%);">
                            Go To Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              ${isBetaTester ? 
                `<div style="background-color: rgba(8, 197, 25, 0.05); border-radius: 4px; padding: 15px; margin: 20px 0; border: 1px dashed rgba(8, 197, 25, 0.2);">
                  <p style="margin: 0; font-size: 15px; color: #e0e0e0;">
                    <strong style="color: #08c519;">Beta Tester Privileges:</strong> Your feedback is incredibly valuable to us. As you explore the platform, please use the feedback tool to share your thoughts and suggestions.
                  </p>
                </div>` 
                : 
                `<p style="font-size: 15px; line-height: 1.5; margin: 25px 0; color: #e0e0e0; text-align: center;">We're thrilled to have you join the PADDOCK20 community!</p>`
              }
              
              <!-- Security information -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                <p style="font-size: 13px; color: #888888; margin: 0;">
                  For account security, please contact support if you did not request this account.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 20px; text-align: center; font-size: 12px; color: #666666; background-color: rgba(0, 0, 0, 0.8);">
              <p style="margin: 0 0 10px;">© 2025 GoTime Motorsports™ - Bespoke Technology Syndicate™ (BTS™). All rights reserved.</p>
              <p style="margin: 0; font-size: 11px; color: #555555;">Capital Made Tangible.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send email
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}