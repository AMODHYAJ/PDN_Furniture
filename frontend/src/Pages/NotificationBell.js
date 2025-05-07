import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import axios from 'axios';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/notifications', {
        params: { limit: 5, unreadOnly: true }
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.total);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setNotifications(notifications.filter(n => n._id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all');
      setUnreadCount(0);
      setIsOpen(false);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="notification-bell">
      <button 
        className="bell-icon" 
        onClick={() => setIsOpen(!isOpen)}
        data-count={unreadCount > 0 ? unreadCount : null}
      >
        🔔
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
                  className={`notification-item ${notification.isRead ? '' : 'unread'}`}
                >
                  <div className="notification-content">
                    <h5>{notification.title}</h5>
                    <p>{notification.message}</p>
                    <small>
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {!notification.isRead && (
                    <button 
                      className="mark-read"
                      onClick={() => handleMarkAsRead(notification._id)}
                    >
                      ✓
                    </button>
                  )}
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