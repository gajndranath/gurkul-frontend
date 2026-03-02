import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import { getSocket } from "@/sockets/socket";
import { useToast } from "@/hooks/useToast";

interface CallContextType {
  incomingCall: any;
  outgoingCall: any;
  activeCall: any;
  callDuration: number;
  isMuted: boolean;
  isRemoteMuted: boolean;
  isSpeakerOn: boolean;
  localStreamRef: React.RefObject<MediaStream | null>;
  remoteStreamRef: React.RefObject<MediaStream | null>;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  startCall: (otherId: string, otherType: string, isVideo: boolean, conversationId: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  rejectCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCallContext = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error("useCallContext must be used within CallProvider");
  return context;
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId, role, student, admin } = useSessionStore();
  const myName = student?.name || admin?.name || (role === "STUDENT" ? "Student" : "Admin");
  const tenantId = student?.tenantId || admin?.tenantId;
  const socket = getSocket();
  const { error } = useToast();

  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [outgoingCall, setOutgoingCall] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isRemoteMuted, setIsRemoteMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  // WebRTC Refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const ringtoneRef = useRef<{ 
    context: AudioContext; 
    oscillator?: OscillatorNode; 
    gain?: GainNode;
    interval?: ReturnType<typeof setInterval>;
  } | null>(null);

  const iceConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  };

  const setOpusBitrate = (sdp: string, bitrate: number) => {
    let lines = sdp.split("\r\n");
    let opusPayload: string | null = null;
    for (let line of lines) {
      if (line.includes("a=rtpmap:") && line.includes("opus/48000")) {
        opusPayload = line.split(":")[1].split(" ")[0];
        break;
      }
    }
    if (opusPayload) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`a=fmtp:${opusPayload}`)) {
          lines[i] = lines[i] + `;maxaveragebitrate=${bitrate}`;
          break;
        }
      }
    }
    return lines.join("\r\n");
  };

  // Call duration timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (activeCall) {
      timer = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall]);

  const cleanupWebRTC = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteStreamRef.current = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
  };

  const setupPeerConnection = (otherId: string, otherType: string) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection(iceConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("call:ice_candidate", {
          otherId,
          otherType,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      console.log("[CallContext] Received remote track", event.streams[0]);
      
      const remoteStream = event.streams[0];
      const localStream = localStreamRef.current;
      
      // Ensure we only process remote tracks and strictly avoid local ones
      if (localStream && (remoteStream.id === localStream.id)) {
        console.log("[CallContext] Ignoring local stream loopback");
        return;
      }

      // Check track IDs directly for even more safety
      const isLocalTrack = localStream?.getTracks().some(t => t.id === event.track.id);
      if (isLocalTrack) {
        console.log("[CallContext] Ignoring local track loopback:", event.track.id);
        return;
      }

      console.log("[CallContext] Processing remote track:", event.track.kind, event.track.id);
      
      remoteStreamRef.current = remoteStream;
      if (remoteAudioRef.current && event.track.kind === "audio") {
        remoteAudioRef.current.srcObject = remoteStream;
        console.log("[CallContext] Attached remote audio stream to element");
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[CallContext] Connection state:", pc.connectionState);
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        handleCallEnded();
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const handleCallEnded = () => {
    setActiveCall(null);
    setIncomingCall(null);
    setOutgoingCall(null);
    setIsRemoteMuted(false);
    cleanupWebRTC();
  };

  const startRingtone = () => {
    if (ringtoneRef.current?.interval) return;

    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playBeep = (freq: number, duration: number, startTime: number) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      osc.connect(gain);
      gain.connect(context.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const interval = setInterval(() => {
      const now = context.currentTime;
      // Double beep pattern
      playBeep(880, 0.15, now);
      playBeep(880, 0.15, now + 0.25);
    }, 2000);

    ringtoneRef.current = { context, interval };
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      if (ringtoneRef.current.interval) clearInterval(ringtoneRef.current.interval);
      if (ringtoneRef.current.context.state !== "closed") {
        ringtoneRef.current.context.close();
      }
      ringtoneRef.current = null;
    }
  };

  const rejectCall = () => {
    if (!incomingCall) return;
    socket.emit("call:reject", {
      callerId: incomingCall.callerId,
      callerType: incomingCall.callerType,
      conversationId: incomingCall.conversationId,
      tenantId: incomingCall.tenantId || tenantId,
    });
    setIncomingCall(null);
  };

  useEffect(() => {
    if (!userId) return;

    const handleIncomingCall = async (data: any) => {
      setIncomingCall(data);
      setTimeout(() => {
        setIncomingCall((prev: any) => {
           if (prev?.callerId === data.callerId) {
             return null;
           }
           return prev;
        });
      }, 30000); // Ring for 30s
    };

    const handleCallAccepted = async (data: any) => {
      setOutgoingCall(null);
      setActiveCall({
        otherId: data.acceptorId,
        otherType: data.acceptorType,
        name: data.acceptorName,
        conversationId: outgoingCall?.conversationId,
      });
      if (pcRef.current && data.answer) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
      }
    };

    const handleIceCandidate = async (data: any) => {
      if (pcRef.current && data.candidate) {
        try {
          await pcRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
        } catch (e) {
          console.error("ICE Candidate Error", e);
        }
      }
    };

    const handleCallRejected = () => {
      setOutgoingCall(null);
      cleanupWebRTC();
      error("Call rejected by recipient.");
    };

    const handleMuteStatus = (data: any) => {
      setIsRemoteMuted(data.isMuted);
    };

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:ice_candidate", handleIceCandidate);
    socket.on("call:mute-status", handleMuteStatus);

    return () => {
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:ice_candidate", handleIceCandidate);
      socket.off("call:mute-status", handleMuteStatus);
    };
  }, [socket, error, userId, outgoingCall]);

  const startCall = async (otherId: string, otherType: string, isVideo: boolean, conversationId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: isVideo,
      });
      localStreamRef.current = stream;

      const pc = setupPeerConnection(otherId, otherType);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      offer.sdp = setOpusBitrate(offer.sdp!, 12000);
      await pc.setLocalDescription(offer);

      setOutgoingCall({
        recipientId: otherId,
        recipientType: otherType,
        isVideo: false,
        conversationId,
      });
      socket.emit("call:initiate", {
        recipientId: otherId,
        recipientType: otherType,
        isVideo: false,
        offer,
        callerName: myName,
        conversationId,
        tenantId,
      });
    } catch (err: any) {
      console.error("Failed to get media", err);
      error("Media access denied. Please enable microphone.");
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: incomingCall.isVideo,
      });
      localStreamRef.current = stream;

      const pc = setupPeerConnection(incomingCall.callerId, incomingCall.callerType);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (incomingCall.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
        const answer = await pc.createAnswer();
        answer.sdp = setOpusBitrate(answer.sdp!, 12000);
        await pc.setLocalDescription(answer);

        socket.emit("call:accept", {
          callerId: incomingCall.callerId,
          callerType: incomingCall.callerType,
          answer,
          acceptorName: myName,
        });
      }

      setActiveCall({
        otherId: incomingCall.callerId,
        otherType: incomingCall.callerType,
        isVideo: incomingCall.isVideo,
        name: incomingCall.callerName,
        conversationId: incomingCall.conversationId,
      });
      setIncomingCall(null);
    } catch (err) {
      console.error("Failed to accept call", err);
      error("Could not access microphone/camera");
      rejectCall();
    }
  };

  const endCall = () => {
    const otherId = activeCall?.otherId || outgoingCall?.recipientId || incomingCall?.callerId;
    const otherType = activeCall?.otherType || outgoingCall?.recipientType || incomingCall?.callerType;
    const convId = activeCall?.conversationId || outgoingCall?.conversationId || incomingCall?.conversationId;

    if (otherId && otherType) {
      const status = activeCall ? "COMPLETED" : outgoingCall ? "CANCELLED" : "MISSED";
      socket.emit("call:hangup", {
        otherId,
        otherType,
        conversationId: convId,
        duration: callDuration,
        status,
        tenantId,
      });
    }
    handleCallEnded();
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    
    // Notify peer
    const otherId = activeCall?.otherId || outgoingCall?.recipientId || incomingCall?.callerId;
    const otherType = activeCall?.otherType || outgoingCall?.recipientType || incomingCall?.callerType;
    if (otherId && otherType) {
      socket.emit("call:mute-status", {
        recipientId: otherId,
        recipientType: otherType,
        isMuted: nextMuted
      });
    }
  };

  const toggleSpeaker = () => setIsSpeakerOn(!isSpeakerOn);

  useEffect(() => {
    if (incomingCall) {
      startRingtone();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  }, [incomingCall]);

  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.5;
    }
  }, [isSpeakerOn]);

  return (
    <CallContext.Provider
      value={{
        incomingCall,
        outgoingCall,
        activeCall,
        callDuration,
        isMuted,
        isRemoteMuted,
        isSpeakerOn,
        localStreamRef,
        remoteStreamRef,
        remoteAudioRef,
        startCall,
        acceptCall,
        endCall,
        rejectCall,
        toggleMute,
        toggleSpeaker,
      }}
    >
      {children}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />
    </CallContext.Provider>
  );
};
