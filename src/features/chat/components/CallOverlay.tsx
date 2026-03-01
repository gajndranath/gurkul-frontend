import React, { useState } from "react";
import { useChatStore } from "../../../stores/chatStore";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { getSocket } from "../../../sockets/socket";
import { stopRingingSound } from "../../../utils/notificationSound";

export const CallOverlay: React.FC = () => {
  const { incomingCall, setIncomingCall, activeCall, setActiveCall } = useChatStore();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const socket = getSocket();

  const handleDecline = () => {
    if (incomingCall && socket) {
      socket.emit("call:end", { 
        callId: incomingCall.callId,
        recipientId: incomingCall.from.userId,
        recipientType: incomingCall.from.userType
      });
    }
    setIncomingCall(null);
    stopRingingSound();
  };

  const handleAccept = () => {
    if (incomingCall) {
      // Transition to active call
      setActiveCall(incomingCall);
      setIncomingCall(null);
      stopRingingSound();
    }
  };

  const handleEndActive = () => {
    if (activeCall && socket) {
      socket.emit("call:end", { 
        callId: activeCall.callId,
        recipientId: activeCall.from.userId,
        recipientType: activeCall.from.userType
      });
    }
    setActiveCall(null);
  };

  if (!incomingCall && !activeCall) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl border border-white/20 overflow-hidden flex flex-col items-center p-12 text-center space-y-8 animate-in zoom-in-95 duration-500">
        
        {/* Avatar Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping duration-[3000ms]" />
          <div className="relative h-32 w-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
            {(incomingCall || activeCall)?.from.profilePicture ? (
              <img src={(incomingCall || activeCall)?.from.profilePicture} className="h-full w-full object-cover" alt="" />
            ) : (
              <div className="h-full w-full bg-slate-900 flex items-center justify-center text-white text-4xl font-black">
                {(incomingCall || activeCall)?.from.name?.[0] || "U"}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">
            {(incomingCall || activeCall)?.from.name || "Unknown Signal"}
          </h2>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] animate-pulse">
            {incomingCall ? "Incoming Secure Signal..." : "Active Connection..."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-6 pt-4">
          {incomingCall ? (
            <>
              <button
                onClick={handleDecline}
                className="h-16 w-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-110 active:scale-95 transition-all"
              >
                <PhoneOff size={24} />
              </button>
              <button
                onClick={handleAccept}
                className="h-20 w-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all animate-bounce"
              >
                <Phone size={32} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={handleEndActive}
                className="h-16 w-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200 hover:bg-rose-600 hover:scale-110 transition-all"
              >
                <PhoneOff size={24} />
              </button>
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${!isSpeakerOn ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {!isSpeakerOn ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
