import React, { createContext, useState, useCallback, useContext } from 'react'; // Added useContext
import styled, { keyframes } from 'styled-components';

const NotificationContext = createContext(null);

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
`;

// Wrapper for all notification bubbles
const NotificationWrapper = styled.div`
  position: fixed;
  top: 80px; // Adjusted to be below a potentially sticky header (60px) + some margin
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px; // Max width for notifications
`;

// Individual notification bubble
const NotificationBubble = styled.div`
  background-color: ${({ theme, type }) => {
    if (type === 'success') return theme.success;
    if (type === 'error') return theme.error;
    return theme.primary; // Default for 'info'
  }};
  color: ${({ theme }) => theme.button.primaryText}; // Assumes light text on colored backgrounds
  padding: 12px 18px;
  border-radius: 6px;
  box-shadow: 0 4px 12px ${({ theme }) => theme.card.shadow}; // Use theme shadow
  font-size: 0.95rem;
  animation: ${fadeIn} 0.3s ease-out forwards, ${fadeOut} 0.3s ease-in forwards ${({ delay }) => delay - 0.3}s;
  opacity: 0;
  margin-bottom: 0; // Using gap in NotificationWrapper now
  pointer-events: auto; // Allow interaction if needed in future (e.g. close button)
`;

let notificationIdCounter = 0; // Counter for unique notification IDs

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Adds a new notification.
   * @param {string} message - The message to display.
   * @param {'info'|'success'|'error'} type - The type of notification.
   * @param {number} duration - Duration in milliseconds before auto-dismiss.
   */
  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = notificationIdCounter++;
    setNotifications(prev => [...prev, { id, message, type, duration }]);

    // Automatically remove the notification after its duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationWrapper>
        {notifications.map(n => (
          <NotificationBubble key={n.id} type={n.type} delay={n.duration / 1000}>
            {n.message}
          </NotificationBubble>
        ))}
      </NotificationWrapper>
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to access the addNotification function.
 * @returns {{addNotification: Function}}
 */
export const useNotification = () => {
  const context = useContext(NotificationContext); // Changed from React.useContext
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
