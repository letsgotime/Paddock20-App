import { WebClient } from '@slack/web-api';
import type { ChatPostMessageArguments } from '@slack/web-api';
import { EventEmitter } from 'events';

// Slack configuration
const SLACK_CONFIG = {
  botToken: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  channelId: process.env.SLACK_CHANNEL_ID || 'general', // Default channel
  clientId: process.env.SLACK_CLIENT_ID || '5156981603956.8872571224820',
  clientSecret: process.env.SLACK_CLIENT_SECRET
};

// Type for the Slack integration state
interface SlackState {
  initialized: boolean;
  lastMessage: string | null;
  lastMessageTimestamp: Date | null;
  lastError: Error | null;
  connected: boolean;
  availableChannels: string[];
}

// Global singleton for Slack client
let slackClient: WebClient | null = null;

// State management for Slack integration
const slackState: SlackState = {
  initialized: false,
  lastMessage: null,
  lastMessageTimestamp: null,
  lastError: null,
  connected: false,
  availableChannels: []
};

// Event emitter for Slack events
const slackEvents = new EventEmitter();

/**
 * Initialize the Slack client
 * @returns Promise resolving to a boolean indicating success
 */
export async function initializeSlackClient(): Promise<boolean> {
  if (!SLACK_CONFIG.botToken) {
    console.warn('Slack integration not available, alerts will only be logged');
    return false;
  }

  try {
    // Create the Slack client
    slackClient = new WebClient(SLACK_CONFIG.botToken);
    
    // Test the connection
    const authTest = await slackClient.auth.test();
    if (!authTest.ok) {
      throw new Error(`Slack authentication failed: ${authTest.error}`);
    }
    
    // Get available channels
    try {
      const conversationsResponse = await slackClient.conversations.list({
        types: 'public_channel,private_channel'
      });
      
      if (conversationsResponse.channels) {
        slackState.availableChannels = conversationsResponse.channels
          .filter(channel => channel.name)
          .map(channel => channel.name as string);
      }
    } catch (error) {
      console.warn('Could not fetch Slack channels:', error);
    }
    
    // Update state
    slackState.initialized = true;
    slackState.connected = true;
    slackState.lastError = null;
    
    console.log('Slack integration initialized successfully');
    slackEvents.emit('connected', authTest.user);
    
    return true;
  } catch (error: any) {
    console.error('Failed to initialize Slack client:', error.message || error);
    slackState.lastError = error;
    slackState.connected = false;
    
    slackEvents.emit('error', error);
    
    return false;
  }
}

/**
 * Check if Slack integration is available and working
 * @returns Promise resolving to a boolean indicating if Slack is working
 */
export async function checkSlackIntegration(): Promise<boolean> {
  if (!slackClient) {
    return false;
  }
  
  try {
    const authTest = await slackClient.auth.test();
    return authTest.ok === true;
  } catch (error) {
    console.error('Slack integration check failed:', error);
    return false;
  }
}

/**
 * Get the status of the Slack integration
 * @returns The current Slack state
 */
export function getSlackStatus(): SlackState {
  return { ...slackState };
}

/**
 * Send a message to a Slack channel
 * @param options Message options including text and channel
 * @returns Promise resolving to boolean indicating success
 */
export async function sendSlackMessage(
  options: ChatPostMessageArguments
): Promise<boolean> {
  if (!slackClient || !slackState.connected) {
    console.log('Slack message not sent (not connected):', options.text);
    return false;
  }
  
  try {
    const channel = options.channel || SLACK_CONFIG.channelId;
    
    const result = await slackClient.chat.postMessage({
      ...options,
      channel
    });
    
    if (result.ok) {
      slackState.lastMessage = options.text?.toString() || '';
      slackState.lastMessageTimestamp = new Date();
      
      slackEvents.emit('message_sent', {
        text: options.text,
        channel,
        timestamp: result.ts
      });
      
      return true;
    } else {
      throw new Error(result.error || 'Unknown Slack error');
    }
  } catch (error: any) {
    console.error('Failed to send Slack message:', error.message || error);
    slackState.lastError = error;
    
    slackEvents.emit('error', error);
    
    return false;
  }
}

/**
 * Share vehicle details to Slack
 * @param vehicleData The vehicle data to share
 * @param message Optional custom message
 * @returns Promise resolving to boolean indicating success
 */
export async function shareVehicleToSlack(
  vehicleData: any,
  message: string = 'New vehicle added:'
): Promise<boolean> {
  if (!slackClient) {
    console.log('Vehicle not shared to Slack (not connected):', vehicleData.name);
    return false;
  }
  
  let vehicleEmoji = '🚗';
  if (vehicleData.type === 'Motorcycle') vehicleEmoji = '🏍️';
  if (vehicleData.type === 'Truck') vehicleEmoji = '🚚';
  if (vehicleData.type === 'SUV') vehicleEmoji = '🚙';
  
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${message}* ${vehicleEmoji}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Vehicle:*\n${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`
        },
        {
          type: 'mrkdwn',
          text: `*Added by:*\n${vehicleData.owner || 'Unknown user'}`
        }
      ]
    }
  ];
  
  if (vehicleData.trim) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Trim:*\n${vehicleData.trim}`
        },
        {
          type: 'mrkdwn',
          text: `*Color:*\n${vehicleData.color || 'Not specified'}`
        }
      ]
    });
  }
  
  return await sendSlackMessage({
    channel: SLACK_CONFIG.channelId,
    text: `${message} ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
    blocks
  });
}

/**
 * Share event details to Slack
 * @param eventData The event data to share
 * @param message Optional custom message
 * @returns Promise resolving to boolean indicating success
 */
export async function shareEventToSlack(
  eventData: any,
  message: string = 'New event scheduled:'
): Promise<boolean> {
  if (!slackClient) {
    console.log('Event not shared to Slack (not connected):', eventData.title);
    return false;
  }
  
  let eventEmoji = '📅';
  if (eventData.type === 'Race') eventEmoji = '🏁';
  if (eventData.type === 'Track Day') eventEmoji = '🏎️';
  if (eventData.type === 'Maintenance') eventEmoji = '🔧';
  
  let dateDisplay = 'Date not specified';
  try {
    if (eventData.date) {
      const eventDate = new Date(eventData.date);
      dateDisplay = eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch (e) {
    console.warn('Failed to format event date:', e);
  }
  
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${message}* ${eventEmoji}`
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Event:*\n${eventData.title}`
        },
        {
          type: 'mrkdwn',
          text: `*When:*\n${dateDisplay}`
        }
      ]
    }
  ];
  
  if (eventData.location) {
    blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Location:*\n${eventData.location}`
        },
        {
          type: 'mrkdwn',
          text: `*Type:*\n${eventData.type || 'Not specified'}`
        }
      ]
    });
  }
  
  if (eventData.description) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Details:*\n${eventData.description}`
      }
    });
  }
  
  return await sendSlackMessage({
    channel: SLACK_CONFIG.channelId,
    text: `${message} ${eventData.title} - ${dateDisplay}`,
    blocks
  });
}

/**
 * Listen for Slack events
 * @param event The event name
 * @param callback The callback function
 */
export function onSlackEvent(
  event: 'connected' | 'error' | 'message_sent',
  callback: (data: any) => void
): void {
  slackEvents.on(event, callback);
}

// Try to initialize Slack on module load
initializeSlackClient().catch(error => {
  console.error('Failed to auto-initialize Slack:', error);
});

export default {
  initializeSlackClient,
  checkSlackIntegration,
  sendSlackMessage,
  shareVehicleToSlack,
  shareEventToSlack,
  getSlackStatus,
  onSlackEvent
};