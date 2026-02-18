import axiosInstance from "../../../../api/axiosInstance";
import type { ApiResponse } from "../../../auth/types/auth.types";

export interface Expense {
  _id: string;
  amount: number;
  description: string;
  category: string;
  paymentMethod: string;
  date: string;
  paidBy?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    username: string;
    name: string;
  };
}

export interface ExpenseStats {
  month: number;
  year: number;
  totalExpense: number;
  categoryBreakdown: {
    _id: string;
    totalAmount: number;
    count: number;
  }[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export const fetchExpenses = async (params: Record<string, unknown>) => {
  const response = await axiosInstance.get<ApiResponse<{ expenses: Expense[]; pagination: PaginationInfo }>>(
    "/expenses",
    { params }
  );
  return response.data.data;
};

export const createExpense = async (data: Partial<Omit<Expense, "_id" | "createdAt" | "createdBy">>) => {
  const response = await axiosInstance.post<ApiResponse<Expense>>("/expenses", data);
  return response.data.data;
};

export const updateExpense = async (id: string, data: Partial<Expense>) => {
  const response = await axiosInstance.patch<ApiResponse<Expense>>(`/expenses/${id}`, data);
  return response.data.data;
};

export const deleteExpense = async (id: string) => {
  const response = await axiosInstance.delete<ApiResponse<null>>(`/expenses/${id}`);
  return response.data.data;
};

export const fetchExpenseStats = async (month?: number, year?: number) => {
  const response = await axiosInstance.get<ApiResponse<ExpenseStats>>("/expenses/stats", {
    params: { month, year },
  });
  return response.data.data;
};
