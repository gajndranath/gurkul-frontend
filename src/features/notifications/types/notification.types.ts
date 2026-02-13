export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type NotificationCategory =
  | "PAYMENT_REMINDER"
  | "PAYMENT_CONFIRMATION"
  | "PAYMENT_DUE"
  | "FEE_DUE"
  | "DUE_STUDENTS"
  | "ADMIN_REMINDER"
  | "END_OF_MONTH_DUE"
  | "SYSTEM_ALERT"
  | "TEST"
  | "ANNOUNCEMENT"
  | "CHAT_MESSAGE";

export interface NotificationMetadata {
  studentId?: string;
  reminderId?: string;
  dueAmount?: number;
  conversationId?: string;
  url?: string;
  [key: string]: unknown; // Strict alternative to any
}

export interface AppNotification {
  _id: string;
  userId: string;
  userType: "Student" | "Admin";
  title: string;
  message: string;
  type: NotificationCategory;
  priority: NotificationPriority;
  read: boolean;
  readAt?: string;
  data: NotificationMetadata;
  createdAt: string;
}
