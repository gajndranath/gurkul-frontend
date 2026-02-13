import React from "react";
import { NotificationBell } from "./ui/NotificationBell";
import {
  Bell,
  CheckCheck,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useClearAllNotifications,
} from "../features/notifications/hooks/useNotifications";

const NotificationDropdown: React.FC = () => {
  const { data, isLoading } = useNotifications(1, 10, false);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const clearAll = useClearAllNotifications();

  return (
    <Popover>
      {/* FIX: Removed the <button> wrapper. NotificationBell already contains a button.
        We use asChild on a <div> with role="button" to satisfy Radix/Shadcn 
        without nesting buttons.
      */}
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          className="relative focus:outline-none active:scale-95 transition-transform p-1 cursor-pointer outline-none"
        >
          <NotificationBell count={data?.unreadCount || 0} />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={12}
        className="
          /* Mobile Centering Logic: Ensures it fills available width with 1rem margin */
          w-[calc(100vw-2rem)] max-sm:mx-4
          /* Desktop Constraint */
          sm:w-[420px] 
          
          /* Premium Registry Theme */
          p-0 rounded-[32px] border-none
          bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]
          ring-1 ring-slate-200/60 overflow-hidden 
          animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300
          z-[100]
        "
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
                onClick={() => markAllAsRead.mutate()}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
                title="Mark all read"
              >
                <CheckCheck size={16} />
              </button>
              <button
                type="button"
                onClick={() => clearAll.mutate()}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                title="Purge all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {data?.unreadCount || 0} Operational Logs
            </span>
          </div>
        </div>

        {/* --- LIST AREA --- */}
        <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center opacity-30">
              <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data?.notifications?.length ? (
            <div className="divide-y divide-slate-50">
              {data.notifications.map((n) => (
                <div
                  key={n._id}
                  className={`group flex items-start gap-4 px-6 py-5 cursor-pointer transition-all ${
                    n.read ? "bg-white opacity-40 grayscale" : "bg-blue-50/20"
                  } hover:bg-slate-50 hover:opacity-100 hover:grayscale-0`}
                  onClick={() => !n.read && markAsRead.mutate(n._id)}
                >
                  <div className="shrink-0 mt-1">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${n.read ? "bg-slate-200" : "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-slate-900 text-[13px] tracking-tight group-hover:text-blue-600 transition-colors truncate uppercase">
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
                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center px-10">
              <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Bell size={24} className="text-slate-300" />
              </div>
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
            onClick={() => window.location.assign("/student/notifications")}
            className="
               w-full py-4 rounded-2xl bg-slate-900 text-white 
               text-[10px] font-black uppercase tracking-[0.2em] 
               flex items-center justify-center gap-2 hover:bg-blue-600 transition-all active:scale-[0.98]
             "
          >
            Access Full Registry <ChevronRight size={14} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
