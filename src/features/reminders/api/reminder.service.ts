import axiosInstance from "../../../api/axiosInstance";
import type {
  AdminReminder,
  DueSummary,
  AdminReminderType,
} from "../types/reminder.types";

export const reminderService = {
  // Fetch all active reminders
  getAll: async (
    filters: { type?: AdminReminderType; isPaused?: boolean } = {},
  ) => {
    const { data } = await axiosInstance.get<{ data: AdminReminder[] }>(
      `/reminders`,
      {
        params: filters,
      },
    );
    return data.data;
  },

  // Get specific details
  getDetails: async (reminderId: string) => {
    const { data } = await axiosInstance.get<{ data: AdminReminder }>(
      `/reminders/${reminderId}`,
    );
    return data.data;
  },

  // Pause a node
  pause: async (reminderId: string, reason: string) => {
    const { data } = await axiosInstance.post(
      `/reminders/${reminderId}/pause`,
      { reason },
    );
    return data;
  },

  // Resume a node
  resume: async (reminderId: string) => {
    const { data } = await axiosInstance.post(
      `/reminders/${reminderId}/resume`,
    );
    return data;
  },

  // Manually trigger a reminder (Force Send)
  manualTrigger: async (reminderId: string) => {
    const { data } = await axiosInstance.post(`/reminders/${reminderId}/send`);
    return data;
  },

  // End of Month Summary (Critical for Dashboard)
  getDueSummary: async (month: number, year: number) => {
    const { data } = await axiosInstance.get<{ data: DueSummary }>(
      `/reminders/due-summary`,
      {
        params: { month, year },
      },
    );
    return data.data;
  },
};
