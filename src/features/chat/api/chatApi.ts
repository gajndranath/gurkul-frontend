import axiosInstance from "../../../api/axiosInstance";
import { useSessionStore } from "../../../stores/sessionStore";

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderType: "Student" | "Admin";
  recipientId: string;
  recipientType: "Student" | "Admin";
  content?: string; 
  contentType: "TEXT" | "CALL" | "IMAGE";
  status: "SENT" | "DELIVERED" | "READ" | "SENDING" | "ERROR";
  tempId?: string;
  isDeleted?: boolean;
  editedAt?: string;
  createdAt: string;
  reactions?: Array<{
    userId: string;
    userType: "Student" | "Admin";
    emoji: string;
  }>;
  callMetadata?: {
    callStatus: "MISSED" | "COMPLETED" | "REJECTED" | "CANCELLED";
    duration: number;
    callType: "AUDIO" | "VIDEO";
  };
}

export interface Conversation {
  _id: string;
  participants: Array<{
    participantId: string;
    participantType: "Student" | "Admin";
    name: string;
    profilePicture?: string;
    role?: string;
    avatar?: string;
  }>;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount?: number;
  blockedBy?: string[];
  mutedBy?: string[];
}

const getApiBase = () => {
  const role = useSessionStore.getState().role;
  const isAdmin = ["ADMIN", "SUPER_ADMIN", "STAFF"].includes(role || "");
  return isAdmin ? "/chat" : "/student-chat";
};

export const chatApi = {
  getConversations: async () => {
    const { data } = await axiosInstance.get<{ data: Conversation[] }>(
      `${getApiBase()}/conversations`,
    );
    return data.data;
  },

  getOrCreateConversation: async (
    recipientId: string,
    recipientType: "Student" | "Admin" = "Student",
  ) => {
    const { data } = await axiosInstance.post<{ data: Conversation }>(
      `${getApiBase()}/conversations`,
      {
        recipientId,
        recipientType,
      },
    );
    return data.data;
  },

  getMessages: async (
    conversationId: string,
    params?: { limit?: number; before?: string },
  ) => {
    const { data } = await axiosInstance.get<{ data: ChatMessage[] }>(
      `${getApiBase()}/conversations/${conversationId}/messages`,
      { params },
    );
    return data.data;
  },

  sendMessage: async (payload: any) => {
    const { data } = await axiosInstance.post<{ data: ChatMessage }>(
      `${getApiBase()}/messages`,
      payload,
    );
    return data.data;
  },

  markAsRead: async (conversationId: string) => {
    const { data } = await axiosInstance.post(
      `${getApiBase()}/conversations/${conversationId}/read`,
    );
    return data;
  },

  publishPublicKey: async (publicKey: string) => {
    const { data } = await axiosInstance.post(`${getApiBase()}/keys`, {
      publicKey,
    });
    return data;
  },

  getPublicKey: async (userType: string, userId: string) => {
    try {
      const { data } = await axiosInstance.get<{ data: string | { publicKey: string } }>(
        `${getApiBase()}/keys/${userType}/${userId}`,
      );
      // Be defensive: handle both raw string and { publicKey: string } object
      if (typeof data.data === "string") return data.data;
      if (data.data && typeof data.data === "object" && "publicKey" in data.data) {
          return data.data.publicKey;
      }
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
