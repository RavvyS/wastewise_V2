/**
 * EcoZen Brand Colors
 * Based on the logo design with green sustainability theme and navy blue accents
 */

export const Colors = {
    // Primary EcoZen Brand Colors
    primary: '#1B4A5C', // Navy blue from logo
    primaryLight: '#2B5A6C',
    primaryDark: '#0B3A4C',

    // Secondary Green Colors (from recycling arrows)
    secondary: '#4CAF50', // Main green
    secondaryLight: '#81C784',
    secondaryDark: '#2E7D32',

    // Accent Green (brighter for highlights)
    accent: '#66BB6A',
    accentLight: '#A5D6A7',

    // Background Colors
    background: '#FFFFFF',
    backgroundLight: '#F8F9FA',
    backgroundDark: '#F5F5F5',

    // Text Colors
    text: '#1B4A5C', // Primary navy
    textSecondary: '#546E7A',
    textLight: '#78909C',
    textWhite: '#FFFFFF',

    // UI Element Colors
    surface: '#FFFFFF',
    surfaceVariant: '#F1F4F6',
    border: '#E0E0E0',
    borderLight: '#F0F0F0',

    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    // Shadow and Overlay
    shadow: 'rgba(27, 74, 92, 0.1)',
    overlay: 'rgba(27, 74, 92, 0.5)',

    // Gradient Colors
    gradientStart: '#4CAF50',
    gradientEnd: '#1B4A5C',
};

export const lightTheme = {
    ...Colors,
    mode: 'light' as const,
};

export const darkTheme = {
    ...Colors,
    background: '#121212',
    backgroundLight: '#1E1E1E',
    backgroundDark: '#0A0A0A',
    surface: '#1E1E1E',
    surfaceVariant: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B0BEC5',
    textLight: '#90A4AE',
    border: '#333333',
    borderLight: '#404040',
    mode: 'dark' as const,
};