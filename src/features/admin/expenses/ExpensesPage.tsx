import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  fetchExpenses,
  createExpense,
  deleteExpense,
  fetchExpenseStats,
  type Expense,
} from "./api/expenseApi";
import { useToast } from "../../../hooks/useToast";
import { Loader2, Plus, Trash2, Calendar, Filter, PieChart } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";

const expenseSchema = z.object({
  description: z.string().min(3, "Description is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  category: z.string().default("MISCELLANEOUS"),
  paymentMethod: z.string().default("CASH"),
  paidBy: z.string().optional(),
  date: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const EXPENSE_CATEGORIES = [
  "RENT",
  "ELECTRICITY",
  "INTERNET",
  "MAINTENANCE",
  "SALARY",
  "MARKETING",
  "FURNITURE",
  "STATIONERY",
  "REFRESHMENTS",
  "MISCELLANEOUS",
];

const ExpensesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Stats Query
  const { data: stats } = useQuery({
    queryKey: ["expenseStats", new Date().getMonth(), new Date().getFullYear()],
    queryFn: () =>
      fetchExpenseStats(new Date().getMonth(), new Date().getFullYear()),
  });

  // Expenses Query
  const { data, isLoading } = useQuery({
    queryKey: ["expenses", page, filterCategory],
    queryFn: () =>
      fetchExpenses({
        page,
        limit: 10,
        category: filterCategory === "ALL" ? undefined : filterCategory,
      }),
  });

  // Form
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(expenseSchema) as any,
    defaultValues: {
      description: "",
      amount: 0,
      category: "MISCELLANEOUS",
      paymentMethod: "CASH",
      date: new Date().toISOString().split("T")[0],
      paidBy: "",
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      success("Expense Added", "New expense record created successfully.");
      setIsAddOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseStats"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toastError("Error", err.response?.data?.message || "Failed to add expense");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      success("Expense Deleted", "Record removed successfully.");
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenseStats"] });
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expense Management</h2>
          <p className="text-muted-foreground">
            Track and manage library expenses.
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Record a new expenditure for the library.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input {...register("description")} placeholder="e.g. Internet Bill" />
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input type="number" {...register("amount")} placeholder="0.00" />
                  {errors.amount && (
                    <p className="text-xs text-red-500">{errors.amount.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select onValueChange={(val) => setValue("category", val)} defaultValue="MISCELLANEOUS">
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" {...register("date")} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Paid By (Optional)</label>
                <Input {...register("paidBy")} placeholder="Name of payer" />
              </div>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Expense
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalExpense || 0}</div>
            <p className="text-xs text-muted-foreground">
              For current month
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>List of all recorded expenses.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !data?.expenses?.length ? (
            <div className="text-center py-10 text-muted-foreground">
              No expenses found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.expenses.map((expense: Expense) => (
                  <TableRow key={expense._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="font-bold">₹{expense.amount}</TableCell>
                    <TableCell>{expense.paidBy || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this expense?")) {
                            deleteMutation.mutate(expense._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
         <span className="text-sm text-muted-foreground">Page {page}</span>
         <div className="flex gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!data?.pagination || page >= data.pagination.totalPages}
             >
                Next
            </Button>
         </div>
      </div>
    </div>
  );
};

export default ExpensesPage;
