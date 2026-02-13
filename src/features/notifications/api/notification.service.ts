import axiosInstance from "../../../api/axiosInstance";
import type { AppNotification } from "../types/notification.types";

export interface NotificationHistoryResponse {
  notifications: AppNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  unreadCount: number;
}

export const notificationService = {
  // Fetch paginated history
  getHistory: async (page = 1, limit = 20, unreadOnly = false) => {
    const { data } = await axiosInstance.get<{
      data: NotificationHistoryResponse;
    }>(`/notification/history`, { params: { page, limit, unreadOnly } });
    return data.data;
  },

  // Mark single notification as read
  markAsRead: async (notificationId: string) => {
    const { data } = await axiosInstance.patch(
      `/notification/read/${notificationId}`,
    );
    return data;
  },

  // Mark all as read
  markAllRead: async () => {
    const { data } = await axiosInstance.patch(`/notification/read-all`);
    return data;
  },

  // Manual Trigger to student (Admin feature)
  sendToStudent: async (payload: {
    studentId: string;
    channel: string;
    title: string;
    message: string;
  }) => {
    const { data } = await axiosInstance.post(
      `/notification/send-to-student`,
      payload,
    );
    return data;
  },
};
