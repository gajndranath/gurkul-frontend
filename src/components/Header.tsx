import React, { useState, useEffect, useRef } from "react";
import { useProfile } from "../features/auth/hooks/useProfile";
import { useUIStore } from "../stores/uiStore";
import { useSessionStore } from "../stores/sessionStore";
import {
  LogOut,
  ChevronDown,
  ShieldCheck,
  Search,
  Command,
  MapPin,
  MoreVertical,
  Loader2,
  Inbox
} from "lucide-react";
import NotificationDropdown from "@/features/notifications/NotificationDropdown";
import { useLogoutStudent } from "../features/auth/hooks/useStudentAuth";
import { useLogoutAdmin } from "../features/auth/hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../api/studentsAdminApi";
import { useDebounce } from "../hooks/useDebounce";
import { Badge } from "./ui/badge";

export const Header: React.FC = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  const profileResult = useProfile();
  const user = profileResult.data;
  const { toggleSidebar, openEntityDrawer } = useUIStore();
  const role = useSessionStore((s) => s.role);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 400);
  const searchRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Students for Search Results
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["global-search", debouncedSearch],
    queryFn: () => getStudents({ search: debouncedSearch, limit: 5 }),
    enabled: debouncedSearch.length >= 2,
  });

  const rawData = searchResults as any;
  const students = rawData?.data?.students || rawData?.students || [];

  const logoutAdmin = useLogoutAdmin();
  const logoutStudent = useLogoutStudent();

  // 2. Handle Logout
  const handleLogout = async () => {
    const isAdmin = (role as string) === "ADMIN" || role === "SUPER_ADMIN" || role === "STAFF";
    try {
      if (isAdmin) {
        await logoutAdmin.mutateAsync();
      } else {
        await logoutStudent.mutateAsync();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      const loginPath = isAdmin ? "/admin/login" : "/student/login";
      useSessionStore.getState().logout();
      window.location.href = loginPath;
    }
  };

  // 3. Handle Shortcuts & Outside Clicks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectStudent = (student: any) => {
    openEntityDrawer(student);
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  return (
    <header className="h-16 bg-white/80 border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-50 backdrop-blur-md">
      {/* LEFT: Branding & Toggle */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 -ml-2 rounded-xl hover:bg-slate-50 transition-colors text-slate-500"
          onClick={toggleSidebar}
        >
          <MoreVertical size={20} />
        </button>
        <div className="h-5 w-px bg-slate-100 mx-2" />
        <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest hidden lg:block">Registry Nucleus</h2>
      </div>

      {/* CENTER: Global Search */}
      <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </div>
        
        <input 
          id="global-search"
          type="text" 
          placeholder="Global Registry Search (Name, Seat, ID)..." 
          className="w-full h-11 pl-12 pr-4 bg-slate-50 border-none rounded-xl text-[13px] font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all outline-none italic"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-md shadow-sm pointer-events-none">
          <Command size={10} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400">K</span>
        </div>

        {/* RESULTS DROPDOWN */}
        {isSearchFocused && (searchQuery.length >= 2 || students.length > 0) && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-3 bg-slate-50/50 border-b border-slate-100">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Search Results</p>
             </div>
             <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {students.length > 0 ? (
                  students.map((student: any) => (
                    <button
                       key={student._id}
                       onClick={() => handleSelectStudent(student)}
                       className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-none group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black group-hover:bg-blue-600 group-hover:text-white transition-all uppercase italic">
                           {student.name.charAt(0)}
                        </div>
                        <div>
                           <p className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{student.name}</p>
                           <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400">{student.studentId}</span>
                              <div className="h-1 w-1 rounded-full bg-slate-200" />
                              <span className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1">
                                 <MapPin size={10} /> {student.seatNumber || "UNSET"}
                              </span>
                           </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400 border-slate-200">{student.status}</Badge>
                    </button>
                  ))
                ) : debouncedSearch.length >= 2 ? (
                  <div className="p-12 text-center text-slate-400">
                     <Inbox size={32} className="mx-auto text-slate-200 mb-3" />
                     <p className="text-[11px] font-black uppercase tracking-widest">No members found</p>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                     <p className="text-[10px] font-bold text-slate-300 uppercase italic">Type at least 2 characters...</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationDropdown />
        <div className="h-6 w-px bg-slate-100 mx-1 hidden sm:block" />

        <div className="relative">
          <button
            ref={profileButtonRef}
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
          >
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200">
               {user?.name?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tight">{user?.name || "Member"}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{role}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileMenuOpen && (
            <div
              ref={profileMenuRef}
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 z-50"
            >
              <div className="p-3 mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account Nucleus</p>
                <p className="text-[13px] font-black text-slate-900 truncate uppercase">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate("/profile"); setIsProfileMenuOpen(false); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 group"
              >
                <ShieldCheck size={18} className="group-hover:text-blue-600" />
                <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-slate-900">Security</span>
              </button>
              <hr className="my-2 border-slate-50" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 transition-colors text-rose-500 group"
              >
                <LogOut size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
