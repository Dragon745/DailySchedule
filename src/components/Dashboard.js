import React, { useState, useEffect } from 'react';
import { db } from '../firebase.config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const Dashboard = ({ user, setCurrentView }) => {
    const [categories, setCategories] = useState([]);
    const [todaySchedules, setTodaySchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCategories: 0,
        totalSchedules: 0,
        todaySchedules: 0,
        completedToday: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, [user, loadDashboardData]);

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);

            // Load categories
            const categoriesQuery = query(
                collection(db, 'categories'),
                where('uid', '==', user.uid),
                where('isActive', '==', true),
                orderBy('createdAt', 'desc')
            );
            const categoriesSnapshot = await getDocs(categoriesQuery);
            const categoriesData = categoriesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCategories(categoriesData);

            // Helper functions for hierarchical display
            // Note: These functions are now defined locally, not on window object

            // Load today's schedules
            const today = new Date();
            const dayOfWeek = today.getDay() || 7; // Convert Sunday (0) to 7

            const schedulesQuery = query(
                collection(db, 'schedules'),
                where('uid', '==', user.uid),
                where('isActive', '==', true),
                where('daysOfWeek', 'array-contains', dayOfWeek),
                orderBy('startTime')
            );
            const schedulesSnapshot = await getDocs(schedulesQuery);
            const schedulesData = schedulesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTodaySchedules(schedulesData);

            // Update stats
            setStats({
                totalCategories: categoriesData.length,
                totalSchedules: schedulesData.length,
                todaySchedules: schedulesData.length,
                completedToday: 0 // This would be calculated from timeTracking collection
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Helper functions for hierarchical display
    const getMainCategories = () => {
        return categories.filter(cat => cat.type === 'main');
    };

    const getSubCategories = (parentId) => {
        return categories.filter(cat => cat.type === 'sub' && cat.parentCategoryId === parentId);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-32 lg:pb-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {getGreeting()}, {user.displayName}!
                        </h1>
                        <p className="text-sm lg:text-lg text-gray-600 mt-1 lg:mt-2">
                            Current time: {getCurrentTime()}
                        </p>
                    </div>
                    <div className="text-left lg:text-right">
                        <p className="text-sm text-gray-500">Today</p>
                        <p className="text-xl lg:text-2xl font-bold text-primary-600">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-6">
                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-sm font-medium text-gray-600">Categories</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-sm font-medium text-gray-600">Today's Schedule</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.todaySchedules}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">{stats.completedToday}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="ml-3 lg:ml-4">
                            <p className="text-sm font-medium text-gray-600">Productivity</p>
                            <p className="text-xl lg:text-2xl font-bold text-gray-900">85%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <button
                        onClick={() => setCurrentView('categories')}
                        className="flex items-center justify-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
                    >
                        <div className="text-center">
                            <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <p className="text-sm font-medium text-gray-600">Add Category</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentView('schedules')}
                        className="flex items-center justify-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
                    >
                        <div className="text-center">
                            <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-600">Create Schedule</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setCurrentView('tracker')}
                        className="flex items-center justify-center p-3 lg:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors duration-200"
                    >
                        <div className="text-center">
                            <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-medium text-gray-600">Start Tracking</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Today's Schedule</h2>
                {todaySchedules.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm sm:text-base">No schedules for today</p>
                        <button
                            onClick={() => setCurrentView('schedules')}
                            className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
                        >
                            Create your first schedule
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todaySchedules.map((schedule) => (
                            <div key={schedule.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">{schedule.title}</p>
                                        <p className="text-sm text-gray-600">{schedule.categoryName}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <p className="font-medium text-gray-900">
                                        {schedule.startTime} - {schedule.endTime}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {schedule.isRecurring ? 'Recurring' : 'One-time'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Recent Categories */}
            <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4">Your Categories</h2>
                {categories.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p className="text-gray-500 text-sm sm:text-base">No categories yet</p>
                        <button
                            onClick={() => setCurrentView('categories')}
                            className="mt-2 text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base"
                        >
                            Create your first category
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {getMainCategories().slice(0, 4).map((mainCategory) => {
                            const subCategories = getSubCategories(mainCategory.id);
                            return (
                                <div key={mainCategory.id} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: mainCategory.color || '#3B82F6' }}
                                            ></div>
                                            <div>
                                                <p className="font-medium text-gray-900">{mainCategory.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {mainCategory.totalSessions || 0} sessions
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-primary-600 font-medium">Main</span>
                                    </div>

                                    {subCategories.length > 0 && (
                                        <div className="ml-4 sm:ml-7 space-y-1">
                                            {subCategories.slice(0, 3).map((subCategory) => (
                                                <div key={subCategory.id} className="flex items-center space-x-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: subCategory.color || '#6B7280' }}
                                                    ></div>
                                                    <span className="text-sm text-gray-600">{subCategory.name}</span>
                                                    <span className="text-xs text-gray-400">
                                                        ({subCategory.totalSessions || 0} sessions)
                                                    </span>
                                                </div>
                                            ))}
                                            {subCategories.length > 3 && (
                                                <p className="text-xs text-gray-400 ml-4">
                                                    +{subCategories.length - 3} more sub-categories
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {getMainCategories().length > 4 && (
                            <div className="text-center">
                                <button
                                    onClick={() => setCurrentView('categories')}
                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                >
                                    View all categories ({categories.length})
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
