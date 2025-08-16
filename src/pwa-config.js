// PWA Configuration for DailySchedule App
export const pwaConfig = {
    // App information
    appName: 'DailySchedule',
    appShortName: 'DailySchedule',
    appDescription: 'Professional daily schedule and time tracking application',

    // Caching strategies
    cacheStrategies: {
        // Static assets (CSS, JS, images)
        staticAssets: {
            strategy: 'CacheFirst',
            cacheName: 'daily-schedule-static-v1',
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },

        // API responses
        apiResponses: {
            strategy: 'NetworkFirst',
            cacheName: 'daily-schedule-api-v1',
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
        },

        // User data
        userData: {
            strategy: 'CacheFirst',
            cacheName: 'daily-schedule-user-data-v1',
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
    },

    // Offline fallback
    offlineFallback: {
        page: '/offline.html',
        image: '/offline-image.png',
    },

    // Background sync
    backgroundSync: {
        enabled: true,
        queueName: 'daily-schedule-sync',
        maxRetentionTime: 60 * 60 * 24, // 24 hours
    },

    // Push notifications
    pushNotifications: {
        enabled: false, // Can be enabled later
        vapidPublicKey: '', // Add your VAPID public key here
    },

    // Update notification
    updateNotification: {
        enabled: true,
        title: 'New version available',
        body: 'A new version of DailySchedule is available. Click to update.',
        actionText: 'Update',
    },
};

// Cache names for different types of content
export const cacheNames = {
    STATIC: 'daily-schedule-static-v1',
    API: 'daily-schedule-api-v1',
    USER_DATA: 'daily-schedule-user-data-v1',
    FONTS: 'daily-schedule-fonts-v1',
    IMAGES: 'daily-schedule-images-v1',
};

// Routes to cache
export const routesToCache = [
    '/',
    '/categories',
    '/schedules',
    '/tracker',
    '/analytics',
];

// Assets to cache
export const assetsToCache = [
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/favicon.svg',
    '/logo-192.png',
    '/logo-512.png',
    '/icon-144.png',
];

// API endpoints to cache
export const apiEndpointsToCache = [
    '/api/categories',
    '/api/schedules',
    '/api/time-tracking',
    '/api/analytics',
];
