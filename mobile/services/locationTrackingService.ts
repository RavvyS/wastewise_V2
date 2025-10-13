import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { apiGet, API_ENDPOINTS } from '../utils/api';
import { sendCenterNotification } from './notificationService';
import { NOTIFICATION_CONFIG } from '../utils/notificationConfig';

const LOCATION_TASK_NAME = 'background-location-task';

// Calculate distance using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      console.log('Background location update:', location.coords);
      
      try {
        // Fetch all recycling centers
        const centers = await apiGet(API_ENDPOINTS.CENTERS);
        
        // Check distance to each center
        for (const center of centers) {
          if (center.latitude && center.longitude) {
            const distance = calculateDistance(
              location.coords.latitude,
              location.coords.longitude,
              parseFloat(center.latitude),
              parseFloat(center.longitude)
            );

            console.log(`Distance to ${center.name}: ${Math.round(distance)}m`);

            // If within threshold, send notification
            if (distance <= NOTIFICATION_CONFIG.distanceThreshold) {
              console.log(`User is near ${center.name}! Checking notification...`);
              await sendCenterNotification(center, distance);
            }
          }
        }
      } catch (error) {
        console.error('Error checking nearby centers:', error);
      }
    }
  }
});

// Start background location tracking
export const startLocationTracking = async (): Promise<boolean> => {
  try {
    // Check if task is already registered
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    
    if (isTaskRegistered) {
      console.log('Location tracking already running');
      return true;
    }

    // Request background location permissions
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('Foreground location permission not granted');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.log('Background location permission not granted');
      return false;
    }

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      distanceInterval: 50, // Update every 50 meters
      timeInterval: NOTIFICATION_CONFIG.locationUpdateInterval, // Or every 1 minute
      foregroundService: {
        notificationTitle: 'WasteWise Location',
        notificationBody: 'Tracking nearby recycling centers',
        notificationColor: '#4CAF50',
      },
    });

    console.log('Location tracking started successfully');
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

// Stop background location tracking
export const stopLocationTracking = async (): Promise<void> => {
  try {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    
    if (isTaskRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Location tracking stopped');
    }
  } catch (error) {
    console.error('Error stopping location tracking:', error);
  }
};

// Check if location tracking is running
export const isLocationTrackingRunning = async (): Promise<boolean> => {
  try {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  } catch (error) {
    console.error('Error checking location tracking status:', error);
    return false;
  }
};

