import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  MessageSquare,
  Info,
} from "lucide-react";
import { NotificationBell } from "@/components/ui/NotificationBell";
import {
  useNotifications,
  useNotificationActions,
} from "@/features/notifications/hooks/useNotifications";
import Loader from "@/components/Loader";

import { useSessionStore } from "@/stores/sessionStore";

const NotificationDropdown: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useSessionStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Fetching data using our new typed hooks
  const { data, isLoading } = useNotifications(1, 10, false);
  const { markAsRead, markAllRead, isProcessing } = useNotificationActions();

  const notifications = useMemo(
    () => data?.notifications ?? [],
    [data?.notifications],
  );
  const unreadCount = data?.unreadCount ?? 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "OVERDUE_ALERT":
      case "PAYMENT_DUE":
        return <AlertTriangle size={14} className="text-rose-500" />;
      case "CHAT_MESSAGE":
        return <MessageSquare size={14} className="text-blue-500" />;
      default:
        return <Info size={14} className="text-slate-400" />;
    }
  };

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <div
        ref={buttonRef}
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(!isOpen)}
        className="relative focus:outline-none active:scale-95 transition-transform p-1 cursor-pointer outline-none"
      >
        <NotificationBell count={unreadCount} />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-0 sm:mt-3 sm:w-[420px] rounded-[32px] border-none bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] ring-1 ring-slate-200/60 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          {/* --- BRANDED HEADER --- */}
          <div className="p-5 sm:p-6 border-b border-slate-50 bg-white">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                  <Bell size={18} className="text-white" />
                </div>
                <div className="text-left leading-tight">
                  <span className="font-black text-[11px] text-slate-900 uppercase tracking-[0.2em] block">
                    System Feed
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Live Node Sync
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  disabled={isProcessing || unreadCount === 0}
                  onClick={() => markAllRead()}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90 disabled:opacity-50"
                  title="Mark all read"
                >
                  <CheckCheck size={16} />
                </button>
                <button
                  type="button"
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                  title="Purge all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <div
                className={`h-1.5 w-1.5 rounded-full ${unreadCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {unreadCount} Operational Logs
              </span>
            </div>
          </div>

          {/* --- LIST AREA --- */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center">
                <Loader />
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`group flex items-start gap-4 px-6 py-5 cursor-pointer transition-all ${
                      n.read ? "bg-white opacity-40 grayscale" : "bg-blue-50/10"
                    } hover:bg-slate-50 hover:opacity-100 hover:grayscale-0`}
                    onClick={() => !n.read && handleMarkAsRead(n._id)}
                  >
                    <div className="shrink-0 mt-1">
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center ${n.read ? "bg-slate-100 text-slate-400" : "bg-slate-900 text-white"}`}
                      >
                        {getIcon(n.type)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`font-black text-[12px] tracking-tight truncate uppercase ${n.read ? "text-slate-500" : "text-slate-900"}`}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                          <Clock size={10} className="inline mr-1 mb-0.5" />
                          {new Date(n.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center px-10">
                <Bell size={24} className="text-slate-300 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                  Log Cache Empty
                </p>
              </div>
            )}
          </div>

          {/* --- TERMINAL FOOTER --- */}
          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                const isAdmin = role && ["ADMIN", "SUPER_ADMIN", "STAFF"].includes(role);
                navigate(isAdmin ? "/admin/notifications" : "/student/notifications");
                setIsOpen(false);
              }}
              className="w-full py-4 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-[0.98]"
            >
              Access Full Registry <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
