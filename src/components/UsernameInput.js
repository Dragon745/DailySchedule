import React, { useState, useEffect } from 'react';

const UsernameInput = ({ onUsernameSet }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Check if username is already set in localStorage
        const savedUsername = localStorage.getItem('dailyScheduleUsername');
        if (savedUsername) {
            onUsernameSet(savedUsername);
        }
    }, [onUsernameSet]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setIsLoading(true);

        try {
            // Save username to localStorage
            localStorage.setItem('dailyScheduleUsername', username.trim());

            // Call the callback to set username in parent component
            onUsernameSet(username.trim());
        } catch (error) {
            console.error('Error saving username:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        DailySchedule
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Organize your day and track your time effectively
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Welcome to DailySchedule
                            </h2>
                            <p className="text-gray-600">
                                Enter your name to get started
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Name
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                    placeholder="Enter your name"
                                    maxLength={50}
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!username.trim() || isLoading}
                                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Getting Started...
                                    </>
                                ) : (
                                    'Get Started'
                                )}
                            </button>
                        </form>

                        <div className="text-center">
                            <p className="text-sm text-gray-500">
                                Your data will be stored locally on your device
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        No account required - just enter your name and start organizing!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsernameInput;
