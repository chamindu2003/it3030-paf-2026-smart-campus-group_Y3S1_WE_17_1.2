import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { notificationAPI } from '../api/apiService';

function NotificationPanel({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const [notifications, countData] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ]);

      setItems(notifications || []);
      setUnreadCount(countData?.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadNotifications();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(timer);
  }, [open]);

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true, isRead: true } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, read: true, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.deleteOne(id);
      const removed = items.find((item) => item.id === id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (removed && !(removed.isRead || removed.read)) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete notification');
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
  };

  if (!open) return null;

  return (
    <div className="notification-panel-overlay" onClick={onClose}>
      <aside className="notification-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notification-panel-header">
          <h3>Notifications</h3>
          <div className="notification-panel-actions">
            <button type="button" onClick={loadNotifications}>
              Refresh
            </button>
            <button type="button" onClick={handleMarkAllRead} disabled={!unreadCount}>
              Mark all read
            </button>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>

        <p className="notification-unread">Unread: {unreadCount}</p>

        {loading && <p className="notification-state">Loading...</p>}
        {error && <p className="notification-state notification-error">{error}</p>}

        {!loading && !items.length && <p className="notification-state">No notifications yet.</p>}

        <ul className="notification-list">
          {items.map((item) => {
            const isRead = item.isRead || item.read;
            return (
              <li key={item.id} className={`notification-item ${isRead ? 'is-read' : 'is-unread'}`}>
                <div className="notification-item-main">
                  <p className="notification-message">{item.message}</p>
                  <p className="notification-meta">
                    <span>{item.type}</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </p>
                </div>
                <div className="notification-item-actions">
                  {!isRead && (
                    <button type="button" onClick={() => handleMarkRead(item.id)}>
                      Mark read
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

NotificationPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default NotificationPanel;
