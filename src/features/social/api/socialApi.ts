import axiosInstance from "../../../api/axiosInstance";

export interface Peer {
  _id: string;
  name: string;
  libraryId: string;
  slotId?: string;
  slotName: string;
  roomName: string;
  seatNumber?: string;
}

export interface SocialFriend {
  _id: string;
  name: string;
  libraryId: string;
  email?: string;
  phone?: string;
  bondedAt: string;
  friendshipId: string;
  userType?: "Student" | "Admin";
  role?: string;
}

export interface FriendRequest {
  _id: string;
  requesterId?: { _id: string; name: string };
  recipientId?: { _id: string; name: string };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
}

export const socialApi = {
  getFriends: async () => {
    const { data } = await axiosInstance.get<{ data: SocialFriend[] }>("/student-chat/friends");
    return data.data;
  },

  getRequests: async () => {
    const { data } = await axiosInstance.get<{ data: { incoming: FriendRequest[]; outgoing: FriendRequest[] } }>(
      "/student-chat/friends/requests"
    );
    return data.data;
  },

  sendRequest: async (recipientId: string) => {
    const { data } = await axiosInstance.post("/student-chat/friends/request", { recipientId });
    return data;
  },

  respondRequest: async (requestId: string, action: "accept" | "reject") => {
    const { data } = await axiosInstance.post(
      `/student-chat/friends/requests/${requestId}/respond`,
      { action }
    );
    return data;
  },

  removeFriend: async (friendId: string) => {
    const { data } = await axiosInstance.post("/student-chat/friends/remove", { friendId });
    return data;
  },

  searchPeers: async (params: { search?: string; slotId?: string; page?: number }) => {
    const { data } = await axiosInstance.get<{ data: { students: Peer[]; pagination: any } }>(
      "/student-chat/friends/search",
      { params }
    );
    return data.data;
  },
};
