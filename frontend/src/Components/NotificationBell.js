import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../utils/api";
import "./NotificationBell.css";

const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/notifications", {
        params: {
          recipient: user._id,
          limit: 5,
          unreadOnly: true,
        },
      });

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.notifications?.length || 0);
      }
    } catch (err) {
      console.error("Notification error:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // WebSocket connection management
  useEffect(() => {
    if (!user?._id) return;

    const websocketUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}`
      : 'ws://localhost:5000';

    const websocket = new WebSocket(websocketUrl);
    setWs(websocket);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      const token = localStorage.getItem('token');
      if (token) {
        websocket.send(JSON.stringify({
          type: 'auth',
          token
        }));
      }
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          setNotifications(prev => [data.notification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (user?._id) {
          const newWs = new WebSocket(websocketUrl);
          setWs(newWs);
        }
      }, 5000);
    };

    return () => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.close();
      }
    };
  }, [user?._id]);

  // Initial fetch and polling
  useEffect(() => {
    fetchNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/api/notifications/read-all", {
        recipient: user._id,
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all as read error:", error);
    }
  };

  return (
    <div className="notification-bell">
      <button
        className={`bell-icon ${unreadCount > 0 ? "has-notifications" : ""}`}
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
              <button onClick={handleMarkAllAsRead}>Mark all as read</button>
            )}
          </div>

          {loading ? (
            <div className="notification-loading">Loading notifications...</div>
          ) : error ? (
            <div className="notification-error-message">
              {error}
              <button onClick={fetchNotifications}>Retry</button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="empty-notifications">No new notifications</div>
          ) : (
            <ul className="notification-list">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const NotificationItem = ({ notification, onMarkAsRead }) => (
  <li className={`notification-item ${notification.isRead ? "" : "unread"}`}>
    <div className="notification-content">
      <h5>{notification.title}</h5>
      <p>{notification.message}</p>
      <small>{new Date(notification.createdAt).toLocaleString()}</small>
    </div>
    {!notification.isRead && (
      <button
        className="mark-read"
        onClick={() => onMarkAsRead(notification._id)}
      >
        ✓
      </button>
    )}
  </li>
);

export default NotificationBell;