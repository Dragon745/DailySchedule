import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        // Check if app is already installed
        const checkIfInstalled = () => {
            if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
                setIsInstalled(true);
                return true;
            }
            if (window.navigator.standalone === true) {
                setIsInstalled(true);
                return true;
            }
            return false;
        };

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            console.log('🎉 beforeinstallprompt event fired!');
            console.log('Event details:', e);

            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();

            // Stash the event so it can be triggered later
            setDeferredPrompt(e);

            // Show the install prompt immediately
            setShowInstallPrompt(true);

            setDebugInfo('Install prompt available!');
        };

        // Listen for appinstalled event
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setDeferredPrompt(null);
            console.log('✅ PWA was installed');
            setDebugInfo('App installed successfully!');
        };

        // Check if already installed
        if (!checkIfInstalled()) {
            // Add event listeners
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.addEventListener('appinstalled', handleAppInstalled);

            // Show manual install prompt for mobile after 3 seconds if no automatic prompt
            setTimeout(() => {
                if (!isInstalled && !showInstallPrompt && !deferredPrompt) {
                    console.log('📱 Showing manual install prompt for mobile');
                    setShowInstallPrompt(true);
                    setDebugInfo('Manual install prompt for mobile');
                }
            }, 3000);

            // Debug information
            console.log('🔍 PWA Install Prompt Debug Info:');
            console.log('- Service Worker supported:', 'serviceWorker' in navigator);
            console.log('- BeforeInstallPrompt supported:', 'onbeforeinstallprompt' in window);
            console.log('- Display mode:', window.matchMedia('(display-mode: standalone)').matches);
            console.log('- User agent:', navigator.userAgent);

            setDebugInfo('Waiting for install prompt...');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [deferredPrompt, isInstalled, showInstallPrompt]);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            console.log('❌ No deferred prompt available');
            return;
        }

        console.log('🚀 Triggering install prompt...');

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('✅ User accepted the install prompt');
            setDebugInfo('Installation accepted!');
        } else {
            console.log('❌ User dismissed the install prompt');
            setDebugInfo('Installation dismissed');
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        setDebugInfo('Install prompt dismissed');
    };

    const showManualInstallInstructions = () => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS) {
            alert('To install on iOS:\n1. Tap the Share button (square with arrow)\n2. Tap "Add to Home Screen"\n3. Tap "Add"');
        } else if (isAndroid) {
            alert('To install on Android:\n1. Tap the menu button (3 dots)\n2. Tap "Add to Home screen"\n3. Tap "Add"');
        } else {
            alert('To install:\n1. Click the install icon in your browser address bar\n2. Or use browser menu: More tools > Create shortcut');
        }
    };

    // Don't show if already installed
    if (isInstalled) {
        return null;
    }

    // Show debug info in development
    const isDevelopment = process.env.NODE_ENV === 'development';

    return (
        <>
            {/* Debug info in development */}
            {isDevelopment && (
                <div className="fixed top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-xs z-50">
                    <strong>PWA Debug:</strong> {debugInfo}
                </div>
            )}

            {/* Install Prompt */}
            {showInstallPrompt && (
                <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:bottom-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm mx-auto lg:mx-0">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-gray-900">Install DailySchedule</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Add this app to your home screen for quick access and offline use.
                                </p>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-3 flex space-x-2">
                            <button
                                onClick={deferredPrompt ? handleInstallClick : showManualInstallInstructions}
                                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                {deferredPrompt ? 'Install' : 'How to Install'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PWAInstallPrompt;
