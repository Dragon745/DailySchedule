import React from 'react';

const MobileHeader = ({ username, title = "DailySchedule" }) => {
    return (
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 lg:hidden">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-primary-600">{title}</h1>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-700">{username}</span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default MobileHeader;

