import { type ChatPostMessageArguments, WebClient } from "@slack/web-api";

// Singleton instance of the Slack WebClient
let slackClient: WebClient | null = null;

/**
 * Initialize the Slack client with the provided token
 * @returns true if initialization was successful, false otherwise
 */
export function initializeSlackClient(): boolean {
  try {
    if (!process.env.SLACK_BOT_TOKEN) {
      console.warn("SLACK_BOT_TOKEN environment variable is not set");
      return false;
    }

    slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    return true;
  } catch (error) {
    console.error("Failed to initialize Slack client:", error);
    return false;
  }
}

/**
 * Get the Slack WebClient instance, initializing it if necessary
 * @returns The Slack WebClient instance, or null if initialization failed
 */
export function getSlackClient(): WebClient | null {
  if (!slackClient) {
    if (!initializeSlackClient()) {
      return null;
    }
  }
  return slackClient;
}

/**
 * Send a message to a Slack channel
 * @param message The message to send
 * @returns The timestamp of the sent message, or null if sending failed
 */
export async function sendSlackMessage(
  message: ChatPostMessageArguments
): Promise<string | null> {
  try {
    const client = getSlackClient();
    if (!client) {
      throw new Error("Slack client not initialized");
    }

    // If no channel is specified in the message, use the default channel from env vars
    if (!message.channel && process.env.SLACK_CHANNEL_ID) {
      message.channel = process.env.SLACK_CHANNEL_ID;
    }

    if (!message.channel) {
      throw new Error("No Slack channel specified");
    }

    const response = await client.chat.postMessage(message);
    return response.ts || null;
  } catch (error) {
    console.error("Error sending Slack message:", error);
    return null;
  }
}

/**
 * Share a car profile to Slack with formatted details
 * @param carProfile The car profile to share
 * @returns The timestamp of the sent message, or null if sending failed
 */
export async function shareCarProfileToSlack(carProfile: any): Promise<string | null> {
  try {
    const { make, model, year, trim, color, nickname } = carProfile;
    
    const message: ChatPostMessageArguments = {
      text: `New Car Profile Shared: ${year} ${make} ${model}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `${year} ${make} ${model} ${trim || ''}`,
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Nickname:* ${nickname || 'N/A'}\n*Color:* ${color || 'N/A'}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Shared from Paddock20 Portal on ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    return await sendSlackMessage(message);
  } catch (error) {
    console.error("Error sharing car profile to Slack:", error);
    return null;
  }
}

/**
 * Share an event to Slack with formatted details
 * @param event The event to share
 * @returns The timestamp of the sent message, or null if sending failed
 */
export async function shareEventToSlack(event: any): Promise<string | null> {
  try {
    const { title, date, location, description } = event;
    
    const message: ChatPostMessageArguments = {
      text: `New Event Shared: ${title}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: title,
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Date:*\n${new Date(date).toLocaleDateString()}`
            },
            {
              type: "mrkdwn",
              text: `*Location:*\n${location}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Details:*\n${description}`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `Shared from Paddock20 Portal on ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    };

    return await sendSlackMessage(message);
  } catch (error) {
    console.error("Error sharing event to Slack:", error);
    return null;
  }
}

/**
 * Check if Slack integration is configured and working
 * @returns true if Slack integration is working, false otherwise
 */
export async function checkSlackIntegration(): Promise<boolean> {
  try {
    const client = getSlackClient();
    if (!client) {
      return false;
    }

    // Test the API token by calling auth.test
    const auth = await client.auth.test();
    return Boolean(auth.ok);
  } catch (error) {
    console.error("Slack integration check failed:", error);
    return false;
  }
}