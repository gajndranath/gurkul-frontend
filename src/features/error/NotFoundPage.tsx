import React from "react";
import { useNavigate } from "react-router-dom";
import { MoveLeft, Ghost, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/stores/sessionStore";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, token } = useSessionStore();

  const handleGoBack = () => {
    if (!token) {
      navigate("/");
    } else {
      navigate(role === "STUDENT" ? "/student/dashboard" : "/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fafafa] flex flex-col items-center justify-center p-6 selection:bg-blue-100 italic">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute top-[-10%] left-[-5%] text-[30rem] font-black text-slate-900 leading-none">
          404
        </div>
        <div className="absolute bottom-[-10%] right-[-5%] text-[30rem] font-black text-slate-900 leading-none">
          LOST
        </div>
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
        {/* 404 Visual Node */}
        <div className="relative inline-block group">
          <div className="h-32 w-32 md:h-48 md:w-48 bg-slate-950 rounded-[40px] flex items-center justify-center shadow-2xl shadow-slate-200 transform group-hover:rotate-6 transition-transform duration-500">
            <Ghost size={64} className="text-white md:hidden" />
            <Ghost size={96} className="text-white hidden md:block" />
          </div>
          <div className="absolute -top-4 -right-4 h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 animate-bounce">
             <Search size={22} />
          </div>
        </div>

        {/* Textual Nerve Center */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
              Protocol Error: 404
            </p>
            <h1 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">
              Lost In The <span className="text-blue-600">Stacks</span>
            </h1>
          </div>
          <p className="text-sm md:text-base font-bold text-slate-500 max-w-md mx-auto leading-relaxed uppercase tracking-tight">
            The record you are attempting to access is either missing, archived, or exists in a parallel dimension of this library.
          </p>
        </div>

        {/* Action Interface */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleGoBack}
            className="h-14 px-10 bg-slate-950 hover:bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-xl shadow-slate-200 group"
          >
            <MoveLeft className="mr-3 group-hover:-translate-x-1 transition-transform" size={16} />
            Back To Reality
          </Button>
          
          <div className="flex items-center gap-3 px-6 h-14 rounded-2xl border border-slate-100 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-sm">
             <BookOpen size={16} className="text-blue-600" />
             Unauthorized Navigation Detected
          </div>
        </div>
      </div>

      {/* System Insight Footer */}
      <div className="fixed bottom-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
        Gurukul Library OS v8.1.0-RC1 // System Anomaly Rectified
      </div>
    </div>
  );
};

export default NotFoundPage;
