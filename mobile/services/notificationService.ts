import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_CONFIG } from '../utils/notificationConfig';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: NOTIFICATION_CONFIG.notificationSound,
    shouldSetBadge: false,
  } as any),
});

// Store of recently notified centers to prevent spam
const notifiedCenters: Map<number, number> = new Map();

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
      console.log('Notification permissions not granted');
      return false;
    }

    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('recycling-centers', {
        name: 'Recycling Centers',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    console.log('Notifications setup complete');
    return true;
  } catch (error) {
    console.error('Error setting up notifications:', error);
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
  if (!center.hours) {
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  const operatingHours = parseOperatingHours(center.hours);
  const todayAbbr = getTodayAbbreviation();
  const todayHours = operatingHours.find(h => h.day === todayAbbr);

  if (!todayHours) {
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  // Parse opening and closing times
  const timeRange = todayHours.hours.split(' - ');
  if (timeRange.length !== 2) {
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  const openTime = parseTimeToDate(timeRange[0]);
  const closeTime = parseTimeToDate(timeRange[1]);
  
  if (!openTime || !closeTime) {
    return { shouldNotify: false, notificationType: null, message: '' };
  }

  const now = new Date();
  const openingSoonTime = new Date(openTime.getTime() - NOTIFICATION_CONFIG.openingSoonWindow * 60000);
  const closingSoonTime = new Date(closeTime.getTime() - NOTIFICATION_CONFIG.closingSoonWindow * 60000);

  // Check if center is currently open
  const isOpen = now >= openTime && now < closeTime;

  // Opening soon (within 30 minutes before opening)
  if (!isOpen && now >= openingSoonTime && now < openTime) {
    return {
      shouldNotify: true,
      notificationType: 'opening-soon',
      message: `🏢 ${center.name} opens at ${timeRange[0]}`,
    };
  }

  // Closing soon (within 30 minutes before closing)
  if (isOpen && now >= closingSoonTime && now < closeTime) {
    return {
      shouldNotify: true,
      notificationType: 'closing-soon',
      message: `⏰ ${center.name} closes at ${timeRange[1]} - Hurry!`,
    };
  }

  // Currently open
  if (isOpen) {
    return {
      shouldNotify: true,
      notificationType: 'currently-open',
      message: `✅ ${center.name} is open now`,
    };
  }

  return { shouldNotify: false, notificationType: null, message: '' };
};

// Send notification for a nearby center
export const sendCenterNotification = async (
  center: any,
  distance: number
): Promise<void> => {
  try {
    // Check cooldown period
    const lastNotified = notifiedCenters.get(center.id);
    const now = Date.now();
    
    if (lastNotified && (now - lastNotified) < NOTIFICATION_CONFIG.cooldownPeriod) {
      console.log(`Cooldown active for center ${center.id}`);
      return;
    }

    // Get center status
    const status = getCenterStatus(center);
    
    if (!status.shouldNotify) {
      console.log(`No notification needed for center ${center.id}`);
      return;
    }

    // Format distance
    const distanceText = distance < 1000 
      ? `${Math.round(distance)}m away`
      : `${(distance / 1000).toFixed(1)}km away`;

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
    console.log(`Notification sent for center ${center.id}: ${status.message}`);
  } catch (error) {
    console.error('Error sending notification:', error);
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

