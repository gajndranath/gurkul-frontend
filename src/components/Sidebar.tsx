import React, { memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUIStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { logoutStudent } from "../features/auth/api/studentAuthApi";
import { logoutAdmin } from "../features/auth/api/adminAuthApi";
import {
  LayoutDashboard,
  User,
  Bell,
  Users,
  Settings,
  LogOut,
  Armchair,
  IndianRupee,
  ChevronRight,
  Clock,
  PieChart,
  CalendarCheck,
  Home,
  Map as MapIcon,
  MessageSquare,
} from "lucide-react";


const studentMenu = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  { label: "My Profile", path: "/student/profile", icon: <User size={18} /> },
  {
    label: "Announcements",
    path: "/student/announcements",
    icon: <Bell size={18} />,
  },
  { label: "Payments", path: "/student/payments", icon: <IndianRupee size={18} /> },
  { label: "Slot Change", path: "/student/slot-requests", icon: <Armchair size={18} /> },
  { label: "Friends", path: "/student/friends", icon: <Users size={18} /> },
  { label: "Terminal Comms", path: "/student/chat", icon: <MessageSquare size={18} /> },
];

const adminMenu = [
  {
    category: "Impact Center",
    items: [
      { label: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
      { label: "Announcements", path: "/admin/announcements", icon: <Bell size={18} /> },
      { label: "Social Hub", path: "/admin/social", icon: <Users size={18} /> },
      { label: "Terminal Comms", path: "/admin/chat", icon: <MessageSquare size={18} /> },
    ]
  },
  {
    category: "Registry",
    items: [
      { label: "Students", path: "/admin/students", icon: <Users size={18} /> },
      { label: "Attendance", path: "/admin/attendance", icon: <CalendarCheck size={18} /> },
    ]
  },
  {
    category: "Infrastructure",
    items: [
      { label: "Interactive Map", path: "/admin/interactive-map", icon: <MapIcon size={18} /> },
      { label: "Rooms", path: "/admin/rooms", icon: <Home size={18} /> },
      { label: "Slots", path: "/admin/slots", icon: <Armchair size={18} /> },
    ]
  },
  {
    category: "Finance",
    items: [
      { label: "Fees", path: "/admin/fees", icon: <IndianRupee size={18} /> },
      { label: "Expenses", path: "/admin/expenses", icon: <PieChart size={18} /> },
    ]
  },
  {
    category: "Automation",
    items: [
      { label: "Reminders", path: "/admin/reminders", icon: <Clock size={18} /> },
      { label: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
    ]
  },
];

import { useChatStore } from "../stores/chatStore";

const Sidebar: React.FC = memo(() => {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const closeSidebar = useUIStore((s) => s.closeSidebar);
  const role = useSessionStore((s) => s.role);
  const totalUnreadCount = useChatStore((s) => s.totalUnreadCount);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN" || role === "STAFF";

  const handleLogout = async () => {
    try {
      if (isAdmin) await logoutAdmin();
      else await logoutStudent();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      const loginPath = isAdmin ? "/admin/login" : "/student/login";
      useSessionStore.getState().logout();
      window.location.href = loginPath;
    }
  };

  const renderMenuItem = (item: any) => {
    const isActive = item.path ? location.pathname.startsWith(item.path) : false;
    return (
      <button
        key={item.label}
        onClick={() => {
          if (item.path) {
            navigate(item.path);
            closeSidebar();
          }
        }}
        className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-100/50"
            : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`}>
            {item.icon}
          </div>
          <span className={`text-[12px] ${isActive ? "font-bold" : "font-medium"} tracking-tight`}>
            {item.label}
          </span>
          {item.label === "Terminal Comms" && totalUnreadCount > 0 && (
            <div className="ml-2 bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {totalUnreadCount}
            </div>
          )}
        </div>
        {isActive && <ChevronRight size={12} className="opacity-70" />}
      </button>
    );
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"} sm:hidden`}
        onClick={closeSidebar}
      />

      <aside
        className={`z-50 top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out
          fixed sm:fixed
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          sm:translate-x-0 overflow-y-auto custom-scrollbar`}
      >
        <nav className="flex flex-col h-full p-6 justify-between">
          <div className="space-y-8">
            {isAdmin ? (
              adminMenu.map((group) => (
                <div key={group.category} className="space-y-2">
                  <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    {group.category}
                  </p>
                  <div className="space-y-1">
                    {group.items.map(renderMenuItem)}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-2">
                  Portal Navigation
                </p>
                {studentMenu.map(renderMenuItem)}
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-slate-50">
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all group"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span className="text-[12px] font-semibold tracking-tight">
                Sign Out
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
});

export default Sidebar;
