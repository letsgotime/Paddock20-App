import { WebClient } from '@slack/web-api';

/**
 * Returns the Slack client if properly configured
 */
export function getSlackClient(): WebClient | null {
  if (!process.env.SLACK_BOT_TOKEN) {
    console.log('SLACK_BOT_TOKEN environment variable is not set');
    return null;
  }
  
  try {
    return new WebClient(process.env.SLACK_BOT_TOKEN);
  } catch (error) {
    console.error('Error initializing Slack client:', error);
    return null;
  }
}

/**
 * Checks if the Slack integration is configured
 */
export async function checkSlackIntegration(): Promise<boolean> {
  try {
    const slack = getSlackClient();
    if (!slack) return false;
    
    // Test the connection
    const result = await slack.api.test();
    return result.ok === true;
  } catch (error) {
    console.error('Slack integration check failed:', error);
    return false;
  }
}

/**
 * Shares a vehicle to a Slack channel
 */
export async function shareVehicleToSlack(vehicle: any): Promise<boolean> {
  try {
    const slack = getSlackClient();
    if (!slack || !process.env.SLACK_CHANNEL_ID) return false;
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Vehicle Shared: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Details:*\n• Color: ${vehicle.color || 'N/A'}\n• VIN: ${vehicle.vin || 'N/A'}\n• Mileage: ${vehicle.mileage?.toLocaleString() || 'N/A'}`
        }
      }
    ];
    
    // Add image if available
    if (vehicle.imageUrl) {
      // For Slack blocks with images, need a different approach
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Image:* ${vehicle.imageUrl}`
        }
      });
    }
    
    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      blocks,
      text: `Vehicle Shared: ${vehicle.year} ${vehicle.make} ${vehicle.model}` // Fallback text
    });
    
    return result.ok === true;
  } catch (error) {
    console.error('Error sharing vehicle to Slack:', error);
    return false;
  }
}

/**
 * Shares an event to a Slack channel
 */
export async function shareEventToSlack(event: any): Promise<boolean> {
  try {
    const slack = getSlackClient();
    if (!slack || !process.env.SLACK_CHANNEL_ID) return false;
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Event Shared: ${event.title}`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Date:* ${event.date}\n*Type:* ${event.type}\n*Description:* ${event.description || 'No description provided'}`
        }
      }
    ];
    
    // Add image if available
    if (event.imageUrl) {
      // For Slack blocks with images, need a different approach
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Image:* ${event.imageUrl}`
        }
      });
    }
    
    const result = await slack.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID,
      blocks,
      text: `Event Shared: ${event.title}` // Fallback text
    });
    
    return result.ok === true;
  } catch (error) {
    console.error('Error sharing event to Slack:', error);
    return false;
  }
}

/**
 * Initialize the Slack client on server startup
 */
export function initializeSlackClient(): void {
  const slack = getSlackClient();
  if (slack) {
    console.log('Slack integration initialized successfully');
  } else {
    console.log('Slack integration not initialized. Ensure SLACK_BOT_TOKEN and SLACK_CHANNEL_ID environment variables are set.');
  }
}