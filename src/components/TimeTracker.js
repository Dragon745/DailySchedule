import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase.config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, limit } from 'firebase/firestore';

const TimeTracker = ({ user, goBack, navigateToView }) => {
    const [categories, setCategories] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [recentSessions, setRecentSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentlyTracking, setCurrentlyTracking] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(new Date());

    const loadData = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Load categories
            const categoriesQuery = query(
                collection(db, 'categories'),
                where('uid', '==', user.uid),
                where('isActive', '==', true),
                orderBy('name')
            );
            const categoriesSnapshot = await getDocs(categoriesQuery);
            const categoriesData = categoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoriesData);

            // Load active sessions
            const activeQuery = query(
                collection(db, 'timeTracking'),
                where('uid', '==', user.uid),
                where('status', '==', 'active'),
                orderBy('startTime', 'desc')
            );
            const activeSnapshot = await getDocs(activeQuery);
            const activeData = activeSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setActiveSessions(activeData);

            // Set currently tracking if there's an active session
            if (activeData.length > 0) {
                setCurrentlyTracking(activeData[0]);
            } else {
                setCurrentlyTracking(null);
            }

            // Load recent sessions
            const recentQuery = query(
                collection(db, 'timeTracking'),
                where('uid', '==', user.uid),
                where('status', '==', 'completed'),
                orderBy('startTime', 'desc'),
                limit(10)
            );
            const recentSnapshot = await getDocs(recentQuery);
            const recentData = recentSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecentSessions(recentData);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user, loadData]);

    // Auto-refresh timer for active sessions
    useEffect(() => {
        if (!currentlyTracking) return;

        const interval = setInterval(() => {
            setLastRefresh(new Date());
        }, 1000); // Update every second

        return () => clearInterval(interval);
    }, [currentlyTracking]);

    const handleCategoryClick = async (subCategory) => {
        try {
            // If this category is already being tracked, stop it
            if (currentlyTracking && currentlyTracking.categoryId === subCategory.id) {
                await stopTracking(currentlyTracking.id);
                return;
            }

            // If another category is being tracked, stop it first
            if (currentlyTracking) {
                await stopTracking(currentlyTracking.id);
            }

            // Start tracking the new category
            await startTracking(subCategory);
        } catch (error) {
            console.error('Error handling category click:', error);
            alert('Error managing time tracking. Please try again.');
        }
    };

    const startTracking = async (subCategory) => {
        try {
            const sessionData = {
                uid: user.uid,
                trackingId: `track_${Date.now()}`,
                categoryId: subCategory.id,
                categoryName: subCategory.name,
                title: `${subCategory.name} Session`,
                description: `Time tracking for ${subCategory.name}`,
                startTime: new Date(),
                status: 'active',
                notes: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                tags: []
            };

            const docRef = await addDoc(collection(db, 'timeTracking'), sessionData);

            // Update local state directly instead of reloading everything
            const newSession = {
                id: docRef.id,
                ...sessionData
            };

            setActiveSessions(prev => [newSession, ...prev]);
            setCurrentlyTracking(newSession);
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Error starting tracking:', error);
            alert('Error starting tracking. Please try again.');
        }
    };

    const stopTracking = async (sessionId) => {
        try {
            const sessionRef = doc(db, 'timeTracking', sessionId);
            const endTime = new Date();

            const session = activeSessions.find(s => s.id === sessionId);
            if (!session) {
                throw new Error('Session not found');
            }

            const duration = endTime - session.startTime.toDate();

            await updateDoc(sessionRef, {
                endTime: endTime,
                status: 'completed',
                duration: duration,
                updatedAt: new Date()
            });

            // Update local state directly instead of reloading everything
            const completedSession = {
                ...session,
                endTime: endTime,
                status: 'completed',
                duration: duration,
                updatedAt: endTime
            };

            setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
            setCurrentlyTracking(null);
            setRecentSessions(prev => [completedSession, ...prev.slice(0, 9)]); // Keep only 10 most recent
        } catch (error) {
            console.error('Error stopping tracking:', error);
            alert('Error stopping tracking. Please try again.');
        }
    };

    const formatDuration = (startTime) => {
        const now = lastRefresh; // Use lastRefresh for real-time updates
        const start = startTime.toDate ? startTime.toDate() : startTime;
        const diff = now - start;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const formatTime = (timestamp) => {
        const date = timestamp.toDate ? timestamp.toDate() : timestamp;
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp) => {
        const date = timestamp.toDate ? timestamp.toDate() : timestamp;
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Icon mapping for sub-categories
    const getIconForCategory = (iconValue) => {
        const iconMap = {
            'default': '📋',
            'study': '📚',
            'work': '💼',
            'exercise': '🏃',
            'prayer': '🙏',
            'family': '👨‍👩‍👧‍👦',
            'health': '🏥',
            'hobby': '🎨',
            'social': '👥',
            'admin': '⚙️'
        };
        return iconMap[iconValue] || '📋';
    };

    // Get main categories and their sub-categories
    const getMainCategories = () => {
        return categories.filter(cat => cat.type === 'main');
    };

    const getSubCategories = (mainCategory) => {
        // mainCategory is the main category object
        // We need to match sub-categories by their parentCategoryId with the main category's categoryId
        return categories.filter(cat =>
            cat.type === 'sub' &&
            cat.parentCategoryId === mainCategory.categoryId
        );
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Please log in to use the Time Tracker</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32 lg:pb-6">
                {/* Compact Header */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Time Tracker</h2>
                </div>

                {/* Currently Tracking Display */}
                {currentlyTracking && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 transition-all duration-300 ease-in-out transform mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                                <div>
                                    <h3 className="text-lg font-semibold text-green-800 flex items-center space-x-2">
                                        <span>Currently Tracking: {currentlyTracking.categoryName}</span>
                                        <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full animate-pulse">
                                            Live
                                        </span>
                                    </h3>
                                    <p className="text-green-600 font-mono text-2xl">
                                        {formatDuration(currentlyTracking.startTime)}
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Started at {formatTime(currentlyTracking.startTime)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCategoryClick(categories.find(c => c.id === currentlyTracking.categoryId))}
                                className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                            >
                                Stop Tracking
                            </button>
                        </div>
                    </div>
                )}

                {/* Sub-Categories Grid */}
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Your Sub-Categories ({categories.filter(cat => cat.type === 'sub').length})
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Click any sub-category to start tracking time. Click again to stop.
                        </p>
                    </div>

                    <div className="p-6">

                        {getMainCategories().length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <p className="text-gray-500 text-lg mb-2">No categories found</p>
                                <p className="text-gray-400">Create some sub-categories first to start tracking time</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {getMainCategories().map((mainCategory) => {
                                    const subCategories = getSubCategories(mainCategory);

                                    return (
                                        <div key={mainCategory.id} className="space-y-3">
                                            <h4 className="text-lg font-medium text-gray-700 flex items-center space-x-2">
                                                <span className="text-2xl">{mainCategory.icon}</span>
                                                <span>{mainCategory.name}</span>
                                                <span className="text-sm text-gray-500">({subCategories.length} sub-categories)</span>
                                            </h4>

                                            {subCategories.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic">No sub-categories yet</p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {subCategories.map((subCategory) => {
                                                        const isCurrentlyTracking = currentlyTracking && currentlyTracking.categoryId === subCategory.id;
                                                        const hasActiveSession = activeSessions.some(s => s.categoryId === subCategory.id);

                                                        return (
                                                            <button
                                                                key={subCategory.id}
                                                                onClick={() => handleCategoryClick(subCategory)}
                                                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ease-in-out hover:scale-105 ${isCurrentlyTracking
                                                                    ? 'border-green-500 bg-green-50 shadow-lg'
                                                                    : hasActiveSession
                                                                        ? 'border-blue-500 bg-blue-50'
                                                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                                                    }`}
                                                                style={{
                                                                    borderLeftColor: subCategory.color,
                                                                    borderLeftWidth: '6px'
                                                                }}
                                                            >
                                                                {/* Active indicator */}
                                                                {isCurrentlyTracking && (
                                                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                                                                )}

                                                                <div className="text-center space-y-2">
                                                                    <div className="flex justify-center">
                                                                        <span className="text-3xl">
                                                                            {getIconForCategory(subCategory.icon)}
                                                                        </span>
                                                                    </div>
                                                                    <h5 className="font-medium text-gray-900">
                                                                        {subCategory.name}
                                                                    </h5>
                                                                    {subCategory.description && (
                                                                        <p className="text-xs text-gray-600 line-clamp-2">
                                                                            {subCategory.description}
                                                                        </p>
                                                                    )}
                                                                    {isCurrentlyTracking && (
                                                                        <div className="text-sm font-mono text-green-600">
                                                                            {formatDuration(currentlyTracking.startTime)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Sessions */}
                <div className="bg-white rounded-xl shadow-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">
                            Recent Sessions ({recentSessions.length})
                        </h3>
                    </div>

                    {recentSessions.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <p className="text-gray-500 text-lg mb-2">No recent sessions</p>
                            <p className="text-gray-400">Complete some tracking sessions to see them here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {recentSessions.map((session) => (
                                <div key={session.id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {Math.round(session.duration / 60000)} min
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-medium text-gray-900">{session.title}</h4>
                                                <p className="text-sm text-gray-600">{session.categoryName}</p>
                                                {session.description && (
                                                    <p className="text-sm text-gray-500 mt-1">{session.description}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDate(session.startTime)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Completed
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Footer Navigation */}

        </div>
    );
};

export default TimeTracker;
