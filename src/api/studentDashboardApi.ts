import axiosInstance from "./axiosInstance";

// Type for the real API response
export type DashboardApiResponse = {
  student?: {
    name?: string;
    nextBillingDate?: string;
    [key: string]: unknown;
  };
  feeSummary?: {
    totals?: {
      totalPaid?: number;
      totalDue?: number;
      totalPending?: number;
    };
  };
  recentReminders?: Array<{
    _id: string;
    title: string;
    dueDate: string;
    read: boolean;
  }>;
  recentNotifications?: Array<{
    _id: string;
    title: string;
    createdAt: string;
    read: boolean;
  }>;
  [key: string]: unknown;
};

// Fetch student dashboard data

export const fetchStudentDashboard =
  async (): Promise<DashboardApiResponse> => {
    const { data } = await axiosInstance.get("/student-auth/dashboard");
    return data.data;
  };

// Fetch student dashboard payment status

export const fetchStudentDashboardPaymentStatus = async () => {
  const { data } = await axiosInstance.get("/fees/dashboard-status");
  return data.data;
};
