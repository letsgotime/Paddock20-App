/**
 * Fallback data for drive recommendations when the API is not available
 * Used to ensure UI components have data to display when API calls fail
 */

export const fallbackDriveWindows = [
  {
    day: "Today",
    timeRange: "2PM - 5PM",
    rating: 4,
    description: "Optimal grip conditions with dry surface and mild temperatures",
    conditions: "Good",
    colorClass: "from-green-900/30 to-green-800/20",
    borderClass: "border-green-800/30"
  },
  {
    day: "Tomorrow",
    timeRange: "10AM - 1PM",
    rating: 3,
    description: "Good conditions with light winds and medium grip potential",
    conditions: "Good",
    colorClass: "from-blue-900/30 to-blue-800/20",
    borderClass: "border-blue-800/30"
  },
  {
    day: "Tomorrow",
    timeRange: "4PM - 6PM",
    rating: 2,
    description: "Moderate conditions with potential for reduced visibility",
    conditions: "Moderate",
    colorClass: "from-yellow-900/30 to-yellow-800/20",
    borderClass: "border-yellow-800/30"
  }
];

export const fallbackDrivingTips = [
  {
    tip: "Reduced brake cooling efficiency expected. Allow 15-20% more cooling time between hard braking zones."
  },
  {
    tip: "Surface grip will peak 2-3 hours after sunrise due to optimal asphalt temperature window."
  },
  {
    tip: "Current air density suggests 2-3% power reduction. Adjust driving style accordingly."
  }
];

export const fallbackPerformanceAdjustments = [
  {
    adjustment: "For naturally aspirated engines: Expect 2.1% torque reduction due to current air density factors."
  },
  {
    adjustment: "For turbocharged engines: Recalibrate boost by 1-2% to compensate for decreased atmospheric pressure."
  },
  {
    adjustment: "Brake bias: Consider 1-2% forward adjustment to account for current surface conditions."
  }
];