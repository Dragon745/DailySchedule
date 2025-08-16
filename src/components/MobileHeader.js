import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase.config';

const MobileHeader = ({ user, title = "DailySchedule" }) => {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 lg:hidden">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-primary-600">{title}</h1>
                    <div className="flex items-center space-x-3">
                        {user.photoURL && (
                            <img
                                className="h-8 w-8 rounded-full"
                                src={user.photoURL}
                                alt={user.displayName}
                            />
                        )}
                        <button
                            onClick={handleSignOut}
                            className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default MobileHeader;

