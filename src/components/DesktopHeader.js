import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';

const DesktopHeader = ({ user, currentView, navigateToView }) => {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'categories', label: 'Categories' },
        { id: 'schedules', label: 'Schedules' },
        { id: 'timeTracker', label: 'Time Tracker' },
        { id: 'analytics', label: 'Analytics' }
    ];

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 hidden lg:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-primary-600">DailySchedule</h1>
                        </div>
                    </div>

                    {/* Desktop Navigation Menu */}
                    <div className="ml-10 flex items-baseline space-x-4">
                        {navigationItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => navigateToView(item.id)}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === item.id
                                        ? 'text-primary-600 bg-primary-100'
                                        : 'text-gray-500 hover:text-primary-600'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Desktop User Menu */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {user.photoURL && (
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={user.photoURL}
                                    alt={user.displayName}
                                />
                            )}
                            <span className="text-sm text-gray-700">{user.displayName}</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default DesktopHeader;

