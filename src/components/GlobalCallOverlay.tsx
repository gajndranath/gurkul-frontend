import React, { useState } from "react";
import { Phone, Mic, MicOff, PhoneOff, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { useCallContext } from "@/contexts/CallContext";
import { useSessionStore } from "@/stores/sessionStore";
import { AudioVisualizer } from "./AudioVisualizer";

const GlobalCallOverlay: React.FC = () => {
  const {
    activeCall,
    incomingCall,
    outgoingCall,
    callDuration,
    isMuted,
    isRemoteMuted,
    isSpeakerOn,
    localStreamRef,
    remoteStreamRef,
    acceptCall,
    endCall,
    rejectCall,
    toggleMute,
    toggleSpeaker,
  } = useCallContext();

  const { student, admin, role } = useSessionStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!activeCall && !incomingCall && !outgoingCall) return null;

  const myName = student?.name || admin?.name || (role === "STUDENT" ? "Student" : "Admin");
  const myInitials = myName?.[0]?.toUpperCase() || "?";

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentCall = activeCall || incomingCall || outgoingCall;
  const callerName = currentCall?.name || currentCall?.callerName || "Calling...";
  const callerInitials = callerName?.[0]?.toUpperCase() || "?";
  
  const statusText = activeCall 
    ? formatDuration(callDuration) 
    : incomingCall 
      ? "Incoming Secure Signal..." 
      : "Establishing Frequency...";

  // Shared Action Buttons Component
  const ActionButtons = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const btnClass = size === "lg" ? "h-16 w-16" : "p-2.5 h-10 w-10";
    const iconSize = size === "lg" ? 24 : 16;

    return (
      <div className={`flex items-center justify-center ${size === "lg" ? "gap-6 w-full max-w-sm mt-8" : "gap-2"}`}>
        {activeCall && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className={`flex items-center justify-center rounded-full transition-all ${btnClass} ${isMuted ? "bg-slate-800 text-white" : size === "lg" ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/10 text-white hover:bg-white/20"}`}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); endCall(); }}
              className={`flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 ${btnClass}`}
              title="End Call"
            >
              <PhoneOff size={iconSize} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleSpeaker(); }}
              className={`flex items-center justify-center rounded-full transition-all ${btnClass} ${isSpeakerOn ? "bg-blue-500 text-white" : size === "lg" ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/10 text-white hover:bg-white/20"}`}
              title={isSpeakerOn ? "Speaker Off" : "Speaker On"}
            >
              {isSpeakerOn ? <Volume2 size={iconSize} /> : <VolumeX size={iconSize} />}
            </button>
          </>
        )}
        {incomingCall && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); acceptCall(); }}
              className={`flex items-center justify-center bg-emerald-500 text-white rounded-full hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 ${btnClass}`}
            >
              <Phone size={iconSize} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); rejectCall(); }}
              className={`flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 ${btnClass}`}
            >
              <PhoneOff size={iconSize} />
            </button>
          </>
        )}
        {outgoingCall && (
          <button
            onClick={(e) => { e.stopPropagation(); endCall(); }}
            className={`flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-500/30 ${btnClass} ${size === "sm" ? "ml-2" : ""}`}
            >
            <PhoneOff size={iconSize} />
          </button>
        )}
      </div>
    );
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-3xl flex flex-col overflow-hidden">
        {/* Header Controls */}
        <div className="p-4 sm:p-6 flex justify-between items-center bg-black/30 shrink-0">
          <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeCall ? 'bg-emerald-500' : 'bg-blue-500'}`} />
            Secure Signal
          </span>
          <button
            onClick={() => setIsFullscreen(false)}
            className="text-white/50 hover:text-white transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-full"
          >
            <Minimize2 size={24} />
          </button>
        </div>

        {/* Central Visualization Area - Split Layout */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 sm:p-6 gap-6 md:gap-16 w-full max-w-6xl mx-auto overflow-hidden">
          
          {/* Decorative background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

          {/* Remote User */}
          <div className="flex flex-col items-center gap-4 z-10 shrink-0">
            <div className="h-8 sm:h-12 w-full max-w-[160px] flex items-center justify-center">
              {activeCall && !isRemoteMuted ? (
                <AudioVisualizer streamRef={remoteStreamRef} color="#10b981" isMirror />
              ) : (
                <div className="h-full w-full border-b border-emerald-500/20 opacity-30" />
              )}
            </div>
            
            <div className="relative group">
              <div className={`h-24 w-24 sm:h-40 sm:w-40 rounded-full bg-slate-800 shadow-xl flex items-center justify-center border-4 ${isRemoteMuted ? "border-slate-700/50" : "border-emerald-500/50"} backdrop-blur-sm overflow-hidden`}>
                <span className="text-4xl sm:text-6xl font-black text-white z-10">{callerInitials}</span>
              </div>
              {isRemoteMuted && (
                <div className="absolute -bottom-2 -right-2 bg-slate-800 text-red-400 p-2 rounded-full border border-slate-700 shadow-xl">
                  <MicOff size={16} />
                </div>
              )}
            </div>
            
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight text-center max-w-[200px] truncate">{callerName}</h3>
          </div>

          {/* Center Info Panel */}
          <div className="flex flex-col items-center gap-2 z-10 shrink-0 my-2 md:my-0">
            <div className="bg-slate-800/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-1">
              {activeCall && <div className="text-2xl font-black text-blue-400 font-mono">{formatDuration(callDuration)}</div>}
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                {activeCall ? "Duration" : statusText}
              </p>
            </div>
          </div>

          {/* Local User */}
          <div className="flex flex-col items-center gap-4 z-10 shrink-0">
            <div className="h-8 sm:h-12 w-full max-w-[160px] flex items-center justify-center hidden md:flex">
               {activeCall && !isMuted ? (
                 <AudioVisualizer streamRef={localStreamRef} color="#3b82f6" />
               ) : (
                 <div className="h-full w-full border-b border-blue-500/20 opacity-30" />
               )}
            </div>

            <div className="relative group">
              <div className={`h-24 w-24 sm:h-40 sm:w-40 rounded-full bg-slate-800 shadow-xl flex items-center justify-center border-4 ${isMuted ? "border-slate-700/50" : "border-blue-500/50"} backdrop-blur-sm overflow-hidden`}>
                <span className="text-4xl sm:text-6xl font-black text-white z-10">{myInitials}</span>
              </div>
              {isMuted && (
                <div className="absolute -bottom-2 -left-2 bg-slate-800 text-red-400 p-2 rounded-full border border-slate-700 shadow-xl">
                  <MicOff size={16} />
                </div>
              )}
            </div>

            {/* Mobile Local Audio Visualizer shows below avatar */}
            <div className="h-8 sm:h-12 w-full max-w-[160px] flex items-center justify-center md:hidden">
               {activeCall && !isMuted ? (
                 <AudioVisualizer streamRef={localStreamRef} color="#3b82f6" />
               ) : (
                 <div className="h-full w-full border-t border-blue-500/20 opacity-30" />
               )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight text-center max-w-[200px] truncate">{myName} (You)</h3>
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="p-4 sm:p-8 bg-black/40 flex justify-center shrink-0">
          <ActionButtons size="lg" />
        </div>
      </div>
    );
  }

  // Mini Floating Overlay (Default)
  return (
    <div 
      onClick={() => setIsFullscreen(true)}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-full flex items-center gap-4 sm:gap-6 shadow-2xl border border-white/10 animate-in slide-in-from-top-4 duration-300 pointer-events-auto max-w-[95%] w-max cursor-pointer hover:bg-slate-800 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
            {callerInitials}
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse z-10"></span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-wide max-w-[120px] truncate">
            {callerName}
          </span>
          <span className="text-xs text-slate-300 font-medium tracking-wider">
            {statusText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
         {/* Expand Hint */}
         <div className="mr-2 text-white/30 hidden sm:group-hover:block transition-all animate-in fade-in">
            <Maximize2 size={14} />
         </div>
         <ActionButtons size="sm" />
      </div>
    </div>
  );
};

export default GlobalCallOverlay;
