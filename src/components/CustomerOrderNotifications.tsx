'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { OrderStatus } from '@/types';
import { Bell, X, CheckCheck, PackageCheck, Clock, Sparkles, Trash2 } from 'lucide-react';

function statusBadgeStyle(status: OrderStatus): string {
  switch (status) {
    case 'Ready for Collection':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'Picking':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'Collected':
      return 'bg-slate-200 text-slate-700 border-slate-300';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
}

export const CustomerOrderNotifications: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();

  const [dismissedToastId, setDismissedToastId] = useState<string | null>(null);
  const latestUnread = notifications.find((n) => !n.read);
  const activeToast =
    latestUnread && latestUnread.id !== dismissedToastId ? latestUnread : null;

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setDismissedToastId(activeToast.id);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  return (
    <>
      {/* Live Floating Toast for New Order / Status Update */}
      {activeToast && !isNotificationsOpen && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              activeToast.status === 'Ready for Collection'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500 text-slate-950'
            }`}
          >
            {activeToast.status === 'Ready for Collection' ? (
              <PackageCheck className="w-5 h-5" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-white truncate">
                {activeToast.title}
              </span>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => {
                  markNotificationRead(activeToast.id);
                  setDismissedToastId(activeToast.id);
                }}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {activeToast.message}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  markNotificationRead(activeToast.id);
                  setDismissedToastId(activeToast.id);
                  setIsNotificationsOpen(true);
                }}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline"
              >
                View all updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsNotificationsOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
            <div className="w-[calc(100vw-1rem)] sm:w-screen max-w-md bg-white shadow-2xl flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="font-black text-sm">Order Updates &amp; Alerts</h2>
                    <p className="text-[11px] text-slate-400">
                      {unreadNotificationCount > 0
                        ? `${unreadNotificationCount} unread update(s)`
                        : 'Live status notifications for your orders'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-slate-950"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Mark all read
                  </button>
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>
              )}

              {/* Notification List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">
                      No order notifications yet
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      When you place an order or when our floor staff processes it, live updates will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`rounded-2xl p-3.5 border transition cursor-pointer text-xs ${
                        n.read
                          ? 'bg-white border-slate-200'
                          : 'bg-amber-50/70 border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${statusBadgeStyle(
                            n.status
                          )}`}
                        >
                          {n.status}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="font-black text-slate-900 text-sm">
                        {n.title}
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
