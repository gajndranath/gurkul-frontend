export interface BackendResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T; // This will hold your StudentListResponse
  _cached?: boolean;
  _cacheKey?: string;
}

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
  emailVerified?: boolean;
  phoneVerified?: boolean;
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
