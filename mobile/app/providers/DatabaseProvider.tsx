// app/providers/DatabaseProvider.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import SQLiteService from '../../services/sqliteService';

// Define the component props (it expects children to render the rest of the app)
interface DatabaseProviderProps {
    children: React.ReactNode;
}

export default function DatabaseProvider({ children }: DatabaseProviderProps) {
    const [isDbReady, setIsDbReady] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const setupDb = async () => {
            try {
                // Initialize the database, create tables, and insert mock data
                await SQLiteService.initializeDatabase();
                setIsDbReady(true);
            } catch (err) {
                console.error("Database initialization failed:", err);
                setError("Failed to initialize database.");
            }
        };

        setupDb();
    }, []);

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Startup Error: {error}</Text>
            </View>
        );
    }

    if (!isDbReady) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text>Preparing learning materials...</Text>
            </View>
        );
    }

    // Database is ready, render the children (the rest of the app)
    return <>{children}</>;
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    }
});