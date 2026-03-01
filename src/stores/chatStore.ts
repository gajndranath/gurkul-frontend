import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CallData {
  callId: string;
  from: { userId: string; userType: string; name?: string; profilePicture?: string };
  conversationId: string;
  isOffer?: boolean;
}

interface ChatState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  // Unread message tracking
  totalUnreadCount: number;
  setTotalUnreadCount: (count: number) => void;
  
  // Call state
  incomingCall: CallData | null;
  activeCall: CallData | null;
  setIncomingCall: (call: CallData | null) => void;
  setActiveCall: (call: CallData | null) => void;
}

export const useChatStore = create(
  persist<ChatState>(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      totalUnreadCount: 0,
      setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),
      
      incomingCall: null,
      activeCall: null,
      setIncomingCall: (call) => set({ incomingCall: call }),
      setActiveCall: (call) => set({ activeCall: call }),
    }),
    {
      name: "library-chat-store-v3",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
