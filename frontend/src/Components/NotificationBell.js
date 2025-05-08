import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import api from '../utils/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      const response = await api.get('/api/notifications', {
        params: { 
          recipient: user._id,
          limit: 5,
          unreadOnly: true 
        }
      });
      
      if (response.data?.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.notifications?.length || 0);
      }
    } catch (error) {
      console.error('Notification error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all', {
        recipient: user._id
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  return (
    <div className="notification-bell">
      <button 
        className={`bell-icon ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="empty-notifications">No new notifications</div>
          ) : (
            <ul className="notification-list">
              {notifications.map(notification => (
                <li 
                  key={notification._id} 
                  className="notification-item"
                >
                  <div className="notification-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <small>
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <button 
                    className="mark-read"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    ✓
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;