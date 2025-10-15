import React, { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { setupNotifications } from '../services/notificationService';
import { startLocationTracking } from '../services/locationTrackingService';

export default function NotificationHandler() {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Setup notifications and start location tracking
    const initialize = async () => {
      console.log('Initializing notifications and location tracking...');
      
      // Setup notifications
      const notificationSetup = await setupNotifications();
      if (notificationSetup) {
        console.log('Notifications setup successful');
      }

      // Start location tracking
      const locationTracking = await startLocationTracking();
      if (locationTracking) {
        console.log('Location tracking started successfully');
      } else {
        console.log('Location tracking failed to start');
      }
    };

    initialize();

    // Listen for notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received in foreground:', notification);
    });

    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      
      if (data.screen === 'MapView' && data.centerId) {
        console.log('Navigating to MapView for center:', data.centerId);
        
        // Navigate to MapViewScreen with center ID and auto-open flag
        router.push({
          pathname: '/screens/recyclingcenters/MapViewScreen',
          params: {
            centerId: data.centerId.toString(),
            autoOpen: 'true',
          },
        });
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
}

