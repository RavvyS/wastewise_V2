// Notification Configuration - Easy to change for testing
export const NOTIFICATION_CONFIG = {
  // Distance threshold in meters
  // For testing in house: 10-20 meters works well for small areas
  // For production: Set to 200-500 meters
  distanceThreshold: 50, // 15m for testing in small areas like a house
  
  // Time windows for "opening soon" and "closing soon" (in minutes)
  openingSoonWindow: 30,    // Notify 30 minutes before opening
  closingSoonWindow: 30,    // Notify 30 minutes before closing
  
  // Cooldown period - don't notify about same center within this time (in milliseconds)
  cooldownPeriod: 30000,  // 30 seconds (for testing - production: 3600000 for 1 hour)
  
  // Background location tracking interval (in milliseconds)
  locationUpdateInterval: 10000, // Check every 10 seconds for quick testing (production: 60000 for 1 min)
  
  // Notification settings
  enableNotifications: true,
  notificationSound: true,
  notificationVibrate: true,
};

