module.exports = {
    globDirectory: 'build/',
    globPatterns: [
        '**/*.{js,css,html,png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}',
        'manifest.json'
    ],
    swDest: 'build/service-worker.js',
    swSrc: 'src/serviceWorker.js',

    // Runtime caching strategies
    runtimeCaching: [
        // Cache API requests
        {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'daily-schedule-api-v1',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },

        // Cache Firebase Auth
        {
            urlPattern: /^https:\/\/identitytoolkit\.googleapis\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'daily-schedule-auth-v1',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
            },
        },

        // Cache static assets
        {
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'daily-schedule-static-v1',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
            },
        },

        // Cache HTML pages
        {
            urlPattern: /^https:\/\/.*\/.*$/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'daily-schedule-pages-v1',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24, // 1 day
                },
            },
        },
    ],

    // Skip waiting for service worker updates
    skipWaiting: true,
    clientsClaim: true,

    // Clean up old caches
    cleanupOutdatedCaches: true,

    // Source maps for debugging
    sourcemap: true,

    // Maximum file size to cache
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
};
