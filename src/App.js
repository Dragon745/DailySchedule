import React, { useState, useEffect } from 'react';
import './App.css';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import PWAUpdateNotification from './components/PWAUpdateNotification';

// Components
import UsernameInput from './components/UsernameInput';
import Dashboard from './components/Dashboard';
import CategoryManager from './components/CategoryManager';
import ScheduleManager from './components/ScheduleManager';
import TimeTracker from './components/TimeTracker';
import Analytics from './components/Analytics';

function App() {
  const [username, setUsername] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [viewHistory, setViewHistory] = useState(['dashboard']);

  useEffect(() => {
    // Check if username is already set in localStorage
    const savedUsername = localStorage.getItem('dailyScheduleUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleUsernameSet = (newUsername) => {
    setUsername(newUsername);
  };

  const navigateToView = (view) => {
    setCurrentView(view);
    setViewHistory(prev => [...prev, view]);
  };

  const goBack = () => {
    if (viewHistory.length > 1) {
      const newHistory = viewHistory.slice(0, -1);
      setViewHistory(newHistory);
      setCurrentView(newHistory[newHistory.length - 1]);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'categories':
        return <CategoryManager username={username} goBack={goBack} navigateToView={navigateToView} />;
      case 'schedules':
        return <ScheduleManager username={username} goBack={goBack} navigateToView={navigateToView} />;
      case 'tracker':
        return <TimeTracker username={username} goBack={goBack} navigateToView={navigateToView} />;
      case 'analytics':
        return <Analytics username={username} goBack={goBack} navigateToView={navigateToView} />;
      default:
        return <Dashboard username={username} setCurrentView={navigateToView} />;
    }
  };

  if (!username) {
    return <UsernameInput onUsernameSet={handleUsernameSet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* PWA Update Notification */}
      <PWAUpdateNotification />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Mobile Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary-600">DailySchedule</h1>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">{username}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">DailySchedule</h1>
              </div>
            </div>

            {/* Navigation Menu */}
            <div className="ml-10 flex items-baseline space-x-4">
              <button
                onClick={() => navigateToView('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard'
                  ? 'text-primary-600 bg-primary-100'
                  : 'text-gray-500 hover:text-primary-600'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => navigateToView('categories')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'categories'
                  ? 'text-primary-600 bg-primary-100'
                  : 'text-gray-500 hover:text-primary-600'
                  }`}
              >
                Categories
              </button>
              <button
                onClick={() => navigateToView('schedules')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'schedules'
                  ? 'text-primary-600 bg-primary-100'
                  : 'text-gray-500 hover:text-primary-600'
                  }`}
              >
                Schedules
              </button>
              <button
                onClick={() => navigateToView('tracker')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'tracker'
                  ? 'text-primary-600 bg-primary-100'
                  : 'text-gray-500 hover:text-primary-600'
                  }`}
              >
                Time Tracker
              </button>
              <button
                onClick={() => navigateToView('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'analytics'
                  ? 'text-primary-600 bg-primary-100'
                  : 'text-gray-500 hover:text-primary-600'
                  }`}
              >
                Analytics
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{username}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={() => navigateToView('dashboard')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${currentView === 'dashboard'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-primary-600'
              }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
            </svg>
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            onClick={() => navigateToView('categories')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${currentView === 'categories'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-primary-600'
              }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs">Categories</span>
          </button>
          <button
            onClick={() => navigateToView('schedules')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${currentView === 'schedules'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-primary-600'
              }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Schedules</span>
          </button>
          <button
            onClick={() => navigateToView('tracker')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${currentView === 'tracker'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-primary-600'
              }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">Tracker</span>
          </button>
          <button
            onClick={() => navigateToView('analytics')}
            className={`flex flex-col items-center py-2 px-1 rounded-lg transition-colors ${currentView === 'analytics'
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-500 hover:text-primary-600'
              }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-6">
        {renderView()}
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
