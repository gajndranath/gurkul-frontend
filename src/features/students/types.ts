export interface FeeHistoryItem {
  _id: string;
  amount: number;
  status: "PAID" | "PENDING" | "OVERDUE" | "PARTIAL";
  paymentDate?: string;
  month: number;
  year: number;
}

export interface Student {
  _id?: string;
  id: string;
  name: string;
  email: string;
  phone?: string;
  fatherName?: string;
  address?: string;
  seatNumber?: string;
  slotId?: string | { _id?: string; name?: string; monthlyFee?: number };
  monthlyFee?: number;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  joiningDate?: string;
  notes?: string;
  tags?: string[];
}

export interface StudentListResponse {
  students: Student[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SingleStudentResponse {
  success: boolean;
  message: string;
  data: {
    student: Student;
    feeSummary: {
      totals: {
        totalPaid: number;
        totalDue: number;
        totalPending: number;
      };
      feeHistory: FeeHistoryItem[];
    };
  };
}

export interface StudentNotification {
  id: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING";
  createdAt: string;
}

export interface StudentReminder {
  id: string;
  title: string;
  dueDate: string;
  amount?: number;
}
