import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NOTIFICATION_CONFIG } from '../utils/notificationConfig';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: NOTIFICATION_CONFIG.notificationSound,
    shouldSetBadge: true,
  } as any),
});

// Store of recently notified centers to prevent spam
const notifiedCenters: Map<number, number> = new Map();

// Notification Types
export enum NotificationType {
  // User Management
  USER_REGISTERED = 'USER_REGISTERED',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_PROFILE_UPDATED = 'USER_PROFILE_UPDATED',

  // Waste Log Operations
  WASTE_LOG_CREATED = 'WASTE_LOG_CREATED',
  WASTE_LOG_UPDATED = 'WASTE_LOG_UPDATED',
  WASTE_LOG_DELETED = 'WASTE_LOG_DELETED',

  // Object Detection
  OBJECT_DETECTED = 'OBJECT_DETECTED',
  DETECTION_SUCCESS = 'DETECTION_SUCCESS',
  DETECTION_FAILED = 'DETECTION_FAILED',

  // Recycling Centers
  NEARBY_CENTER = 'NEARBY_CENTER',

  // Achievements & Milestones
  MILESTONE_REACHED = 'MILESTONE_REACHED',
  DAILY_GOAL_ACHIEVED = 'DAILY_GOAL_ACHIEVED',
}

export const setupNotifications = async () => {
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions not granted');
      return false;
    }

    // Configure notification channels for Android
    if (Platform.OS === 'android') {
      // User actions channel
      await Notifications.setNotificationChannelAsync('user_actions', {
        name: 'User Actions',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        description: 'Notifications for user registration, login, and profile updates',
      });

      // Waste log channel
      await Notifications.setNotificationChannelAsync('waste_log', {
        name: 'Waste Log',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        description: 'Notifications for waste log operations',
      });

      // Object detection channel
      await Notifications.setNotificationChannelAsync('detection', {
        name: 'Object Detection',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF9800',
        description: 'Notifications for object detection results',
      });

      // Recycling centers channel (existing)
      await Notifications.setNotificationChannelAsync('recycling_centers', {
        name: 'Recycling Centers',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        description: 'Notifications for nearby recycling centers',
      });

      // Achievements channel
      await Notifications.setNotificationChannelAsync('achievements', {
        name: 'Achievements',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#9C27B0',
        description: 'Notifications for milestones and achievements',
      });
    }

    console.log('✅ Notifications setup complete');
    return true;
  } catch (error) {
    console.error('❌ Error setting up notifications:', error);
    return false;
  }
};

// Parse operating hours to check if center is open
interface OperatingHours {
  day: string;
  hours: string;
}

const parseOperatingHours = (hoursString?: string): OperatingHours[] => {
  if (!hoursString) return [];

  const dayHours = hoursString.split(', ').map(dayHour => {
    const [day, hours] = dayHour.split(': ');
    return { day: day?.trim() || '', hours: hours?.trim() || '' };
  }).filter(item => item.day && item.hours);

  return dayHours;
};

// Get today's day abbreviation (Mon, Tue, etc.)
const getTodayAbbreviation = (): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
};

// Parse time string like "09:00 AM" to Date object for today
const parseTimeToDate = (timeString: string): Date | null => {
  try {
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return null;

    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing time:', error);
    return null;
  }
};

// Check center status and return notification info
export const getCenterStatus = (center: any): {
  shouldNotify: boolean;
  notificationType: 'opening-soon' | 'closing-soon' | 'currently-open' | null;
  message: string;
} => {
  const timestamp = new Date().toLocaleTimeString();

  if (!center.hours) {
    console.log(`[${timestamp}] ℹ️  "${center.name}" has no operating hours`);
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  const operatingHours = parseOperatingHours(center.hours);
  const todayAbbr = getTodayAbbreviation();
  const todayHours = operatingHours.find(h => h.day === todayAbbr);

  if (!todayHours) {
    console.log(`[${timestamp}] ℹ️  "${center.name}" is closed today (${todayAbbr})`);
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  // Parse opening and closing times
  const timeRange = todayHours.hours.split(' - ');
  if (timeRange.length !== 2) {
    console.log(`[${timestamp}] ⚠️  "${center.name}" has invalid time format: ${todayHours.hours}`);
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  const openTime = parseTimeToDate(timeRange[0]);
  const closeTime = parseTimeToDate(timeRange[1]);

  if (!openTime || !closeTime) {
    console.log(`[${timestamp}] ⚠️  "${center.name}" failed to parse times: ${timeRange[0]} - ${timeRange[1]}`);
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  const now = new Date();
  const openingSoonTime = new Date(openTime.getTime() - NOTIFICATION_CONFIG.openingSoonWindow * 60000);
  const closingSoonTime = new Date(closeTime.getTime() - NOTIFICATION_CONFIG.closingSoonWindow * 60000);

  // Check if center is currently open
  const isOpen = now >= openTime && now < closeTime;

  console.log(`[${timestamp}] 🕐 "${center.name}" status check:`);
  console.log(`[${timestamp}]    Current time: ${now.toLocaleTimeString()}`);
  console.log(`[${timestamp}]    Opens: ${openTime.toLocaleTimeString()}`);
  console.log(`[${timestamp}]    Closes: ${closeTime.toLocaleTimeString()}`);
  console.log(`[${timestamp}]    Is Open: ${isOpen}`);

  // Opening soon (within 30 minutes before opening)
  if (!isOpen && now >= openingSoonTime && now < openTime) {
    console.log(`[${timestamp}] ✅ "${center.name}" is opening soon!`);
    return {
      shouldNotify: true,
      notificationType: 'opening-soon',
      message: `🏢 ${center.name} opens at ${timeRange[0]}`,
    };
  }

  // Closing soon (within 30 minutes before closing)
  if (isOpen && now >= closingSoonTime && now < closeTime) {
    console.log(`[${timestamp}] ✅ "${center.name}" is closing soon!`);
    return {
      shouldNotify: true,
      notificationType: 'closing-soon',
      message: `⏰ ${center.name} closes at ${timeRange[1]} - Hurry!`,
    };
  }

  // Currently open
  if (isOpen) {
    console.log(`[${timestamp}] ✅ "${center.name}" is currently open!`);
    return {
      shouldNotify: true,
      notificationType: 'currently-open',
      message: `✅ ${center.name} is open now`,
    };
  }

  console.log(`[${timestamp}] ❌ "${center.name}" is closed (not in notification window)`);
  return { shouldNotify: false, notificationType: null, message: '' };
};

// Send notification for a nearby center
export const sendCenterNotification = async (
  center: any,
  distance: number
): Promise<void> => {
  try {
    const timestamp = new Date().toLocaleTimeString();

    // Check cooldown period
    const lastNotified = notifiedCenters.get(center.id);
    const now = Date.now();

    if (lastNotified && (now - lastNotified) < NOTIFICATION_CONFIG.cooldownPeriod) {
      const cooldownRemaining = Math.round((NOTIFICATION_CONFIG.cooldownPeriod - (now - lastNotified)) / 1000);
      console.log(`[${timestamp}] ⏳ Cooldown active for "${center.name}" - ${cooldownRemaining}s remaining`);
      return;
    }

    // Get center status
    const status = getCenterStatus(center);

    if (!status.shouldNotify) {
      console.log(`[${timestamp}] ⏸️  No notification needed for "${center.name}" - Status: ${status.notificationType || 'closed/not in notification window'}`);
      return;
    }

    // Format distance
    const distanceText = distance < 1000
      ? `${Math.round(distance)}m away`
      : `${(distance / 1000).toFixed(1)}km away`;

    console.log(`[${timestamp}] 🔔 SENDING NOTIFICATION for "${center.name}"`);
    console.log(`[${timestamp}]    Type: ${status.notificationType}`);
    console.log(`[${timestamp}]    Message: ${status.message}`);
    console.log(`[${timestamp}]    Distance: ${distanceText}`);

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: status.message,
        body: `Only ${distanceText}!`,
        data: {
          centerId: center.id,
          screen: 'MapView',
          action: 'showCenter',
        },
        sound: NOTIFICATION_CONFIG.notificationSound,
        vibrate: NOTIFICATION_CONFIG.notificationVibrate ? [0, 250, 250, 250] : undefined,
      },
      trigger: null, // Send immediately
    });

    // Update cooldown
    notifiedCenters.set(center.id, now);
    console.log(`[${timestamp}] ✅ Notification sent successfully for "${center.name}"`);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};

// Clear cooldown for a specific center (useful for testing)
export const clearCenterCooldown = (centerId: number) => {
  notifiedCenters.delete(centerId);
};

// Clear all cooldowns (useful for testing)
export const clearAllCooldowns = () => {
  notifiedCenters.clear();
};

// Enhanced notification functions for comprehensive app notifications

// Helper function to get channel ID based on notification type
const getChannelId = (type: NotificationType): string => {
  switch (type) {
    case NotificationType.USER_REGISTERED:
    case NotificationType.USER_LOGIN:
    case NotificationType.USER_LOGOUT:
    case NotificationType.USER_PROFILE_UPDATED:
      return 'user_actions';

    case NotificationType.WASTE_LOG_CREATED:
    case NotificationType.WASTE_LOG_UPDATED:
    case NotificationType.WASTE_LOG_DELETED:
      return 'waste_log';

    case NotificationType.OBJECT_DETECTED:
    case NotificationType.DETECTION_SUCCESS:
    case NotificationType.DETECTION_FAILED:
      return 'detection';

    case NotificationType.NEARBY_CENTER:
      return 'recycling_centers';

    case NotificationType.MILESTONE_REACHED:
    case NotificationType.DAILY_GOAL_ACHIEVED:
      return 'achievements';

    default:
      return 'user_actions';
  }
};

// Save notification to history
const saveNotificationHistory = async (notification: any): Promise<void> => {
  try {
    const existingHistory = await AsyncStorage.getItem('notification_history');
    const history = existingHistory ? JSON.parse(existingHistory) : [];

    history.unshift({
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false,
    });

    // Keep only last 100 notifications
    const trimmedHistory = history.slice(0, 100);

    await AsyncStorage.setItem('notification_history', JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('❌ Error saving notification history:', error);
  }
};

// Generic function to send notifications
export const sendAppNotification = async (
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> => {
  try {
    const channelId = getChannelId(type);

    const notificationData = {
      title,
      body,
      data: {
        type,
        timestamp: new Date().toISOString(),
        ...data,
      },
      sound: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: notificationData,
      trigger: null,
      ...(Platform.OS === 'android' && { identifier: channelId }),
    });

    // Save to history
    await saveNotificationHistory({ type, title, body, data });

    console.log('📱 Notification sent:', title);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};

// User Management Notifications
export const notifyUserRegistration = async (userName?: string): Promise<void> => {
  await sendAppNotification(
    NotificationType.USER_REGISTERED,
    '🎉 Welcome to EcoZen!',
    `Account created successfully${userName ? ` for ${userName}` : ''}. Start your recycling journey now!`,
    { userName }
  );
};

export const notifyUserLogin = async (userName?: string): Promise<void> => {
  await sendAppNotification(
    NotificationType.USER_LOGIN,
    '👋 Welcome back!',
    `Hello ${userName || 'User'}, ready to continue your eco-journey?`,
    { userName }
  );
};

export const notifyUserLogout = async (): Promise<void> => {
  await sendAppNotification(
    NotificationType.USER_LOGOUT,
    '👋 See you later!',
    'You have been logged out successfully. Thanks for using EcoZen!'
  );
};

export const notifyProfileUpdate = async (): Promise<void> => {
  await sendAppNotification(
    NotificationType.USER_PROFILE_UPDATED,
    '✅ Profile Updated',
    'Your profile information has been updated successfully.'
  );
};

// Waste Log Notifications
export const notifyWasteLogCreated = async (itemName?: string, quantity?: number): Promise<void> => {
  await sendAppNotification(
    NotificationType.WASTE_LOG_CREATED,
    '📝 New Waste Log Entry',
    `Added ${quantity}kg of ${itemName || 'waste'} to your recycling log! Keep up the great work!`,
    { itemName, quantity, action: 'created' }
  );
};

export const notifyWasteLogUpdated = async (itemName?: string, quantity?: number): Promise<void> => {
  await sendAppNotification(
    NotificationType.WASTE_LOG_UPDATED,
    '✏️ Waste Log Updated',
    `Updated entry: ${itemName || 'waste item'} (${quantity}kg). Your recycling data is now current.`,
    { itemName, quantity, action: 'updated' }
  );
};

export const notifyWasteLogDeleted = async (itemName?: string): Promise<void> => {
  await sendAppNotification(
    NotificationType.WASTE_LOG_DELETED,
    '🗑️ Waste Log Entry Removed',
    `Removed "${itemName || 'waste item'}" from your recycling log.`,
    { itemName, action: 'deleted' }
  );
};

// Object Detection Notifications
export const notifyObjectDetectionSuccess = async (detectedItem?: string, confidence?: number): Promise<void> => {
  const confidenceText = confidence ? ` (${Math.round(confidence * 100)}% confidence)` : '';
  await sendAppNotification(
    NotificationType.DETECTION_SUCCESS,
    '🔍 Object Detected!',
    `Successfully identified: ${detectedItem || 'Unknown item'}${confidenceText}`,
    { detectedItem, confidence, success: true }
  );
};

export const notifyObjectDetectionFailure = async (): Promise<void> => {
  await sendAppNotification(
    NotificationType.DETECTION_FAILED,
    '❌ Detection Failed',
    'Unable to identify the object. Try taking a clearer photo with better lighting.',
    { success: false }
  );
};

// Achievement Notifications
export const notifyMilestoneReached = async (milestone: string, description: string): Promise<void> => {
  await sendAppNotification(
    NotificationType.MILESTONE_REACHED,
    '🏆 Milestone Achieved!',
    `${milestone}: ${description}`,
    { milestone, description }
  );
};

export const notifyDailyGoalAchieved = async (quantity: number): Promise<void> => {
  await sendAppNotification(
    NotificationType.DAILY_GOAL_ACHIEVED,
    '🎯 Daily Goal Achieved!',
    `Fantastic! You've recycled ${quantity}kg today. You're making a real difference!`,
    { quantity, date: new Date().toDateString() }
  );
};

// Utility functions
export const getNotificationHistory = async (): Promise<any[]> => {
  try {
    const history = await AsyncStorage.getItem('notification_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('❌ Error getting notification history:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const history = await getNotificationHistory();
    const updatedHistory = history.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );

    await AsyncStorage.setItem('notification_history', JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
  }
};

export const clearNotificationHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('notification_history');
    await Notifications.dismissAllNotificationsAsync();
    console.log('✅ Notification history cleared');
  } catch (error) {
    console.error('❌ Error clearing notification history:', error);
  }
};

