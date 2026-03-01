import React, { Suspense } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "../components/ErrorBoundary";
import Loader from "../components/Loader";
import { useSocket } from "../hooks/useSocket";
import { LayoutDashboard, Bell, User, Users, CreditCard } from "lucide-react";

import { useUIStore } from "../stores/uiStore";
import { Header } from "../components/Header";
import Sidebar from "../components/Sidebar";
import { EntityDrawer } from "../components/shared/EntityDrawer";
import { useNotificationSocket } from "../features/notifications/hooks/useNotificationSocket";
import { useSessionStore } from "../stores/sessionStore";
import { useChatSync } from "../hooks/useChatSync";
import { CallOverlay } from "../features/chat/components/CallOverlay";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSocket();
  useNotificationSocket();
  useChatSync();
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSessionStore((s) => s.role);

  // Drawer State
  const { isEntityDrawerOpen, selectedEntity, closeEntityDrawer } = useUIStore();
  
  // Sync with Sidebar state
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  // ✅ Role-aware navigation items
  const isAdmin = role && ["SUPER_ADMIN", "STAFF", "ADMIN"].includes(role);

  const navItems = isAdmin
    ? [
        { label: "Home", icon: LayoutDashboard, path: "/admin/dashboard" },
        { label: "Students", icon: Users, path: "/admin/students" },
        { label: "Alerts", icon: Bell, path: "/admin/notifications" },
        { label: "Profile", icon: User, path: "/admin/profile" },
      ]
    : [
        { label: "Home", icon: LayoutDashboard, path: "/student/dashboard" },
        { label: "Fees", icon: CreditCard, path: "/student/fees" },
        { label: "Alerts", icon: Bell, path: "/student/notifications" },
        { label: "Profile", icon: User, path: "/student/profile" },
      ];

  const isChatPage = location.pathname.includes("/chat");

  return (
    <ErrorBoundary>
        <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
          {/* 1. HEADER */}
          <div className="h-16 flex-shrink-0 z-[60]">
            <Header />
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            {/* 2. SIDEBAR */}
            <Sidebar />

            {/* 3. MAIN CONTENT */}
            <main
              className={`
                flex-1 w-full ml-0 sm:ml-64 
                transition-all duration-300 ease-in-out 
                overflow-x-hidden
                bg-[#f8fafc]
                ${isChatPage ? "overflow-hidden flex flex-col" : "overflow-y-auto pb-24 sm:pb-0"}
              `}
            >
              <div className={`
                max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700
                ${isChatPage ? "w-full h-full p-0" : "p-4 sm:p-8 md:p-10"}
              `}>
                <Suspense fallback={<Loader />}>
                    {children ?? <Outlet />}
                </Suspense>
              </div>
            </main>
          </div>

          {/* 4. MOBILE BOTTOM NAV - Role-aware */}
          {!isChatPage && (
            <div
              className={`
              fixed bottom-6 left-0 right-0 z-[60] flex justify-center px-4 sm:hidden 
              transition-all duration-300 ease-in-out
              ${sidebarOpen ? "opacity-0 translate-y-10 pointer-events-none" : "opacity-100 translate-y-0 pointer-events-auto"}
            `}
            >
              <nav
                className="
                flex items-center justify-around
                w-full max-w-[420px] h-16 
                bg-slate-900/90 backdrop-blur-2xl 
                rounded-[24px] border border-white/10 
                shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                px-2 relative
              "
              >
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.label}
                      className="relative flex-1 flex flex-col items-center justify-center h-full transition-all active:scale-90"
                      onClick={() => navigate(item.path)}
                    >
                      {active && (
                        <div className="absolute inset-x-2 inset-y-2 bg-blue-600/20 rounded-xl animate-in fade-in zoom-in-95" />
                      )}

                      <div
                        className={`flex flex-col items-center gap-1 transition-all ${active ? "text-blue-400" : "text-slate-400"}`}
                      >
                        <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                        <span className="text-[9px] font-black uppercase tracking-wider">
                          {item.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* 5. ENTITY DRAWER (NUCLEUS) */}
          <EntityDrawer 
            isOpen={isEntityDrawerOpen}
            onClose={closeEntityDrawer}
            student={selectedEntity}
          />

          {/* 6. CALL OVERLAY */}
          <CallOverlay />
        </div>
    </ErrorBoundary>
  );
};

export default RootLayout;
