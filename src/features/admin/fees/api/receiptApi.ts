// frontend/src/features/admin/fees/api/receiptApi.ts

import axiosInstance from "@/api/axiosInstance";

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

/**
 * Get receipt details for a specific fee payment
 * GET /fees/:studentId/:month/:year/receipt-details
 */
export const getReceiptDetails = async (
  studentId: string,
  month: number,
  year: number,
): Promise<ReceiptDetails> => {
  const { data } = await axiosInstance.get(
    `/fees/${studentId}/${month}/${year}/receipt-details`,
  );
  return data.data;
};

/**
 * Download receipt as PDF
 * GET /fees/:studentId/:month/:year/receipt-pdf
 * Returns blob for PDF download
 */
export const downloadReceiptPDF = async (
  studentId: string,
  month: number,
  year: number,
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/fees/${studentId}/${month}/${year}/receipt-pdf`,
    { responseType: "blob" },
  );
  return response.data;
};

/**
 * Get receipt by receipt number
 * GET /fees/receipt/:receiptNumber
 */
export const getReceiptByNumber = async (
  receiptNumber: string,
): Promise<ReceiptDetails> => {
  const { data } = await axiosInstance.get(`/fees/receipt/${receiptNumber}`);
  return data.data;
};

/**
 * Get all receipts for a student
 * GET /fees/:studentId/receipts
 */
export const getStudentReceipts = async (
  studentId: string,
  params?: {
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
  },
): Promise<ReceiptListResponse> => {
  const { data } = await axiosInstance.get(`/fees/${studentId}/receipts`, {
    params,
  });
  return data.data;
};

/**
 * Send receipt via email
 * POST /fees/:studentId/:month/:year/receipt/email
 */
export const sendReceiptEmail = async (
  studentId: string,
  month: number,
  year: number,
  email?: string,
): Promise<{ message: string }> => {
  const { data } = await axiosInstance.post(
    `/fees/${studentId}/${month}/${year}/receipt/email`,
    { email },
  );
  return data.data;
};

/**
 * Print receipt (returns HTML for printing)
 * GET /fees/:studentId/:month/:year/receipt/print
 */
export const printReceipt = async (
  studentId: string,
  month: number,
  year: number,
): Promise<string> => {
  const { data } = await axiosInstance.get(
    `/fees/${studentId}/${month}/${year}/receipt/print`,
  );
  return data.data;
};

/**
 * Regenerate receipt (if lost/not generated)
 * POST /fees/:studentId/:month/:year/receipt/regenerate
 */
export const regenerateReceipt = async (
  studentId: string,
  month: number,
  year: number,
): Promise<ReceiptDetails> => {
  const { data } = await axiosInstance.post(
    `/fees/${studentId}/${month}/${year}/receipt/regenerate`,
  );
  return data.data;
};
