import React, { memo, useEffect, useState } from "react";
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
  { label: "Friends", path: "/student/friends", icon: <Users size={18} /> },
];

const adminMenu = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Manage Students",
    path: "/admin/students",
    icon: <Users size={18} />,
  },
  { label: "Manage Slots", path: "/admin/slots", icon: <Armchair size={18} /> },
  {
    label: "Fee Management",
    path: "/admin/fees",
    icon: <IndianRupee size={18} />,
  },
  {
    label: "Reminders",
    path: "/admin/reminders",
    icon: <Clock size={18} />,
  },
  {
    label: "Announcements",
    path: "/admin/announcements",
    icon: <Bell size={18} />,
  },
  { label: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
];

const Sidebar: React.FC = memo(() => {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const closeSidebar = useUIStore((s) => s.closeSidebar);
  const role = useSessionStore((s) => s.role);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const rawMenu =
    role === "ADMIN" || role === "SUPER_ADMIN" ? adminMenu : studentMenu;
  const topMenu = rawMenu.filter(
    (item) =>
      item.label !== "Settings" && !(isMobile && item.label === "My Profile"),
  );
  const settingsItem = rawMenu.find((item) => item.label === "Settings");

  const handleLogout = async () => {
    try {
      if (role === "ADMIN") await logoutAdmin();
      else await logoutStudent();
    } finally {
      useSessionStore.getState().clearSession();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? "block" : "hidden"} sm:hidden`}
        onClick={closeSidebar}
      />

      <aside
        className={`z-50 top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out
          fixed sm:fixed /* Changed to fixed to ensure it stays during scroll */
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          sm:translate-x-0 overflow-y-auto custom-scrollbar`}
      >
        <nav className="flex flex-col h-full p-4 justify-between">
          <div className="space-y-6">
            <div className="px-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Operational Nodes
              </p>
            </div>

            <div className="space-y-1.5">
              {topMenu.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                    className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider">
                        {item.label}
                      </span>
                    </div>
                    {isActive && (
                      <ChevronRight
                        size={14}
                        className="animate-in slide-in-from-left-2"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-50">
            {settingsItem && (
              <button
                onClick={() => {
                  navigate(settingsItem.path);
                  closeSidebar();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  location.pathname === settingsItem.path
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Settings
                  size={18}
                  className={
                    location.pathname === settingsItem.path
                      ? "text-blue-400"
                      : "text-slate-400"
                  }
                />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {settingsItem.label}
                </span>
              </button>
            )}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 font-black transition-all group"
              onClick={handleLogout}
            >
              <div className="p-1 rounded-md bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                <LogOut size={16} />
              </div>
              <span className="text-[11px] uppercase tracking-widest">
                Logout
              </span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
});

export default Sidebar;
