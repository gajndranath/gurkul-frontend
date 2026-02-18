import React, { useState, useEffect, useRef } from "react";
import { useProfile } from "../features/auth/hooks/useProfile";
import { useUIStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import { Separator } from "./ui/separator";
import {
  Menu,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import NotificationDropdown from "@/features/notifications/NotificationDropdown";
import { logoutStudent } from "../features/auth/api/studentAuthApi";
import { logoutAdmin } from "../features/auth/api/adminAuthApi";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const profileResult = useProfile();
  const user = profileResult.data;
  const isLoading = profileResult.isLoading ?? false;
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const role = useSessionStore((s) => s.role);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="h-16 bg-white/80 border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md">
      {/* LEFT: Branding */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
          onClick={toggleSidebar}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 hidden sm:block uppercase">
            Gurukul<span className="text-blue-600">.</span>
          </span>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3">
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-100 mx-1 hidden sm:block" />

        {isLoading ? (
          <div className="h-9 w-9 rounded-xl bg-slate-50 animate-pulse" />
        ) : user ? (
          <div className="relative">
            {/* Profile Button */}
            <button
              ref={profileButtonRef}
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 rounded-xl hover:bg-slate-50 p-1.5 transition-all outline-none group border border-transparent hover:border-slate-100"
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-black text-xs border border-blue-100">
                    {user.name?.[0] || "U"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="font-black text-[13px] text-slate-900 tracking-tight">
                  {user.name || "System User"}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {role || "Active Node"}
                </span>
              </div>

              <ChevronDown
                size={14}
                className={`text-slate-300 group-hover:text-slate-600 transition-all ${
                  isProfileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                ref={profileMenuRef}
                className="absolute right-0 mt-2 w-60 rounded-[24px] p-2 border border-slate-100 shadow-2xl bg-white ring-1 ring-slate-200/50 animate-in fade-in zoom-in-95 duration-200 z-50"
              >
                <div className="px-3 py-3 mb-1 bg-slate-50/50 rounded-[18px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                    Session Identity
                  </p>
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {user.email || "No Email Bound"}
                  </p>
                </div>

                <div className="p-1 space-y-1">
                  {/* My Registry */}
                  <button
                    onClick={() => {
                      navigate("/admin/profile");
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full rounded-xl gap-3 font-bold text-[11px] py-3 px-3 uppercase tracking-wider text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors flex items-center"
                  >
                    <User size={16} className="text-blue-500 mr-3" /> My
                    Registry
                  </button>

                  {/* Node Config */}
                  <button
                    onClick={() => {
                      navigate("/admin/settings");
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full rounded-xl gap-3 font-bold text-[11px] py-3 px-3 uppercase tracking-wider text-slate-600 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors flex items-center"
                  >
                    <Settings size={16} className="text-blue-500 mr-3" /> Node
                    Config
                  </button>
                </div>

                <Separator className="my-2 bg-slate-50" />

                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-xl gap-3 font-bold text-[11px] py-3 px-3 uppercase tracking-wider text-rose-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors flex items-center"
                  >
                    <LogOut size={16} className="mr-3" /> Terminate
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;
