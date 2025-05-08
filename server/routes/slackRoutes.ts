import { Router, Request, Response } from 'express';
import slack, {
  initializeSlackClient,
  checkSlackIntegration,
  sendSlackMessage,
  getSlackStatus
} from '../slack';

const router = Router();

/**
 * POST /api/slack/setup
 * Configure the Slack integration with bot token and channel ID
 */
router.post('/setup', async (req: Request, res: Response) => {
  try {
    const { botToken, channelId, signingSecret } = req.body;
    
    if (!botToken || !channelId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bot token and channel ID are required' 
      });
    }
    
    // Store credentials in environment variables
    process.env.SLACK_BOT_TOKEN = botToken;
    process.env.SLACK_CHANNEL_ID = channelId;
    
    if (signingSecret) {
      process.env.SLACK_SIGNING_SECRET = signingSecret;
    }
    
    // Initialize the Slack client with new credentials
    const success = await initializeSlackClient();
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize Slack with provided credentials' 
      });
    }
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Slack integration configured successfully' 
    });
  } catch (error: any) {
    console.error('Slack setup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to configure Slack: ${error.message}` 
    });
  }
});

/**
 * GET /api/slack/status
 * Get the current status of the Slack integration
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = getSlackStatus();
    const isOperational = await checkSlackIntegration();
    
    return res.status(200).json({
      ...status,
      connected: isOperational,
      channel: process.env.SLACK_CHANNEL_ID || 'Not set'
    });
  } catch (error: any) {
    console.error('Slack status error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to get Slack status: ${error.message}`, 
      error: error.message 
    });
  }
});

/**
 * POST /api/slack/test
 * Send a test message to the configured Slack channel
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const success = await sendSlackMessage({
      channel: process.env.SLACK_CHANNEL_ID || '',
      text: `🧪 Test message from PADDOCK20 - ${new Date().toLocaleString()}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*🧪 Test Message from PADDOCK20*'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Your Slack integration is working correctly! You can now receive vehicle updates and event notifications.'
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Sent at ${new Date().toLocaleString()}`
            }
          ]
        }
      ]
    });
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test message to Slack' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Test message sent successfully' 
    });
  } catch (error: any) {
    console.error('Slack test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to send test message: ${error.message}` 
    });
  }
});

/**
 * POST /api/slack/notify/vehicle
 * Share vehicle details to the configured Slack channel
 */
router.post('/notify/vehicle', async (req: Request, res: Response) => {
  try {
    const { vehicleData, message } = req.body;
    
    if (!vehicleData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle data is required' 
      });
    }
    
    const success = await slack.shareVehicleToSlack(vehicleData, message);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to share vehicle to Slack' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Vehicle shared successfully' 
    });
  } catch (error: any) {
    console.error('Slack vehicle notification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to share vehicle: ${error.message}` 
    });
  }
});

/**
 * POST /api/slack/notify/event
 * Share event details to the configured Slack channel
 */
router.post('/notify/event', async (req: Request, res: Response) => {
  try {
    const { eventData, message } = req.body;
    
    if (!eventData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event data is required' 
      });
    }
    
    const success = await slack.shareEventToSlack(eventData, message);
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to share event to Slack' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Event shared successfully' 
    });
  } catch (error: any) {
    console.error('Slack event notification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to share event: ${error.message}` 
    });
  }
});

/**
 * POST /api/slack/message
 * Send a custom message to the configured Slack channel
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { text, blocks } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message text is required' 
      });
    }
    
    const success = await sendSlackMessage({
      channel: process.env.SLACK_CHANNEL_ID || '',
      text,
      blocks
    });
    
    if (!success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send message to Slack' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } catch (error: any) {
    console.error('Slack message error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Failed to send message: ${error.message}` 
    });
  }
});

export default router;