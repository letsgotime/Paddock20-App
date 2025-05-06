/**
 * API Health Monitoring System
 * 
 * This system monitors the health of all external API dependencies without making
 * unnecessary API calls that would consume quota or resources.
 */

// Import slack client if available (or handle case where it's not available)
let slackClient: any = null;
try {
  // Try to dynamically import slack client
  const { getSlackClient } = require('./slack');
  slackClient = getSlackClient;
} catch (error) {
  console.log('Slack integration not available, alerts will only be logged');
}

// Types for the health monitoring system
export interface ServiceStatus {
  name: string;
  isOperational: boolean;
  lastChecked: Date;
  lastError: string | null;
  consecutiveFailures: number;
  checkInterval: number; // in milliseconds
  endpoint: string;
  checkFn: () => Promise<boolean>;
}

interface HealthCheckResult {
  overallStatus: 'operational' | 'degraded' | 'critical';
  services: {
    [key: string]: {
      status: 'operational' | 'degraded' | 'error';
      lastChecked: Date;
      consecutiveFailures: number;
      lastError: string | null;
    }
  };
  timestamp: Date;
}

// Constants
export const CHECK_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const CRITICAL_FAILURE_THRESHOLD = 3; // Number of consecutive failures to consider critical

// Global service registry
export const services: { [key: string]: ServiceStatus } = {};

/**
 * Register a new service to be monitored
 */
export function registerService(
  name: string,
  endpoint: string,
  checkFn: () => Promise<boolean>,
  checkInterval: number = CHECK_INTERVAL
): void {
  services[name] = {
    name,
    isOperational: true, // Assume operational until first check
    lastChecked: new Date(0), // Set to epoch time to force immediate check
    lastError: null,
    consecutiveFailures: 0,
    checkInterval,
    endpoint,
    checkFn
  };
  
  console.log(`Registered service for health monitoring: ${name}`);
}

/**
 * Check the health of a specific service
 */
export async function checkServiceHealth(serviceName: string): Promise<boolean> {
  const service = services[serviceName];
  
  if (!service) {
    console.error(`Unknown service: ${serviceName}`);
    return false;
  }
  
  const now = new Date();
  const timeSinceLastCheck = now.getTime() - service.lastChecked.getTime();
  
  // Only check if it's been more than the check interval since the last check
  if (timeSinceLastCheck < service.checkInterval) {
    return service.isOperational;
  }
  
  try {
    console.log(`Performing health check for ${serviceName}...`);
    const isHealthy = await service.checkFn();
    
    service.lastChecked = now;
    service.isOperational = isHealthy;
    
    if (isHealthy) {
      // Reset failures on success
      if (service.consecutiveFailures > 0) {
        console.log(`Service ${serviceName} recovered after ${service.consecutiveFailures} consecutive failures`);
      }
      service.consecutiveFailures = 0;
      service.lastError = null;
    } else {
      // Increment failures on error
      service.consecutiveFailures += 1;
      service.lastError = `Health check failed at ${now.toISOString()}`;
      console.error(`Service ${serviceName} health check failed. Consecutive failures: ${service.consecutiveFailures}`);
    }
    
    return isHealthy;
  } catch (error) {
    service.lastChecked = now;
    service.isOperational = false;
    service.consecutiveFailures += 1;
    service.lastError = (error as Error).message;
    
    console.error(`Error checking ${serviceName} health:`, error);
    return false;
  }
}

/**
 * Check the health of all registered services
 */
export async function checkAllServices(): Promise<HealthCheckResult> {
  const results: HealthCheckResult = {
    overallStatus: 'operational',
    services: {},
    timestamp: new Date()
  };
  
  let criticalServicesDown = 0;
  let totalServicesDown = 0;
  
  for (const [name, service] of Object.entries(services)) {
    const isHealthy = await checkServiceHealth(name);
    
    results.services[name] = {
      status: isHealthy ? 'operational' : (service.consecutiveFailures >= CRITICAL_FAILURE_THRESHOLD ? 'error' : 'degraded'),
      lastChecked: service.lastChecked,
      consecutiveFailures: service.consecutiveFailures,
      lastError: service.lastError
    };
    
    if (!isHealthy) {
      totalServicesDown += 1;
      if (service.consecutiveFailures >= CRITICAL_FAILURE_THRESHOLD) {
        criticalServicesDown += 1;
      }
    }
  }
  
  // Determine overall status based on service health
  if (criticalServicesDown > 0) {
    results.overallStatus = 'critical';
  } else if (totalServicesDown > 0) {
    results.overallStatus = 'degraded';
  }
  
  return results;
}

/**
 * Start the health monitoring system with periodic checks
 */
export function startHealthMonitoring(): NodeJS.Timeout {
  // Immediately run first check
  checkAllServices().then(results => {
    console.log(`Initial health check complete. Status: ${results.overallStatus}`);
    
    // Send alerts for any critical failures
    if (results.overallStatus !== 'operational') {
      sendHealthAlert(results);
    }
  });
  
  // Set up interval to run checks periodically
  const interval = setInterval(async () => {
    console.log('Running scheduled health check of all services...');
    const results = await checkAllServices();
    
    if (results.overallStatus !== 'operational') {
      sendHealthAlert(results);
    }
    
    console.log(`Services health check complete. Overall status: ${results.overallStatus}`);
  }, CHECK_INTERVAL);
  
  console.log(`Global API health monitoring started. Checking ${Object.keys(services).length} services every ${CHECK_INTERVAL / (60 * 60 * 1000)} hours`);
  
  return interval;
}

/**
 * Send alerts for health issues
 */
function sendHealthAlert(results: HealthCheckResult): void {
  // Log to console
  console.error('=== API HEALTH ALERT ===');
  console.error(`Status: ${results.overallStatus}`);
  console.error('Services with issues:');
  
  Object.entries(results.services)
    .filter(([_, service]) => service.status !== 'operational')
    .forEach(([name, service]) => {
      console.error(`- ${name}: ${service.status}, Failures: ${service.consecutiveFailures}, Error: ${service.lastError}`);
    });
  
  // Send to Slack if configured
  try {
    if (slackClient && process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
      const slack = slackClient();
      
      if (slack) {
        // Format a nice Slack message
        const blocks = [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 API Health Alert: ${results.overallStatus.toUpperCase()}`,
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Time:* ${results.timestamp.toLocaleString()}`
            }
          },
          {
            type: 'divider'
          }
        ];
        
        // Add affected services
        Object.entries(results.services)
          .filter(([_, service]) => service.status !== 'operational')
          .forEach(([name, service]) => {
            blocks.push({
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${name}*\nStatus: ${service.status}\nConsecutive Failures: ${service.consecutiveFailures}\nLast Error: ${service.lastError}`
              }
            });
          });
        
        // Send the message to the default channel
        slack.chat.postMessage({
          channel: process.env.SLACK_CHANNEL_ID || '',
          blocks,
          text: `API Health Alert: ${results.overallStatus.toUpperCase()}`
        }).catch((error: Error) => {
          console.error('Failed to send Slack alert:', error);
        });
      }
    } else {
      console.log('Slack not configured for alerts. Check SLACK_BOT_TOKEN and SLACK_CHANNEL_ID environment variables.');
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
  
  // Could extend with email alerts, SMS, push notifications, etc.
}

/**
 * Stop the health monitoring system
 */
export function stopHealthMonitoring(interval: NodeJS.Timeout): void {
  clearInterval(interval);
  console.log('API health monitoring stopped');
}