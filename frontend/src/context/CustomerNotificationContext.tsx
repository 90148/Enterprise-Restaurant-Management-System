import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerNotification } from '@/types/customer';

interface CustomerNotificationContextType {
  notifications: CustomerNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (n: Omit<CustomerNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;
}

const CustomerNotificationContext = createContext<CustomerNotificationContextType | undefined>(undefined);

const NOTIFICATION_STORAGE_KEY = 'restomaster_customer_notifications';

const DEFAULT_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: 'notif-1',
    title: 'Order Delivered!',
    message: 'Your order #RM-10284 has been successfully served at Table T-12. Enjoy your gourmet feast!',
    type: 'ORDER',
    timestamp: '15 mins ago',
    isRead: false,
    orderId: 'RM-10284',
  },
  {
    id: 'notif-2',
    title: 'Weekend Royalty Coupon',
    message: 'Exclusive 20% discount on Hyderabadi Biryanis & Tandoori Platters with coupon FEAST20.',
    type: 'PROMO',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: 'notif-3',
    title: 'Table T-12 Reserved',
    message: 'Your table reservation at Chennai Central Flagship is confirmed for today.',
    type: 'TABLE',
    timestamp: 'Yesterday',
    isRead: true,
  },
];

export const CustomerNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<CustomerNotification[]>(() => {
    const saved = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_NOTIFICATIONS;
      }
    }
    return DEFAULT_NOTIFICATIONS;
  });

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (n: Omit<CustomerNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: CustomerNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <CustomerNotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        isNotificationOpen,
        setIsNotificationOpen,
      }}
    >
      {children}
    </CustomerNotificationContext.Provider>
  );
};

export const useCustomerNotificationContext = () => {
  const context = useContext(CustomerNotificationContext);
  if (!context) {
    throw new Error('useCustomerNotificationContext must be used within a CustomerNotificationProvider');
  }
  return context;
};
