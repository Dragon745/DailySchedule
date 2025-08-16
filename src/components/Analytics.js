import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Analytics = ({ user, goBack, navigateToView }) => {
    // Predefined main categories (same as CategoryManager)
    const predefinedMainCategories = [
        { id: 'predefined-worship-spiritual', name: 'Worship & Spiritual', color: '#8B5CF6', icon: '🙏' },
        { id: 'predefined-study-learning', name: 'Study & Learning', color: '#3B82F6', icon: '📚' },
        { id: 'predefined-work-income', name: 'Work / Income', color: '#10B981', icon: '💼' },
        { id: 'predefined-personal-projects', name: 'Personal Projects', color: '#F59E0B', icon: '🚀' },
        { id: 'predefined-opportunities-challenges', name: 'Opportunities & Challenges', color: '#EF4444', icon: '🎯' },
        { id: 'predefined-family-relationships', name: 'Family & Relationships', color: '#EC4899', icon: '👨‍👩‍👧‍👦' },
        { id: 'predefined-self-care-rest', name: 'Self-Care & Rest', color: '#06B6D4', icon: '🧘' },
        { id: 'predefined-admin-miscellaneous', name: 'Admin & Miscellaneous', color: '#6B7280', icon: '⚙️' }
    ];

    const [stats, setStats] = useState({
        totalTime: 0,
        totalSessions: 0,
        categories: {},
        mainCategories: {},
        expandedCategories: new Set()
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week'); // week, month, year
    const [error, setError] = useState(null);

    const getStartDate = () => {
        const now = new Date();
        switch (timeRange) {
            case 'week':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'year':
                return new Date(now.getFullYear(), 0, 1);
            default:
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }
    };

    const loadAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get time tracking data
            const trackingQuery = query(
                collection(db, 'timeTracking'),
                where('uid', '==', user.uid),
                where('status', '==', 'completed')
            );

            const trackingSnapshot = await getDocs(trackingQuery);
            const trackingData = trackingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Get categories
            const categoriesQuery = query(
                collection(db, 'categories'),
                where('uid', '==', user.uid),
                where('isActive', '==', true)
            );

            const categoriesSnapshot = await getDocs(categoriesQuery);
            const categories = {};
            const mainCategories = {};

            categoriesSnapshot.docs.forEach(doc => {
                const category = { id: doc.id, ...doc.data() };
                // Use document id as the key for categories
                categories[category.id] = category;

                if (category.type === 'main') {
                    mainCategories[category.id] = {
                        ...category,
                        subCategories: [],
                        totalTime: 0,
                        totalSessions: 0
                    };
                }
            });

            // Also create main categories for predefined ones that might not exist in Firestore yet
            predefinedMainCategories.forEach(predefined => {
                if (!mainCategories[predefined.id]) {
                    mainCategories[predefined.id] = {
                        id: predefined.id,
                        categoryId: predefined.id,
                        name: predefined.name,
                        color: predefined.color,
                        icon: predefined.icon,
                        type: 'main',
                        parentCategoryId: null,
                        isActive: true,
                        subCategories: [],
                        totalTime: 0,
                        totalSessions: 0
                    };
                }
            });

            // Organize sub-categories under main categories
            Object.values(categories).forEach(category => {
                if (category.type === 'sub' && category.parentCategoryId) {
                    // Find the main category by its categoryId field
                    const mainCategory = Object.values(mainCategories).find(main => main.categoryId === category.parentCategoryId);
                    if (mainCategory) {
                        mainCategory.subCategories.push({
                            ...category,
                            totalTime: 0,
                            totalSessions: 0
                        });
                    }
                }
            });

            // Calculate statistics based on time range
            const startDate = getStartDate();
            const filteredTracking = trackingData.filter(session => {
                if (!session.startTime) return false;
                const sessionDate = session.startTime.toDate ? session.startTime.toDate() : new Date(session.startTime);
                return sessionDate >= startDate;
            });

            let totalTime = 0;
            let totalSessions = 0;

            // Calculate time for each category
            filteredTracking.forEach(session => {
                // Check if session has duration (in MILLISECONDS from Firestore)
                if (session.duration && typeof session.duration === 'number') {
                    // Convert milliseconds to minutes for display
                    const durationInMinutes = session.duration / (1000 * 60);
                    totalTime += durationInMinutes;
                    totalSessions++;

                    // Find the category this session belongs to
                    // session.categoryId is the Firestore document ID of the category
                    const category = categories[session.categoryId];
                    if (category) {
                        if (category.type === 'sub') {
                            // Add to sub-category
                            const mainCategory = Object.values(mainCategories).find(main => main.categoryId === category.parentCategoryId);
                            if (mainCategory) {
                                const subCategory = mainCategory.subCategories.find(sub => sub.id === session.categoryId);
                                if (subCategory) {
                                    subCategory.totalTime += durationInMinutes;
                                    subCategory.totalSessions += 1;
                                }
                                // Also add to main category
                                mainCategory.totalTime += durationInMinutes;
                                mainCategory.totalSessions += 1;
                            }
                        } else if (category.type === 'main') {
                            // Direct main category session
                            const mainCategory = Object.values(mainCategories).find(main => main.categoryId === category.categoryId);
                            if (mainCategory) {
                                mainCategory.totalTime += durationInMinutes;
                                mainCategory.totalSessions += 1;
                            }
                        }
                    }
                }
            });

            setStats({
                totalTime,
                totalSessions,
                categories,
                mainCategories,
                expandedCategories: new Set()
            });
        } catch (error) {
            console.error('Error loading analytics data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [user, predefinedMainCategories]);

    useEffect(() => {
        if (user) {
            loadAnalyticsData();
        }
    }, [user, timeRange, loadAnalyticsData]);

    const formatTime = (minutes) => {
        if (minutes < 60) {
            return `${Math.round(minutes)}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    };

    const calculatePercentage = (categoryTime) => {
        if (stats.totalTime === 0) return 0;
        return Math.round((categoryTime / stats.totalTime) * 100);
    };

    const toggleCategoryExpansion = (categoryId) => {
        setStats(prev => {
            const newExpanded = new Set(prev.expandedCategories);
            if (newExpanded.has(categoryId)) {
                newExpanded.delete(categoryId);
            } else {
                newExpanded.add(categoryId);
            }
            return { ...prev, expandedCategories: newExpanded };
        });
    };

    // getTimeRangeLabel function removed as it's not used

    if (loading) {
        return (
            <div className="p-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6 pb-32 lg:pb-6">
                {/* Compact Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                    </select>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Time</p>
                                <p className="text-2xl font-bold text-gray-900">{formatTime(stats.totalTime)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold text-gray-800">Category Breakdown</h2>
                        <p className="text-gray-600 text-xs">Click on main categories to see sub-categories</p>
                    </div>

                    <div className="divide-y">
                        {Object.values(stats.mainCategories)
                            .filter(category => category.totalTime > 0)
                            .sort((a, b) => b.totalTime - a.totalTime)
                            .map((mainCategory) => {
                                const percentage = calculatePercentage(mainCategory.totalTime);
                                const isExpanded = stats.expandedCategories.has(mainCategory.id);

                                return (
                                    <div key={mainCategory.id} className="p-3">
                                        {/* Main Category Row */}
                                        <div
                                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                            onClick={() => toggleCategoryExpansion(mainCategory.id)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: mainCategory.color || '#6B7280' }}
                                                ></div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800">{mainCategory.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {formatTime(mainCategory.totalTime)} • {mainCategory.totalSessions} sessions
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg font-semibold text-gray-800">{percentage}%</span>
                                                <svg
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''
                                                        }`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3 ml-7">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full transition-all duration-300"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: mainCategory.color || '#6B7280'
                                                    }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Sub-categories */}
                                        {isExpanded && mainCategory.subCategories.length > 0 && (
                                            <div className="mt-3 ml-7 space-y-2">
                                                {mainCategory.subCategories
                                                    .filter(sub => sub.totalTime > 0)
                                                    .sort((a, b) => b.totalTime - a.totalTime)
                                                    .map((subCategory) => {
                                                        const subPercentage = calculatePercentage(subCategory.totalTime);
                                                        return (
                                                            <div key={subCategory.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                                <div className="flex items-center space-x-3">
                                                                    <div
                                                                        className="w-3 h-3 rounded-full"
                                                                        style={{ backgroundColor: subCategory.color || '#9CA3AF' }}
                                                                    ></div>
                                                                    <div>
                                                                        <h4 className="font-medium text-gray-700">{subCategory.name}</h4>
                                                                        <p className="text-sm text-gray-500">
                                                                            {formatTime(subCategory.totalTime)} • {subCategory.totalSessions} sessions
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center space-x-3">
                                                                    <span className="font-semibold text-gray-700">{subPercentage}%</span>
                                                                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                                                                        <div
                                                                            className="h-1.5 rounded-full transition-all duration-300"
                                                                            style={{
                                                                                width: `${subPercentage}%`,
                                                                                backgroundColor: subCategory.color || '#9CA3AF'
                                                                            }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>

                    {Object.values(stats.mainCategories).filter(cat => cat.totalTime > 0).length === 0 && (
                        <div className="p-8 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">No Data Available</h3>
                            <p className="text-gray-500">Start tracking your time to see analytics here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Footer Navigation */}

        </div>
    );
};

export default Analytics;
