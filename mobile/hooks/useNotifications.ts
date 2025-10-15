import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
    setupNotifications,
    NotificationType,
    notifyUserRegistration,
    notifyUserLogin,
    notifyUserLogout,
    notifyProfileUpdate,
    notifyWasteLogCreated,
    notifyWasteLogUpdated,
    notifyWasteLogDeleted,
    notifyObjectDetectionSuccess,
    notifyObjectDetectionFailure,
    notifyMilestoneReached,
    notifyDailyGoalAchieved,
    getNotificationHistory,
    markNotificationAsRead,
    clearNotificationHistory
} from '../services/notificationService';

export const useNotifications = () => {
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        // Initialize notifications
        setupNotifications();

        // Listen for notifications while app is running
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('📱 Notification received:', notification);
            // You can handle the notification here if needed
        });

        // Listen for user interactions with notifications
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('📱 Notification response:', response);

            const { type, itemName, detectedItem } = response.notification.request.content.data || {};

            // Handle notification tap actions based on type
            switch (type) {
                case NotificationType.WASTE_LOG_CREATED:
                case NotificationType.WASTE_LOG_UPDATED:
                case NotificationType.WASTE_LOG_DELETED:
                    // Navigate to waste log screen
                    console.log(`Navigate to waste log for item: ${itemName}`);
                    break;

                case NotificationType.DETECTION_SUCCESS:
                    // Navigate to camera or detection result
                    console.log(`Navigate to detection result for: ${detectedItem}`);
                    break;

                case NotificationType.USER_REGISTERED:
                case NotificationType.USER_LOGIN:
                    // Navigate to home or profile
                    console.log('Navigate to home screen');
                    break;

                default:
                    console.log('Handle default notification tap');
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    // Return all notification functions for easy use
    return {
        // User notifications
        notifyUserRegistration,
        notifyUserLogin,
        notifyUserLogout,
        notifyProfileUpdate,

        // Waste log notifications
        notifyWasteLogCreated,
        notifyWasteLogUpdated,
        notifyWasteLogDeleted,

        // Object detection notifications
        notifyObjectDetectionSuccess,
        notifyObjectDetectionFailure,

        // Achievement notifications
        notifyMilestoneReached,
        notifyDailyGoalAchieved,

        // Utility functions
        getNotificationHistory,
        markNotificationAsRead,
        clearNotificationHistory,
    };
};

export default useNotifications;