// Add at the top, after imports

import React from "react";

import { useQuery } from "@tanstack/react-query";

import { fetchStudentDashboard } from "../../api/studentDashboardApi";
import type { DashboardApiResponse } from "../../api/studentDashboardApi";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";

import { Separator } from "../../components/ui/separator";

const StudentDashboardPage: React.FC = () => {
  // Dashboard data
  const { data, isError, refetch } = useQuery<DashboardApiResponse>({
    queryKey: ["student-dashboard"],
    queryFn: fetchStudentDashboard,
  });

  // Extract student from API response
  const student = data?.student;
  // Debug: log API data and errors
  React.useEffect(() => {
    console.log("[StudentDashboard] API data:", data);
    if (isError) {
      console.error("[StudentDashboard] API error fetching dashboard data");
    }
  }, [data, isError]);
  // Payment status and slot info are now part of the dashboard data
  const paymentStatus = data?.feeSummary;
  const slot = data?.student?.slotId as
    | {
        name?: string;
        timeRange?: { start?: string; end?: string };
        monthlyFee?: number;
        totalSeats?: number;
      }
    | undefined;

  // ...existing code...

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {student?.name || "Student"}
          </h1>
          <div className="text-sm text-gray-500">Role: Student</div>
        </div>
        <button
          className="px-4 py-2 rounded bg-primary text-white font-medium hover:bg-primary/90 transition"
          onClick={() => refetch()}
        >
          Refresh
        </button>
      </div>

      {/* Payment Status */}
      <div>
        <Separator className="my-6" />
        <h2 className="text-lg font-semibold mb-2">Payment Status</h2>
        {paymentStatus ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-gray-500">
                    Total Paid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-green-600">
                    ₹{paymentStatus.totals?.totalPaid ?? 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-red-600">
                    Total Due
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-red-600">
                    ₹{paymentStatus.totals?.totalDue ?? 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-yellow-600">
                    Total Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-yellow-600">
                    ₹{paymentStatus.totals?.totalPending ?? 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-gray-400">No payment summary found.</div>
        )}
      </div>
      {/* Slot Info */}
      <div>
        <Separator className="my-6" />
        <h2 className="text-lg font-semibold mb-2">Slot Information</h2>
        {slot && slot.name ? (
          <Card>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-semibold">Slot Name:</span> {slot.name}
                </div>
                <div>
                  <span className="font-semibold">Time Range:</span>{" "}
                  {slot.timeRange?.start} - {slot.timeRange?.end}
                </div>
                <div>
                  <span className="font-semibold">Monthly Fee:</span> ₹
                  {slot.monthlyFee}
                </div>
                <div>
                  <span className="font-semibold">Total Seats:</span>{" "}
                  {slot.totalSeats}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-gray-400">No slot information found.</div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboardPage;
