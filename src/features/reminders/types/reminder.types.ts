import type { Student } from "../../admin/students/types";

export type ReminderScheduleType = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";
export type AdminReminderType =
  | "DUE_STUDENTS"
  | "END_OF_MONTH_DUE"
  | "PAYMENT_PENDING"
  | "CUSTOM";

// Replacing 'any' for student data in summary
export interface DueSummaryStudent {
  studentId: Pick<
    Student,
    "_id" | "id" | "name" | "email" | "phone" | "monthlyFee"
  >;
  month: number;
  year: number;
  baseFee: number;
  totalAmount: number;
  status: "PAID" | "DUE" | "PENDING";
}

export interface AdminReminder {
  _id: string;
  adminId: string;
  type: AdminReminderType;
  title: string;
  message: string;
  affectedStudents: Array<
    Pick<Student, "_id" | "name" | "status"> & { studentId: string }
  >;
  dueRecords: string[];
  schedule: {
    type: ReminderScheduleType;
    startDate: string;
    endDate?: string;
    nextTriggerDate?: string;
    lastTriggeredAt?: string;
  };
  deliverVia: ("EMAIL" | "PUSH" | "SMS" | "IN_APP")[];
  isActive: boolean;
  isPaused: boolean;
  pausedAt?: string;
  pauseReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DueSummary {
  month: number;
  year: number;
  totalDueStudents: number;
  totalDueAmount: number;
  students: DueSummaryStudent[]; // Error Fixed: No more any[]
}
