import axiosInstance from "./axiosInstance";

// Type for the real API response
export type DashboardApiResponse = {
  student?: {
    _id: string;
    name?: string;
    libraryId?: string;
    phone?: string;
    email?: string;
    address?: string;
    fatherName?: string;
    status?: string;
    seatNumber?: string;
    joiningDate?: string;
    nextBillingDate?: string;
    slot?: {
      name?: string;
      timeRange?: { start?: string; end?: string };
      monthlyFee?: number;
      totalSeats?: number;
      isActive?: boolean;
    };
    [key: string]: unknown;
  };
  feeSummary?: {
    totals?: {
      totalPaid?: number;
      totalDue?: number;
      totalPending?: number;
    };
  };
  recentPayments?: Array<{
    _id: string;
    month: string;
    year: number;
    amount: number;
    status: string;
    paymentDate?: string;
    transactionId?: string;
  }>;
  dueItems?: Array<{
    _id: string;
    month: string;
    year: number;
    amount: number;
    status: string;
    dueDate?: string;
  }>;
  unreadNotifications?: Array<{
    _id: string;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    read: boolean;
  }>;
  announcements?: Array<{
    _id: string;
    title: string;
    body: string;
    createdAt: string;
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
