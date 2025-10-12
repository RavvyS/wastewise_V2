// Notification Configuration - Easy to change for testing
export const NOTIFICATION_CONFIG = {
  // Distance threshold in meters
  // For testing: Set to 10-50 meters to test by walking around your home
  // For production: Set to 200-500 meters
  distanceThreshold: 50, // CHANGE THIS for testing (default: 50m for testing)
  
  // Time windows for "opening soon" and "closing soon" (in minutes)
  openingSoonWindow: 30,    // Notify 30 minutes before opening
  closingSoonWindow: 30,    // Notify 30 minutes before closing
  
  // Cooldown period - don't notify about same center within this time (in milliseconds)
  cooldownPeriod: 3600000,  // 1 hour (3600000 ms)
  
  // Background location tracking interval (in milliseconds)
  locationUpdateInterval: 60000, // Check every 1 minute
  
  // Notification settings
  enableNotifications: true,
  notificationSound: true,
  notificationVibrate: true,
};

