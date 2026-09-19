import React from 'react';
import { X, Bell, CheckCheck, Clock, Sparkles, MapPin, Info } from 'lucide-react';
import { useCustomerNotificationContext } from '@/context/CustomerNotificationContext';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isNotificationOpen,
    setIsNotificationOpen,
  } = useCustomerNotificationContext();

  if (!isNotificationOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={() => setIsNotificationOpen(false)} />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Notifications</h3>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All notifications caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsNotificationOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Bell className="w-12 h-12 mx-auto text-slate-700 mb-3" />
              <p className="font-semibold text-slate-400">No notifications yet</p>
              <p className="text-xs mt-1">We'll alert you on order status and gourmet offers.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const getIcon = () => {
                switch (notif.type) {
                  case 'ORDER':
                    return <Clock className="w-4 h-4 text-blue-400" />;
                  case 'PROMO':
                    return <Sparkles className="w-4 h-4 text-amber-400" />;
                  case 'TABLE':
                    return <MapPin className="w-4 h-4 text-purple-400" />;
                  default:
                    return <Info className="w-4 h-4 text-emerald-400" />;
                }
              };

              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    notif.isRead
                      ? 'bg-slate-800/40 border-slate-800 text-slate-300'
                      : 'bg-slate-800/90 border-amber-500/30 text-white shadow-md'
                  }`}
                >
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                      {getIcon()}
                    </div>
                    <div className="space-y-1 pr-4">
                      <h4 className="text-xs font-bold leading-tight">{notif.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">{notif.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
