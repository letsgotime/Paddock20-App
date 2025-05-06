/**
 * Format a date object into a string
 * @param date The date to format
 * @param format The format to use
 * @returns A string representation of the date
 */
export const formatDate = (date: Date, format: string): string => {
  if (!date) return '';
  
  if (format === 'h:mm a') {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  if (format === 'MM/dd/yyyy') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  if (format === 'full') {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Default format
  return date.toDateString();
};

/**
 * Get hours difference between two dates
 * @param date1 First date
 * @param date2 Second date
 * @returns Number of hours between dates
 */
export const getHoursDifference = (date1: Date, date2: Date): number => {
  const diff = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diff / (1000 * 60 * 60));
};

/**
 * Check if a date is today
 * @param date The date to check
 * @returns Whether the date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is tomorrow
 * @param date The date to check
 * @returns Whether the date is tomorrow
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear();
};

/**
 * Format a UNIX timestamp to a readable date string
 * @param timestamp UNIX timestamp in seconds
 * @param format Format string
 * @returns Formatted date string
 */
export const formatUnixTimestamp = (timestamp: number, format: string = 'h:mm a'): string => {
  const date = new Date(timestamp * 1000);
  return formatDate(date, format);
};

/**
 * Get a friendly relative time string (e.g. "2 hours ago")
 * @param date The date to compare to now
 * @returns A friendly string representation
 */
export const getRelativeTimeString = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(date, 'short');
  }
};