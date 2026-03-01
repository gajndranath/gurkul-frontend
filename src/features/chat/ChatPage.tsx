import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Send,
  Image as ImageIcon,
  ChevronLeft,
  MoreVertical,
  Search,
  MessageSquare,
  Loader2,
  Phone,
  Edit2,
  Volume2,
  VolumeX,
  XCircle,
  Trash2,
  Check,
  PhoneOff,
  Mic,
  MicOff,
  ShieldOff,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import { chatApi, type ChatMessage } from "./api/chatApi";
import { useSessionStore } from "@/stores/sessionStore";
import { getSocket } from "@/sockets/socket";
import { useToast } from "@/hooks/useToast";
import { format, isToday, isYesterday } from "date-fns";
import { useInView } from "react-intersection-observer";
import ImageEditor from "./components/ImageEditor";

const EMOJI_OPTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥"];

const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [searchParams] = React.useMemo(
    () => [new URLSearchParams(window.location.search)],
    [],
  );
  const targetUserId = searchParams.get("userId");
  const targetUserType =
    (searchParams.get("userType") as "Student" | "Admin") || "Student";

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { error } = useToast();
  const { userId, role, student, admin } = useSessionStore();
  const myName =
    student?.name || admin?.name || (role === "STUDENT" ? "Student" : "Admin");
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "STAFF"].includes(role || "");
  const chatPathBase = isAdmin ? "/admin/chat" : "/student/chat";
  const socket = getSocket();

  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [outgoingCall, setOutgoingCall] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMutedNotifications, setIsMutedNotifications] = useState(false);

  // Advanced Features State
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [optimisticImage, setOptimisticImage] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedImageForLightbox, setSelectedImageForLightbox] = useState<
    string | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastMarkedReadId = useRef<string | null>(null);

  // WebRTC Refs
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

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

  // Key management removed for Instagram-style migration

  // Handle auto-initiation from query param
  useEffect(() => {
    if (targetUserId && !conversationId) {
      chatApi
        .getOrCreateConversation(targetUserId, targetUserType)
        .then((conv) => {
          navigate(`${chatPathBase}/${conv._id}`, { replace: true });
        })
        .catch(() => {
          error("Failed to start conversation");
          navigate(chatPathBase, { replace: true });
        });
    }
  }, [
    targetUserId,
    targetUserType,
    conversationId,
    navigate,
    error,
    chatPathBase,
  ]);

  // Queries
  const { data: conversations, isLoading: loadingConfs } = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: chatApi.getConversations,
    staleTime: 30000, // 30 seconds stability
    refetchOnWindowFocus: false,
  });

  const activeConversation = conversations?.find(
    (c) => c._id === conversationId,
  );

  const {
    data: infiniteMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingMessages,
  } = useInfiniteQuery<
    ChatMessage[],
    Error,
    InfiniteData<ChatMessage[], string | undefined>
  >({
    queryKey: ["chat", "messages", conversationId],
    queryFn: ({ pageParam }) =>
      chatApi.getMessages(conversationId!, {
        before: pageParam as string | undefined,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.length >= 50
        ? lastPage[lastPage.length - 1].createdAt
        : undefined,
    enabled: !!conversationId,
    initialPageParam: undefined,
  });

  const messages = React.useMemo(() => {
    // Flatten and reverse to get oldest at top
    // Since backend returns [newest ... oldest] per page, and pages are [latest_page, older_page, ...]
    const flattened = infiniteMessages?.pages.flatMap((page) => page) || [];
    const baseMessages = [...flattened].reverse();

    if (!searchTerm.trim()) return baseMessages;

    return baseMessages.filter(
      (m) =>
        m.content?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        m.contentType === "IMAGE", // Can't really search image content but keep them?
    );
  }, [infiniteMessages, searchTerm]);

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { date: string; messages: any[] }[] = [];
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      let dateLabel = format(date, "MMMM d, yyyy");
      if (isToday(date)) dateLabel = "Today";
      else if (isYesterday(date)) dateLabel = "Yesterday";

      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === dateLabel) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date: dateLabel, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  // Mark as read ONLY if there are unread messages and we haven't already marked this session
  useEffect(() => {
    if (conversationId && activeConversation && (activeConversation.unreadCount || 0) > 0) {
        if (lastMarkedReadId.current === conversationId) return;
        lastMarkedReadId.current = conversationId;
        
        chatApi.markAsRead(conversationId)
            .then(() => {
                // Background update WITHOUT invalidation
                queryClient.setQueryData(["chat", "conversations"], (old: any) => {
                    if (!old) return old;
                    return old.map((c: any) => c._id === conversationId ? { ...c, unreadCount: 0 } : c);
                });
            })
            .catch(console.error);
    }
  }, [conversationId, activeConversation?._id, activeConversation?.unreadCount, queryClient]);

  // Reset ref ONLY when conversationId actually change to a new valid string
  useEffect(() => {
    if (!conversationId) {
        lastMarkedReadId.current = null;
    }
  }, [conversationId]);

  // Handle derived states separately
  useEffect(() => {
    if (activeConversation) {
      setIsBlocked(
        activeConversation.blockedBy?.includes(userId as any) || false,
      );
      setIsMutedNotifications(
        activeConversation.mutedBy?.includes(userId as any) || false,
      );
    }
  }, [activeConversation, userId]);

  // --- Socket Handlers ---
  // --- Socket Handlers ---
  // --- Socket Handlers (Memoized) ---
  const handleNewMessage = React.useCallback(
    (message: any) => {
      console.log("[ChatPage] Socket Event: new_message", message);
      const isForMe = String(message.recipientId) === String(userId);
      const isCurrent = String(message.conversationId) === String(conversationId);

      // 1. Update infinite query for current chat if it matches
      if (isCurrent) {
        queryClient.setQueryData(
          ["chat", "messages", conversationId],
          (old: any) => {
            if (!old || !old.pages) return old;
            const pages = [...old.pages];
            const firstPage = pages[0] || [];
            
            // Handle optimistic update replacement
            const optimisticIndex = firstPage.findIndex((m: any) => 
                (m.tempId && m.tempId === message.tempId) || 
                (String(m._id).startsWith('temp-') && String(m._id) === String(message.tempId))
            );

            if (optimisticIndex !== -1) {
                firstPage[optimisticIndex] = message;
                pages[0] = [...firstPage];
                return { ...old, pages };
            }

            const exists = firstPage.some((m: any) => String(m._id) === String(message._id));
            if (exists) return old;

            pages[0] = [message, ...firstPage];
            return { ...old, pages };
          },
        );

        if (isForMe) {
          socket.emit("chat:delivered", { messageId: message._id });
          socket.emit("chat:read_all", { conversationId });
        }
      } else if (isForMe) {
        socket.emit("chat:delivered", { messageId: message._id });
      }

      // 2. ALWAYS update the conversations query (sidebar)
      queryClient.setQueryData(["chat", "conversations"], (old: any) => {
        if (!old) return old;
        const preview = message.contentType === "IMAGE" ? "📷 Image" : (message.content || "New message");
        
        let found = false;
        const updated = old.map((c: any) => {
          if (String(c._id) === String(message.conversationId)) {
            found = true;
            return {
              ...c,
              lastMessageAt: message.createdAt,
              lastMessagePreview: preview,
              unreadCount: isCurrent ? 0 : (c.unreadCount || 0) + (isForMe ? 1 : 0),
            };
          }
          return c;
        });

        // If it's a new conversation not in our list, invalidate to fetch full objects
        if (!found) {
            queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
            return old;
        }

        return [...updated].sort((a: any, b: any) => 
            new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        );
      });
    },
    [conversationId, userId, queryClient, socket],
  );

  const handleStatusUpdate = React.useCallback(
    (data: { messageId: string; conversationId: string; status: string }) => {
      if (String(data.conversationId) === String(conversationId)) {
        queryClient.setQueryData(
          ["chat", "messages", String(conversationId)],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any[]) =>
                page.map((m) =>
                  String(m._id) === String(data.messageId) ? { ...m, status: data.status } : m,
                ),
              ),
            };
          },
        );
      }
    },
    [conversationId, queryClient],
  );

  const handleBulkStatusUpdate = React.useCallback(
    (data: { conversationId: string; status: string }) => {
      if (String(data.conversationId) === String(conversationId)) {
        queryClient.setQueryData(
          ["chat", "messages", conversationId],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any[]) =>
                page.map((m) =>
                  String(m.senderId) === String(userId) ? { ...m, status: data.status } : m,
                ),
              ),
            };
          },
        );
      }
    },
    [conversationId, userId, queryClient],
  );

  const handleTyping = React.useCallback(
    (data: { from: { userId: string; userType: string } }) => {
      if (String(data.from.userId) !== String(userId)) setIsTyping(true);
    },
    [userId],
  );

  const handleStopTyping = React.useCallback(
    (data: { from: { userId: string; userType: string } }) => {
      if (String(data.from.userId) !== String(userId)) setIsTyping(false);
    },
    [userId],
  );

  const handleUnreadCountUpdate = React.useCallback(
    (data: { count: number }) => {
      setUnreadCount(data.count);
    },
    [],
  );

  const handleMessageEdited = React.useCallback(
    (data: {
      messageId: string;
      conversationId: string;
      content: string;
      editedAt: string;
    }) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData(
          ["chat", "messages", conversationId],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any[]) =>
                page.map((m) =>
                  m._id === data.messageId
                    ? { ...m, content: data.content, editedAt: data.editedAt }
                    : m,
                ),
              ),
            };
          },
        );
      }
    },
    [conversationId, queryClient],
  );

  const handleMessageDeleted = React.useCallback(
    (data: { messageId: string; conversationId: string }) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData(
          ["chat", "messages", conversationId],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any[]) =>
                page.map((m) =>
                  m._id === data.messageId
                    ? {
                        ...m,
                        isDeleted: true,
                        content: "This message was deleted",
                      }
                    : m,
                ),
              ),
            };
          },
        );
      }
    },
    [conversationId, queryClient],
  );

  const handleReactionUpdated = React.useCallback(
    (data: { messageId: string; conversationId: string; reactions: any[] }) => {
      if (data.conversationId === conversationId) {
        queryClient.setQueryData(
          ["chat", "messages", conversationId],
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page: any[]) =>
                page.map((m) =>
                  m._id === data.messageId
                    ? { ...m, reactions: data.reactions }
                    : m,
                ),
              ),
            };
          },
        );
      }
    },
    [conversationId, queryClient],
  );

  const handleIncomingCall = React.useCallback(async (data: any) => {
    setIncomingCall(data);
    setTimeout(() => {
      setIncomingCall((prev: any) =>
        prev?.callerId === data.callerId ? null : prev,
      );
    }, 30000);
  }, []);

  const handleCallAccepted = React.useCallback(async (data: any) => {
    setOutgoingCall(null);
    setActiveCall({
      otherId: data.acceptorId,
      otherType: data.acceptorType,
      name: data.acceptorName,
    });
    if (pcRef.current && data.answer) {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(data.answer),
      );
    }
  }, []);

  const handleIceCandidate = React.useCallback(async (data: any) => {
    if (pcRef.current && data.candidate) {
      try {
        await pcRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate),
        );
      } catch (e) {
        console.error("ICE Candidate Error", e);
      }
    }
  }, []);

  const handleCallRejected = React.useCallback(() => {
    setOutgoingCall(null);
    cleanupWebRTC();
    error("Call rejected");
  }, [error]);

  const handleCallEnded = React.useCallback(() => {
    setActiveCall(null);
    setIncomingCall(null);
    setOutgoingCall(null);
    cleanupWebRTC();
  }, []);

  // Consolidated Socket Handlers
  useEffect(() => {
    socket.on("new_message", handleNewMessage);
    socket.on("chat:status", handleStatusUpdate);
    socket.on("chat:status_bulk", handleBulkStatusUpdate);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:stop_typing", handleStopTyping);
    socket.on("chat:unread_count_update", handleUnreadCountUpdate);
    socket.on("chat:message_edited", handleMessageEdited);
    socket.on("chat:message_deleted", handleMessageDeleted);
    socket.on("chat:reaction_updated", handleReactionUpdated);

    socket.on("call:incoming", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("call:rejected", handleCallRejected);
    socket.on("call:ended", handleCallEnded);
    socket.on("call:ice_candidate", handleIceCandidate);

    socket.on("chat:status_changed", (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      if (data.type === "DELETE") navigate(chatPathBase);
    });

    if (conversationId) {
      socket.emit("chat:set-active-conversation", { conversationId });
    }
    socket.emit("chat:get_unread_count");

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("chat:status", handleStatusUpdate);
      socket.off("chat:status_bulk", handleBulkStatusUpdate);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stop_typing", handleStopTyping);
      socket.off("chat:unread_count_update", handleUnreadCountUpdate);
      socket.off("chat:message_edited", handleMessageEdited);
      socket.off("chat:message_deleted", handleMessageDeleted);
      socket.off("chat:reaction_updated", handleReactionUpdated);
      socket.off("call:incoming", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("call:rejected", handleCallRejected);
      socket.off("call:ended", handleCallEnded);
      socket.off("call:ice_candidate", handleIceCandidate);
      socket.off("chat:status_changed");
      if (conversationId) socket.emit("chat:clear-active-conversation");
    };
  }, [
    socket,
    conversationId,
    queryClient,
    navigate,
    chatPathBase,
    handleNewMessage,
    handleStatusUpdate,
    handleBulkStatusUpdate,
    handleTyping,
    handleStopTyping,
    handleUnreadCountUpdate,
    handleMessageEdited,
    handleMessageDeleted,
    handleReactionUpdated,
    handleIncomingCall,
    handleCallAccepted,
    handleCallRejected,
    handleCallEnded,
    handleIceCandidate,
  ]);

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
      console.log("[ChatPage] Received remote track", event.streams[0]);
      remoteStreamRef.current = event.streams[0];
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      console.log("[ChatPage] Connection state:", pc.connectionState);
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

  const startCall = async (isVideo: boolean) => {
    const other = activeConversation?.participants?.find(
      (p) => String(p.participantId) !== String(userId),
    );
    if (!other) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo,
      });
      localStreamRef.current = stream;

      const pc = setupPeerConnection(
        other.participantId,
        other.participantType,
      );
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      // Munge SDP for 2G optimization (12kbps)
      offer.sdp = setOpusBitrate(offer.sdp!, 12000);
      await pc.setLocalDescription(offer);

      setOutgoingCall({
        recipientId: other.participantId,
        recipientType: other.participantType,
        isVideo: false,
      });
      socket.emit("call:initiate", {
        recipientId: other.participantId,
        recipientType: other.participantType,
        isVideo: false,
        offer,
        callerName: myName,
        conversationId,
        tenantId: student?.tenantId || admin?.tenantId,
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
        audio: true,
        video: incomingCall.isVideo,
      });
      localStreamRef.current = stream;

      const pc = setupPeerConnection(
        incomingCall.callerId,
        incomingCall.callerType,
      );
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      if (incomingCall.offer) {
        await pc.setRemoteDescription(
          new RTCSessionDescription(incomingCall.offer),
        );
        const answer = await pc.createAnswer();
        // Munge SDP for 2G optimization (12kbps)
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
      });
      setIncomingCall(null);
    } catch (err) {
      console.error("Failed to accept call", err);
      error("Could not access microphone/camera");
      socket.emit("call:reject", {
        callerId: incomingCall.callerId,
        callerType: incomingCall.callerType,
        conversationId: incomingCall.conversationId,
        tenantId: incomingCall.tenantId,
      });
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    const otherId =
      activeCall?.otherId ||
      outgoingCall?.recipientId ||
      incomingCall?.callerId;
    const otherType =
      activeCall?.otherType ||
      outgoingCall?.recipientType ||
      incomingCall?.callerType;

    if (otherId && otherType) {
      const status = activeCall
        ? "COMPLETED"
        : outgoingCall
          ? "CANCELLED"
          : "MISSED";
      socket.emit("call:hangup", {
        otherId,
        otherType,
        conversationId,
        duration: callDuration,
        status,
        tenantId: student?.tenantId || admin?.tenantId,
      });
    }
    handleCallEnded();
  };

  // Media Controls Logic
  useEffect(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeakerOn ? 1.0 : 0.5; // Simplified speaker logic
      // In real mobile apps, this switches between earpiece and speaker.
      // In web, we just adjust volume or use setSinkId if supported.
    }
  }, [isSpeakerOn]);

  // Call Duration Timer
  useEffect(() => {
    let interval: any;
    if (activeCall) {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const otherUser = activeConversation?.participants?.find(
    (p) => String(p.participantId) !== String(userId),
  );
  const otherName = otherUser?.name || "User";

  const handleViewProfile = () => {
    if (!otherUser) return;
    const profilePath =
      otherUser.participantType === "Admin"
        ? `/admin/profile`
        : isAdmin
          ? `/admin/students/${otherUser.participantId}`
          : `/student/students/${otherUser.participantId}`;
    navigate(profilePath);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      // Increased to 10MB for better editing
      error("Image must be less than 10MB");
      return;
    }

    const url = URL.createObjectURL(file);
    setEditingImage(url);
    setIsEditorOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditorSave = async (blob: Blob) => {
    setIsEditorOpen(false);

    const file = new File([blob], "edited-image.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("image", file);

    // Optimistic Preview
    const previewUrl = URL.createObjectURL(file);
    setOptimisticImage(previewUrl);

    try {
      setIsUploading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"}/upload/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${useSessionStore.getState().token}`,
          },
          body: formData,
        },
      );
      const data = await response.json();
      if (data.success) {
        // Re-fetch latest otherUser if needed
        const currentOtherUser = activeConversation?.participants?.find(
          (p) => p.participantId !== userId,
        );
        const rId = currentOtherUser?.participantId || otherUser?.participantId;
        const rType =
          currentOtherUser?.participantType || otherUser?.participantType;

        // --- OPTIMISTIC UPDATE ---
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      tempId,
      conversationId: conversationId!,
      senderId: userId!,
      senderType: role === "STUDENT" ? "Student" : "Admin",
      recipientId: rId!,
      recipientType: rType!,
      content: data.data.url,
      contentType: "IMAGE",
      status: "SENDING",
      createdAt: new Date().toISOString(),
    };

    // Update the messages list optimistically
    queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
      ["chat", "messages", conversationId],
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return [optimisticMessage, ...page];
            }
            return page;
          }),
        };
      }
    );

    // Emit the message via socket
    socket.emit(
      "chat:send",
      {
        conversationId,
        recipientId: rId,
        recipientType: rType,
        content: data.data.url,
        contentType: "IMAGE",
        tempId, // Pass tempId to backend so it can be returned for mapping
      },
      (response: any) => {
        console.log("Message send response:", response);
        if (response.success) {
          // Success handled in socket event 'new_message' or 'chat:status'
        } else {
          // Handle error (e.g. mark optimistic message as failed)
          queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
            ["chat", "messages", conversationId],
            (oldData) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page) =>
                  page.map((m) =>
                    m._id === tempId ? { ...m, status: "ERROR" } : m
                  )
                ),
              };
            }
          );
        }
      }
    );
      } else {
        error(data.message || "Upload failed");
      }
    } catch (err) {
      error("Failed to upload image");
    } finally {
      setIsUploading(false);
      setOptimisticImage(null);
      setEditingImage(null);
    }
  };

  const handleEditorCancel = () => {
    setIsEditorOpen(false);
    setEditingImage(null);
  };

  const handleSendMessage = async (
    e: React.FormEvent | null,
    type: "TEXT" | "IMAGE" = "TEXT",
    imageUrl?: string,
  ) => {
    if (e) e.preventDefault();
    if (type === "TEXT" && !messageInput.trim()) return;
    if (type === "IMAGE" && !imageUrl) return;

    if (!otherUser || !conversationId) return;

    const content = type === "TEXT" ? messageInput : imageUrl || "";

    // --- OPTIMISTIC UPDATE ---
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      tempId,
      conversationId,
      senderId: userId!,
      senderType: role === "STUDENT" ? "Student" : "Admin",
      recipientId: otherUser.participantId,
      recipientType: otherUser.participantType,
      content,
      contentType: type,
      status: "SENDING",
      createdAt: new Date().toISOString(),
    };

    // Update the messages list optimistically
    queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
      ["chat", "messages", conversationId],
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page, index) => {
            if (index === 0) {
              return [optimisticMessage, ...page];
            }
            return page;
          }),
        };
      }
    );

    if (type === "TEXT") setMessageInput("");

    // Emit the message via socket
    socket.emit(
      "chat:send",
      {
        conversationId,
        recipientId: otherUser.participantId,
        recipientType: otherUser.participantType,
        content,
        contentType: type,
        tempId,
      },
      (response: any) => {
        if (!response.success) {
          // Handle error
          queryClient.setQueryData<InfiniteData<ChatMessage[]>>(
            ["chat", "messages", conversationId],
            (oldData) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                pages: oldData.pages.map((page) =>
                  page.map((m) =>
                    m._id === tempId ? { ...m, status: "ERROR" } : m
                  )
                ),
              };
            }
          );
        }
      }
    );
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      const isNewMessage = latestMsg._id !== lastMessageIdRef.current;

      if (isNewMessage) {
        const isMine = String(latestMsg.senderId) === String(userId);
        const scrollContainer = scrollRef.current;

        if (scrollContainer) {
          const isNearBottom =
            scrollContainer.scrollHeight -
              scrollContainer.scrollTop -
              scrollContainer.clientHeight <
            200;

          // Scroll if it's my message, or we're near bottom, or it's the initial load (ref is null)
          if (isMine || isNearBottom || lastMessageIdRef.current === null) {
            setTimeout(() => {
              scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }, 50); // Small delay to ensure DOM is ready
          }
        }
        lastMessageIdRef.current = latestMsg._id;
      }
    } else {
      lastMessageIdRef.current = null;
    }
  }, [messages, userId, conversationId]); // Added conversationId to trigger on change

  return (
    <>
      <div className="flex h-full bg-slate-50 rounded-none sm:rounded-3xl border-x border-b sm:border border-slate-200 shadow-sm overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`w-full md:w-80 border-r border-slate-100 bg-white/80 flex flex-col ${conversationId ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">
                Terminal <span className="text-blue-600">Comms</span>
              </h2>
              {unreadCount > 0 && (
                <div className="bg-red-500 text-white text-[10px] font-black h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-md">
                  {unreadCount}
                </div>
              )}
            </div>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <Input
                placeholder="Filter signals..."
                className="pl-9 bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-tight h-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-1">
            {loadingConfs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-600" />
              </div>
            ) : (
              conversations?.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => navigate(`${chatPathBase}/${conv._id}`)}
                  className={`w-full p-4 rounded-3xl transition-all duration-300 flex items-center gap-4 group ${
                    conversationId === conv._id
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20 active-scale-95"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    {conv.participants?.find((p) => p.participantId !== userId)
                      ?.profilePicture ? (
                      <img
                        src={
                          conv.participants?.find(
                            (p) => p.participantId !== userId,
                          )?.profilePicture
                        }
                        alt=""
                        className="h-12 w-12 rounded-2xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div
                        className={`h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-sm ${conversationId === conv._id ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400"}`}
                      >
                        {conv.participants?.find(
                          (p) => p.participantId !== userId,
                        )?.name?.[0] || "?"}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-black text-xs uppercase tracking-tight truncate pr-2 flex items-center gap-2">
                        {conv.participants?.find(
                          (p) => p.participantId !== userId,
                        )?.name || "Unknown"}
                      </h4>
                      <span className="text-[9px] font-bold opacity-50 whitespace-nowrap">
                        {conv.lastMessageAt
                          ? format(new Date(conv.lastMessageAt), "HH:mm")
                          : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-medium opacity-60 truncate flex items-center gap-1">
                        {(conv.lastMessagePreview
                          ?.toLowerCase()
                          .includes("missed") ||
                          conv.lastMessagePreview
                            ?.toLowerCase()
                            .includes("call")) && (
                          <Phone
                            size={10}
                            className={
                              conv.lastMessagePreview
                                ?.toLowerCase()
                                .includes("missed")
                                ? "text-red-500"
                                : "text-emerald-500"
                            }
                          />
                        )}
                        {conv.lastMessagePreview || "No messages yet"}
                      </p>
                      {(conv.unreadCount || 0) > 0 &&
                        conversationId !== conv._id && (
                          <div className="bg-red-500 text-white text-[8px] font-black h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center animate-pulse">
                            {conv.unreadCount}
                          </div>
                        )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main
          className={`flex-1 flex flex-col bg-white/40 ${!conversationId ? "hidden md:flex" : "flex"}`}
        >
          {conversationId && activeConversation ? (
            <>
              {/* Chat Header */}
              <header className="p-4 sm:p-6 border-b border-slate-100 bg-white flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => navigate(chatPathBase)}
                  >
                    <ChevronLeft size={20} />
                  </Button>
                  <div
                    className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleViewProfile}
                  >
                    {otherUser?.profilePicture ? (
                      <img
                        src={otherUser.profilePicture}
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
                        {otherName[0] || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-slate-900 text-sm italic uppercase flex items-center gap-2">
                        {otherName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isTyping ? "bg-blue-500" : isBlocked ? "bg-slate-300" : "bg-emerald-500"}`}
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {isTyping
                            ? "Typing..."
                            : isBlocked
                              ? "Signal Blocked"
                              : "Online"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isMutedNotifications && (
                    <BellOff size={14} className="text-slate-400" />
                  )}
                  {isBlocked && (
                    <ShieldOff size={14} className="text-red-500" />
                  )}
                </div>

                {/* Search Overlay */}
                {isSearchOpen && (
                  <div className="absolute inset-0 bg-white z-40 flex items-center px-6 animate-in slide-in-from-top duration-300">
                    <Search className="text-slate-400 mr-4" size={20} />
                    <input
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search in secure signal..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold uppercase tracking-widest"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-black text-[10px] uppercase tracking-widest text-slate-400"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      Close
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => startCall(false)}
                  >
                    <Phone size={18} className="font-bold" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`rounded-xl transition-all ${isSearchOpen ? "bg-blue-600 text-white" : ""}`}
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                  >
                    <Search size={18} />
                  </Button>
                  <div className="relative group/menu">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <MoreVertical size={18} />
                    </Button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 hidden group-hover/menu:block z-50 animate-in fade-in zoom-in duration-200">
                      <button
                        onClick={() =>
                          socket.emit("chat:toggle-mute", { conversationId })
                        }
                        className="w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <BellOff size={14} /> Mute Signals
                      </button>
                      <button
                        onClick={() =>
                          socket.emit("chat:toggle-block", { conversationId })
                        }
                        className="w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 flex items-center gap-3"
                      >
                        <ShieldOff size={14} /> Block Peer
                      </button>
                      <hr className="my-1 border-slate-100" />
                      <button
                        onClick={() =>
                          socket.emit("chat:delete-conversation", {
                            conversationId,
                          })
                        }
                        className="w-full px-4 py-2.5 text-left text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <XCircle size={14} /> Wipe Terminal
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
              >
                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center py-4">
                    {isFetchingNextPage ? (
                      <Loader2
                        className="animate-spin text-blue-400"
                        size={16}
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Load History
                      </span>
                    )}
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-600" />
                  </div>
                ) : (
                  groupedMessages.map((group) => (
                    <div key={group.date} className="space-y-6">
                      <div className="flex items-center justify-center my-8">
                        <div className="h-[1px] bg-slate-200 flex-1" />
                        <span className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                          {group.date}
                        </span>
                        <div className="h-[1px] bg-slate-200 flex-1" />
                      </div>

                      {group.messages.map((msg: any) => {
                        const isMine = String(msg.senderId) === String(userId);
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${isMine ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                          >
                            <div
                              className={`flex flex-col gap-1.5 max-w-[80%] ${isMine ? "items-end" : "items-start"}`}
                            >
                              <div className="relative group">
                                <div
                                  className={`px-5 py-4 rounded-[32px] shadow-sm relative overflow-hidden backdrop-blur-3xl transform transition-all duration-300 border
                                                    ${
                                                      isMine
                                                        ? "bg-blue-600 text-white border-blue-400/30"
                                                        : "bg-white text-slate-900 border-slate-100 hover:border-slate-200"
                                                    }
                                                    ${msg.isDeleted ? "opacity-50 ring-0" : "hover:shadow-xl hover:shadow-blue-500/5"}
                                                `}
                                >
                                  {msg.isDeleted ? (
                                    <span className="text-[10px] font-bold uppercase tracking-widest italic flex items-center gap-2 opacity-60">
                                      <Trash2 size={12} /> Signal Purged
                                    </span>
                                  ) : editingMessageId === msg._id ? (
                                    <div className="space-y-3 min-w-[220px] bg-blue-700/30 p-3 rounded-2xl border border-blue-400/30 shadow-inner">
                                      <textarea
                                        className="w-full bg-transparent border-none focus:ring-0 text-xs font-semibold resize-none text-white placeholder:text-blue-200 p-0 leading-relaxed"
                                        value={editContent}
                                        onChange={(e) =>
                                          setEditContent(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            (e.ctrlKey || e.metaKey)
                                          ) {
                                            socket.emit("chat:edit", {
                                              messageId: msg._id,
                                              conversationId,
                                              newContent: editContent,
                                            });
                                            setEditingMessageId(null);
                                          }
                                          if (e.key === "Escape")
                                            setEditingMessageId(null);
                                        }}
                                        rows={Math.max(
                                          2,
                                          editContent.split("\n").length,
                                        )}
                                        autoFocus
                                      />
                                      <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                        <span className="text-[7px] text-blue-200 font-bold uppercase tracking-widest opacity-60">
                                          Ctrl+Enter to Patch
                                        </span>
                                        <div className="flex gap-4">
                                          <button
                                            onClick={() =>
                                              setEditingMessageId(null)
                                            }
                                            className="text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => {
                                              socket.emit("chat:edit", {
                                                messageId: msg._id,
                                                conversationId,
                                                newContent: editContent,
                                              });
                                              setEditingMessageId(null);
                                            }}
                                            className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
                                          >
                                            <Check size={10} /> Save
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : msg.contentType === "IMAGE" ||
                                    (msg.contentType === "TEXT" &&
                                      typeof msg.content === "string" &&
                                      msg.content.match(
                                        /^https:\/\/res\.cloudinary\.com\/.*\.(jpg|jpeg|png|webp|gif)$/i,
                                      )) ? (
                                    <div className="relative group/img overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                                      <img
                                        src={msg.content}
                                        alt="Image Message"
                                        className="max-w-full max-h-[400px] object-cover transition-transform group-hover/img:scale-105 cursor-pointer"
                                        onClick={() =>
                                          setSelectedImageForLightbox(
                                            msg.content,
                                          )
                                        }
                                      />
                                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">
                                          Image Signal Received
                                        </span>
                                      </div>
                                    </div>
                                  ) : msg.contentType === "FILE" ||
                                    (msg.contentType === "TEXT" &&
                                      typeof msg.content === "string" &&
                                      msg.content.match(
                                        /^https:\/\/res\.cloudinary\.com\/.*\.(pdf)$/i,
                                      )) ? (
                                    <div className="relative group/pdf overflow-hidden rounded-2xl border border-white/10 shadow-lg p-4 bg-slate-100 flex items-center gap-3">
                                      <svg
                                        width="32"
                                        height="32"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        className="text-red-500"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 4v16m8-8H4"
                                        />
                                      </svg>
                                      <a
                                        href={msg.content}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-bold text-red-600 underline"
                                      >
                                        View PDF
                                      </a>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-xs font-medium leading-relaxed">
                                        {msg.content || (msg.encryptedForRecipient?.ciphertext ? "[Encrypted Signal]" : "[Legacy Signal]")}
                                      </p>
                                      {msg.editedAt && (
                                        <span className="text-[7px] opacity-50 uppercase font-black block mt-2 border-t border-white/10 pt-1">
                                          Patched •{" "}
                                          {format(
                                            new Date(msg.editedAt),
                                            "HH:mm",
                                          )}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                                {/* Reactions Display */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div
                                    className={`absolute -bottom-2 ${isMine ? "right-0" : "left-0"} flex -space-x-1 items-center z-20`}
                                  >
                                    {Array.from(
                                      new Set(
                                        msg.reactions.map((r: any) => r.emoji),
                                      ),
                                    ).map((emoji: any) => (
                                      <div
                                        key={emoji}
                                        className="bg-white rounded-full px-1.5 py-0.5 text-[10px] shadow-sm border border-slate-100 flex items-center gap-1 animate-in zoom-in duration-200"
                                      >
                                        {emoji}
                                        <span className="text-[8px] font-black text-slate-500">
                                          {
                                            msg.reactions?.filter(
                                              (r: any) => r.emoji === emoji,
                                            ).length
                                          }
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Reaction Picker */}
                                {!msg.isDeleted && !editingMessageId && (
                                  <div
                                    className={`absolute top-0 ${isMine ? "-left-44" : "-right-44"} -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 p-2`}
                                  >
                                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-full p-1.5 flex gap-1 border border-white/10 shadow-2xl">
                                      {EMOJI_OPTIONS.map((emoji) => {
                                        const hasMyReaction =
                                          msg.reactions?.some(
                                            (r: any) =>
                                              String(r.userId) ===
                                                String(userId) &&
                                              r.emoji === emoji,
                                          );
                                        return (
                                          <button
                                            key={emoji}
                                            onClick={() =>
                                              socket.emit("chat:react", {
                                                messageId: msg._id,
                                                conversationId,
                                                emoji,
                                              })
                                            }
                                            className={`h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-all active:scale-125 ${hasMyReaction ? "bg-blue-600/30 border border-blue-500/50" : ""}`}
                                          >
                                            {emoji}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Actions */}
                                {isMine &&
                                  !msg.isDeleted &&
                                  !editingMessageId && (
                                    <div className="absolute top-1/2 -left-20 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 items-center">
                                      <button
                                        onClick={() => {
                                          setEditingMessageId(msg._id);
                                          setEditContent(msg.content || "");
                                        }}
                                        className="p-2 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-blue-600 hover:scale-110 transition-all"
                                        title="Edit Signal"
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeletingMessageId(msg._id)
                                        }
                                        className="p-2 bg-white shadow-sm border border-slate-100 rounded-full text-slate-400 hover:text-red-600 hover:scale-110 transition-all"
                                        title="Drop Signal"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  )}

                                {/* Delete Confirmation */}
                                {deletingMessageId === msg._id && (
                                  <div className="absolute inset-0 z-50 bg-slate-900/95 backdrop-blur-sm rounded-[24px] flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
                                    <div className="text-center space-y-3">
                                      <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">
                                        Terminate Signal?
                                      </p>
                                      <div className="flex gap-4">
                                        <button
                                          onClick={() =>
                                            setDeletingMessageId(null)
                                          }
                                          className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                          Abort
                                        </button>
                                        <button
                                          onClick={() => {
                                            socket.emit("chat:delete", {
                                              messageId: msg._id,
                                              conversationId,
                                            });
                                            setDeletingMessageId(null);
                                          }}
                                          className="text-[8px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1 hover:text-red-400 transition-colors"
                                        >
                                          <Check size={10} /> Confirm
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Timestamp & Status */}
                              <div
                                className={`flex items-center gap-2 px-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}
                              >
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {format(new Date(msg.createdAt), "HH:mm")}
                                </span>
                                {isMine && !msg.isDeleted && (
                                  <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest italic">
                                    {msg.status === "READ"
                                      ? "Seen"
                                      : msg.status === "DELIVERED"
                                        ? "Delivered"
                                        : msg.status === "SENDING"
                                          ? "Sending..."
                                          : msg.status === "ERROR"
                                            ? "Failed"
                                            : "Sent"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                {optimisticImage && (
                  <div className="flex justify-end animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col gap-1.5 max-w-[80%] items-end">
                      <div className="relative group">
                        <div className="px-1 py-1 rounded-[32px] shadow-sm relative overflow-hidden backdrop-blur-3xl transform transition-all duration-300 border bg-blue-600/50 text-white border-blue-400/30">
                          <div className="relative group/img overflow-hidden rounded-2xl border border-white/10 shadow-lg">
                            <img
                              src={optimisticImage}
                              alt="Optimizing..."
                              className="max-w-full max-h-[400px] object-cover opacity-60 grayscale-[0.5]"
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                              <Loader2
                                className="animate-spin text-white mb-2"
                                size={24}
                              />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                Encrypting...
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <footer className="p-4 sm:p-6 bg-white/80 border-t border-slate-100 backdrop-blur-md">
                <form
                  className="flex items-center gap-3"
                  onSubmit={(e) => handleSendMessage(e)}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`shrink-0 h-10 w-10 border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 ${isUploading ? "animate-pulse" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <ImageIcon size={20} />
                    )}
                  </Button>
                  <Input
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);

                      const socket = getSocket();
                      if (otherUser) {
                        socket.emit("chat:typing", {
                          recipientId: otherUser.participantId,
                          recipientType: otherUser.participantType,
                        });

                        if (typingTimeoutRef.current)
                          clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                          socket.emit("chat:stop_typing", {
                            recipientId: otherUser.participantId,
                            recipientType: otherUser.participantType,
                          });
                        }, 2000);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 h-12 bg-slate-50 border-none rounded-2xl text-sm font-medium px-6 focus:ring-4 focus:ring-blue-600/5 transition-all"
                  />
                  <Button
                    disabled={!messageInput.trim() || isUploading}
                    className="shrink-0 h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-400/20 gap-2 font-black text-[10px] uppercase tracking-widest"
                  >
                    <Send size={16} />
                    Broadcast
                  </Button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-10 text-center opacity-60">
              <div className="h-32 w-32 rounded-[48px] bg-slate-100 flex items-center justify-center text-slate-300 shadow-inner">
                <MessageSquare size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Secure Signal Link
                </h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-sm mx-auto">
                  Select a bonded peer from your frequency list to initiate
                  end-to-end encrypted terminal communications.
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-200 uppercase text-[10px] font-black tracking-widest h-11 px-8"
                  onClick={() => navigate("/student/friends")}
                >
                  Social Hub
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Incoming Call Overlay */}
        {incomingCall && (
          <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative">
              <div className="h-32 w-32 rounded-[48px] bg-blue-600 animate-pulse flex items-center justify-center text-white shadow-[0_0_80px_rgba(37,99,235,0.4)]">
                <Phone size={48} className="animate-bounce" />
              </div>
              <div className="absolute -top-4 -right-4 h-8 w-8 bg-emerald-500 rounded-full border-4 border-slate-900 animate-ping" />
            </div>

            <div className="mt-12 text-center space-y-2">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                {incomingCall.callerName || "Incoming Signal"}
              </h2>
              <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
                Priority encrypted channel
              </p>
            </div>

            <div className="mt-16 flex items-center gap-8">
              <button
                onClick={() => {
                  socket.emit("call:reject", {
                    callerId: incomingCall.callerId,
                    callerType: incomingCall.callerType,
                  });
                  setIncomingCall(null);
                }}
                className="group"
              >
                <div className="h-16 w-16 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                  <PhoneOff size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-3 block text-center">
                  Terminate
                </span>
              </button>

              <button onClick={acceptCall} className="group">
                <div className="h-20 w-20 rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] flex items-center justify-center text-white transition-all transform group-hover:scale-110">
                  <Phone size={28} className="animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-4 block text-center">
                  Establish Link
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Outgoing Call Overlay */}
        {outgoingCall && (
          <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="relative">
              <div className="h-32 w-32 rounded-[48px] bg-blue-600 animate-pulse flex items-center justify-center text-white shadow-[0_0_80px_rgba(37,99,235,0.4)]">
                <Phone size={48} className="animate-bounce" />
              </div>
            </div>

            <div className="mt-12 text-center space-y-2">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                {otherName}
              </h2>
              <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
                Contacting secure signal...
              </p>
            </div>

            <div className="mt-16 flex items-center justify-center">
              <button onClick={endCall} className="group">
                <div className="h-20 w-20 rounded-full bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.3)] flex items-center justify-center text-white transition-all transform group-hover:scale-110">
                  <PhoneOff size={28} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-4 block text-center">
                  Cancel Signal
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Active Call Overlay (Enhanced Instagram Style) */}
        {activeCall && (
          <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-between pb-16 animate-in zoom-in duration-500">
            {/* Header Info */}
            <div className="mt-24 text-center space-y-4">
              <div className="relative inline-block">
                <div className="h-32 w-32 rounded-[48px] bg-slate-800 border-2 border-slate-700/50 flex items-center justify-center text-white shadow-2xl relative z-10">
                  <Phone size={48} className="text-blue-500" />
                </div>
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150" />
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">
                  {activeCall.name || otherName}
                </h2>
                <p className="text-blue-400 text-xl font-mono tracking-widest">
                  {formatDuration(callDuration)}
                </p>
              </div>
            </div>

            {/* Control Panel */}
            <div className="w-full max-w-sm px-8 space-y-12">
              {/* Media Controls */}
              <div className="flex items-center justify-around bg-slate-800/40 backdrop-blur-xl rounded-[40px] p-6 border border-white/5 shadow-2xl">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`group flex flex-col items-center gap-3 transition-all ${isMuted ? "text-white" : "text-slate-400"}`}
                >
                  <div
                    className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all ${isMuted ? "bg-white text-slate-900" : "bg-slate-700/50 hover:bg-slate-700"}`}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isMuted ? "Unmute" : "Mute"}
                  </span>
                </button>

                <button
                  className={`group flex flex-col items-center gap-3 transition-all ${isSpeakerOn ? "text-white" : "text-slate-400"}`}
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                  <div
                    className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all ${isSpeakerOn ? "bg-white text-slate-900" : "bg-slate-700/50 hover:bg-slate-700"}`}
                  >
                    {isSpeakerOn ? (
                      <Volume2 size={24} />
                    ) : (
                      <VolumeX size={24} />
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Speaker
                  </span>
                </button>

                <div className="flex flex-col items-center gap-3 text-emerald-400">
                  <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldOff size={24} className="animate-pulse" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Secure 2G
                  </span>
                </div>
              </div>

              {/* End Call Button */}
              <div className="flex justify-center">
                <button onClick={endCall} className="group relative">
                  <div className="absolute inset-0 bg-red-600 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity rounded-full" />
                  <div className="h-24 w-24 rounded-full bg-red-500 shadow-2xl flex items-center justify-center text-white transform transition-all hover:scale-110 active:scale-95 relative">
                    <PhoneOff size={36} />
                  </div>
                  <span className="mt-4 block text-[10px] font-black uppercase tracking-[0.3em] text-red-500 text-center">
                    End Signal
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
        {isEditorOpen && editingImage && (
          <ImageEditor
            imageSrc={editingImage}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
          />
        )}
        <audio ref={remoteAudioRef} autoPlay />
      </div>
      {/* Lightbox */}
      {selectedImageForLightbox && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
          <header className="p-6 flex justify-between items-center border-b border-white/10">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">
              Signal Decryption Matrix
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full"
              onClick={() => setSelectedImageForLightbox(null)}
            >
              <XCircle size={24} />
            </Button>
          </header>
          <div className="flex-1 flex items-center justify-center p-4">
            <img
              src={selectedImageForLightbox}
              alt=""
              className="max-w-full max-h-full object-contain shadow-2xl shadow-blue-500/10 rounded-lg animate-in zoom-in duration-500"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPage;
