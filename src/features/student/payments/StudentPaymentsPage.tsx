import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyPayments, type StudentPayment } from "./api/studentPaymentApi";
import { Loader2, Calendar,  Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";


const StudentPaymentsPage: React.FC = () => {
  const [page] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myPayments", page],
    queryFn: () => fetchMyPayments(page, limit),
  });

  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString("default", { month: "long" });
  };

  const calculateTotal = (payment: StudentPayment) => {
    return (payment.baseFee || 0) + (payment.dueCarriedForwardAmount || 0);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-red-500">
        Failed to load payment history.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
          <p className="text-muted-foreground">
            View your past fee payments and due records.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            A list of all your monthly fee records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data || data.payments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No payment records found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Fee</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.payments.map((payment) => (
                    <TableRow key={payment._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          {getMonthName(payment.month)} {payment.year}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payment.status === "PAID"
                              ? "default"
                              : payment.status === "DUE"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            payment.status === "PAID" ? "bg-green-500 hover:bg-green-600" : ""
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{calculateTotal(payment)}</TableCell>
                      <TableCell>
                        {payment.paidAmount > 0 ? (
                          <span className="font-bold text-green-600">
                            ₹{payment.paidAmount}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.paymentDate ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={14} />
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {payment.paymentMethod ? (
                          payment.paymentMethod.toLowerCase()
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination Controls could go here */}
      
    </div>
  );
};

export default StudentPaymentsPage;
