import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/services/api';

interface Activity {
  id: string;
  action: string;
  resource_type: string;
  timestamp: string;
  after?: any;
  user_name?: string;
  school_name?: string;
  ip?: string;
}

export default function NotificationAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(localStorage.getItem('lastSeenActivity') || '');

  const { data: activities } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => auditApi.getRecentActivity(5),
    refetchInterval: 5000,
  });

  const newActivities = activities?.filter((activity: Activity) => 
    new Date(activity.timestamp) > new Date(lastSeen)
  ) || [];

  const handleMarkAsSeen = () => {
    if (activities?.length > 0) {
      const latest = activities[0].timestamp;
      localStorage.setItem('lastSeenActivity', latest);
      setLastSeen(latest);
    }
    setIsOpen(false);
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return '✅';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      default: return '📝';
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {/* Badge */}
        {newActivities.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {newActivities.length > 9 ? '9+' : newActivities.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 sm:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-blue-600">🔔</span>
                  Recent Activity
                </h3>
                {newActivities.length > 0 && (
                  <button
                    onClick={handleMarkAsSeen}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark as seen
                  </button>
                )}
              </div>
            </div>

            {/* Activities List */}
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {activities?.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {activities.map((activity: Activity) => {
                    const isNew = newActivities.some((na: Activity) => na.id === activity.id);
                    return (
                      <div
                        key={activity.id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                          isNew ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.action)}`}>
                            {getActivityIcon(activity.action)}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {activity.action} {activity.resource_type}
                              </span>
                              {isNew && (
                                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            
                            {/* What was affected */}
                            {activity.after?.name && (
                              <p className="text-gray-700 text-xs font-medium truncate">
                                📝 {activity.after.name}
                              </p>
                            )}
                            
                            {/* Who did it */}
                            <p className="text-gray-600 text-xs mt-1">
                              👤 {activity.user_name || 'Unknown User'}
                              {activity.school_name && ` (${activity.school_name})`}
                            </p>
                            
                            {/* Where (IP) */}
                            {activity.ip && (
                              <p className="text-gray-600 text-xs">
                                📍 From: {activity.ip}
                              </p>
                            )}
                            
                            {/* When */}
                            <p className="text-gray-400 text-xs mt-1">
                              🕒 {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-gray-500 text-sm">No recent activity</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {activities?.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}