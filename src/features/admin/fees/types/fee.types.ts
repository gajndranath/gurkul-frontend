import type { useDueTracking } from "../hooks/useDueTracking";

export type FeeStatus = "PAID" | "DUE" | "PENDING";
export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "ADVANCE";
export type UrgencyLevel = "critical" | "high" | "medium" | "low";

export interface PaymentPayload {
  paidAmount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  remarks?: string;
}

export interface FeeHistoryItem {
  month: number;
  year: number;
  baseFee: number;
  dueCarriedForward: number;
  totalAmount: number;
  status: FeeStatus;
  paidAmount?: number;
  paymentDate?: string;
  coveredByAdvance: boolean;
  locked: boolean;
}

export interface StudentFeeSummary {
  student: {
    name: string;
    monthlyFee: number;
    status: string;
  };
  currentMonth: {
    month: number;
    year: number;
  };
  feeHistory: FeeHistoryItem[];
  advance: {
    totalAmount: number;
    remainingAmount: number;
    usedAmount: number;
  } | null;
  currentDue: {
    totalDueAmount: number;
    monthsDue: string[];
    reminderDate?: string;
  } | null;
}

export interface DashboardPaymentStatus {
  stats: {
    total: number;
    paid: number;
    due: number;
    pending: number;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    pendingAmount: number;
  };
  details: Array<{
    studentId: string;
    studentName: string;
    studentStatus: string;
    month: number;
    year: number;
    totalAmount: number;
    status: FeeStatus;
  }>;
}
export interface FeeSummaryResponse {
  success: boolean;
  message: string;
  data: StudentFeeSummary;
}

/* ============ 🆕 DUE TRACKING TYPES ============ */

export interface DueRecord {
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  month: number;
  year: number;
  totalAmount: number;
  dueDate: Date;
  daysOverdue: number;
  urgency: UrgencyLevel;
  status: FeeStatus;
}

export interface DueSummaryStats {
  totalDueAmount: number;
  totalDueStudents: number;
  averageOverdueDays: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface DueFilters {
  search?: string;
  minDays?: number;
  maxDays?: number;
  urgency?: UrgencyLevel[];
}

// frontend/src/features/admin/fees/types/fee.types.ts

// ✅ Add these types at the end of file

export interface AdvanceBalance {
  studentId: string;
  studentName: string;
  studentPhone: string;
  totalAmount: number;
  remainingAmount: number;
  usedAmount: number;
  monthsCovered: number;
  lastAppliedMonth?: {
    month: number;
    year: number;
  };
}

export interface ApplyAdvancePayload {
  studentId: string;
  month: number;
  year: number;
  amount: number;
}

export interface PendingMonth {
  month: number;
  year: number;
  amount: number;
  label: string;
  status: FeeStatus;
}

// frontend/src/features/admin/fees/types/fee.types.ts

// Add at the end of the file

export interface ReceiptDetails {
  receiptNumber: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  month: number;
  year: number;
  monthYear: string;
  amount: number;
  paidAmount: number;
  baseFee: number;
  dueCarriedForward: number;
  paymentDate: string;
  paymentMethod:
    | "CASH"
    | "UPI"
    | "BANK_TRANSFER"
    | "ADVANCE"
    | "CHEQUE"
    | "OTHER";
  transactionId?: string;
  remarks?: string;
  collectedBy: string;
  receiptType: "FEE_PAYMENT" | "ADVANCE_PAYMENT";
  institutionDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    gstin?: string;
  };
}

export interface ReceiptListResponse {
  receipts: ReceiptDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type UseDueTrackingReturn = ReturnType<typeof useDueTracking>;
