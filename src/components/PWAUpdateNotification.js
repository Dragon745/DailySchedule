import React, { useState, useEffect } from 'react';

const PWAUpdateNotification = () => {
    const [showUpdateNotification, setShowUpdateNotification] = useState(false);
    const [registration, setRegistration] = useState(null);

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg);

                // Listen for service worker updates
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content is available
                            setShowUpdateNotification(true);
                        }
                    });
                });
            });
        }
    }, []);

    const handleUpdate = () => {
        if (registration && registration.waiting) {
            // Send message to service worker to skip waiting
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });

            // Reload the page to activate the new service worker
            window.location.reload();
        }
    };

    const handleDismiss = () => {
        setShowUpdateNotification(false);
    };

    if (!showUpdateNotification) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-medium">
                        A new version of DailySchedule is available!
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleUpdate}
                        className="bg-white text-blue-600 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        Update Now
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="text-blue-100 hover:text-white text-sm font-medium px-3 py-2 rounded-md transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PWAUpdateNotification;
