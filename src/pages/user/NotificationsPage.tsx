import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDateTime } from '../../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { db, currentUser, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!currentUser) return null;

  const items = useMemo(() => {
    const audience = currentUser.role === 'admin' ? 'admin' : currentUser.id;
    return db.notifications
      .filter((n) => n.userId === currentUser.id || n.userId === audience)
      .filter((n) => (filter === 'unread' ? !n.isRead : true));
  }, [db.notifications, currentUser, filter]);

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#17191D] font-display">Notifications</h1>
          <p className="text-sm text-[#5A5F6B] mt-1">
            Group matching updates, published dealership offers, and purchase status changes.
          </p>
        </div>

        <button
          type="button"
          onClick={markAllNotificationsRead}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#17191D] bg-white border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0] self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4 text-[#176B50]" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
            filter === 'all'
              ? 'bg-[#176B50] text-white border-[#176B50]'
              : 'bg-white text-[#4A4F59] border-[#E4E4E0]'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${
            filter === 'unread'
              ? 'bg-[#176B50] text-white border-[#176B50]'
              : 'bg-white text-[#4A4F59] border-[#E4E4E0]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white border border-[#E4E4E0] rounded-xl p-10 text-center">
          <Bell className="w-7 h-7 text-[#6F7480] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#17191D]">You are all caught up</p>
          <p className="text-xs text-[#5A5F6B] mt-1">No notifications to display in this view.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E4E4E0] rounded-xl divide-y divide-[#ECECE8]">
          {items.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                n.isRead ? '' : 'bg-[#EBF3F0]/35'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#17191D]">{n.title}</p>
                  {!n.isRead && (
                    <span className="text-[11px] font-semibold text-[#176B50]">New</span>
                  )}
                </div>
                <p className="text-xs text-[#5A5F6B] leading-relaxed">{n.message}</p>
                <p className="text-[11px] text-[#6F7480] tabular-nums">
                  {formatDateTime(n.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="px-3 py-1.5 text-xs font-medium border border-[#D8D8D2] rounded-lg hover:bg-[#F4F4F0]"
                  >
                    Mark Read
                  </button>
                )}
                <Link
                  to={n.linkTo}
                  onClick={() => markNotificationRead(n.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#176B50] bg-[#EBF3F0] rounded-lg hover:bg-[#DCEBE5]"
                >
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
