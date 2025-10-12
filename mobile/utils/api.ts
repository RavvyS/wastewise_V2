// API Configuration
export const API_BASE_URL = __DEV__
    ? 'http://172.28.21.159:5001' // Development - use actual IP for mobile simulator
    : 'https://your-production-api.com'; // Production

export const API_ENDPOINTS = {
    // Authentication
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    ME: '/api/auth/me',
    CHANGE_PASSWORD: '/api/auth/change-password',
    
    // Admin Authentication
    ADMIN_SIGNUP: '/api/auth/admin-signup',
    ADMIN_USERS: '/api/auth/users',
    UPDATE_USER_ROLE: (userId: number) => `/api/auth/users/${userId}/role`,
    UPDATE_USER_STATUS: (userId: number) => `/api/auth/users/${userId}/status`,

    // Waste Logs
    LOGS: '/api/logs',
    LOG_STATS: (userId: number) => `/api/logs/stats/${userId}`,

    // Categories & Items
    CATEGORIES: '/api/categories',
    CATEGORIES_WITH_ITEMS: '/api/categories/with-items',
    ITEMS: '/api/items',

    // Users
    USERS: '/api/users',
};

// Token Management (using simple in-memory storage for demo)
let authToken: string | null = null;

export const getAuthToken = () => {
    return authToken;
};

export const setAuthToken = (token: string) => {
    authToken = token;
};

export const removeAuthToken = () => {
    authToken = null;
};

// API Helper Functions
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    const startTime = Date.now();
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

        // Add authentication token if available
        const token = getAuthToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
            headers,
            signal: controller.signal,
            ...options,
        });

        clearTimeout(timeoutId);

        const duration = Date.now() - startTime;
        console.log(`📡 API Response: ${response.status} ${response.statusText} (${duration}ms)`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`❌ API Error Response:`, errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ API Data received (${data ? Object.keys(data).length : 0} keys, ${duration}ms)`);
        return data;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`❌ API Request Error (${duration}ms):`, error);
        throw error;
    }
};

export const apiGet = (endpoint: string) => apiRequest(endpoint);

export const apiPost = (endpoint: string, data: any) =>
    apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    });

export const apiPut = (endpoint: string, data: any) =>
    apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

export const apiDelete = (endpoint: string) =>
    apiRequest(endpoint, { method: 'DELETE' });

// Authentication API Functions
export const signup = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
}) => {
    const response = await apiPost(API_ENDPOINTS.SIGNUP, userData);
    if (response.token) {
        setAuthToken(response.token);
    }
    return response;
};

export const login = async (credentials: {
    email: string;
    password: string;
}) => {
    console.log("🔑 Attempting login for email:", credentials.email);
    try {
        const response = await apiPost(API_ENDPOINTS.LOGIN, credentials);
        console.log("📥 Login response received:", response);
        
        if (response.token) {
            console.log("✅ Token received, setting auth token");
            setAuthToken(response.token);
            console.log("✅ Auth token set successfully");
        } else {
            console.log("❌ No token in response");
        }
        
        return response;
    } catch (error) {
        console.error("❌ Login error:", error);
        throw error;
    }
};

export const logout = () => {
    console.log("🚪 Logging out user...");
    console.log("🔍 Current auth token before logout:", authToken ? "EXISTS" : "NULL");
    
    // Clear the auth token
    removeAuthToken();
    
    console.log("🔍 Auth token after removal:", authToken ? "STILL EXISTS" : "NULL");
    console.log("✅ Logout process completed");
};

export const getCurrentUser = async () => {
    return await apiGet(API_ENDPOINTS.ME);
};

export const changePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
}) => {
    return await apiPut(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
};

// Admin Authentication Functions
export const adminSignup = async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'user' | 'manager' | 'admin';
}) => {
    return await apiPost(API_ENDPOINTS.ADMIN_SIGNUP, userData);
};

export const getAllUsers = async () => {
    return await apiGet(API_ENDPOINTS.ADMIN_USERS);
};

export const updateUserRole = async (userId: number, role: 'user' | 'manager' | 'admin') => {
    return await apiPut(API_ENDPOINTS.UPDATE_USER_ROLE(userId), { role });
};

export const updateUserStatus = async (userId: number, isActive: boolean) => {
    return await apiPut(API_ENDPOINTS.UPDATE_USER_STATUS(userId), { isActive });
};