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
import {
  Clock,
  Calendar,
  Wallet,
  User,
  Bell,
  CheckCircle,
  AlertCircle,
  Megaphone,
  CreditCard,
  History,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";

const StudentDashboardPage: React.FC = () => {
  const { data, isLoading, refetch } = useQuery<DashboardApiResponse>({
    queryKey: ["student-dashboard"],
    queryFn: fetchStudentDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const student = data?.student;
  const paymentStatus = data?.feeSummary;
  const recentPayments = data?.recentPayments || [];
  const dueItems = data?.dueItems || [];
  const unreadNotifications = data?.unreadNotifications || [];
  const announcements = data?.announcements || [];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hi, {student?.name || "Student"}!
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            {student?.status === "ACTIVE" ? "Active" : "Inactive"} Member • {student?.libraryId || "S-PORTAL"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border hover:bg-muted transition-colors"
          >
            <History className="w-4 h-4" /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Pay Fee <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Slot & Timing Card */}
          <Card className="relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Clock className="w-32 h-32" />
            </div>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md">
                    <Clock className="w-3 h-3" /> CURRENT SLOT
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {student?.slot?.name || "No Slot Assigned"}
                    </h2>
                    <p className="text-indigo-100 text-lg">
                      {student?.slot?.timeRange?.start} - {student?.slot?.timeRange?.end}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center md:text-right">
                    <p className="text-indigo-200 text-sm font-medium mb-1">YOUR SEAT</p>
                    <p className="text-4xl font-black">{student?.seatNumber || "NA"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Paid</p>
                  <p className="text-xl font-bold">₹{paymentStatus?.totals?.totalPaid ?? 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Due</p>
                  <p className="text-xl font-bold">₹{paymentStatus?.totals?.totalDue ?? 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Next Billing</p>
                  <p className="text-xl font-bold">
                    {student?.nextBillingDate 
                      ? format(new Date(student.nextBillingDate), "dd MMM")
                      : "TBD"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment & Dues Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-500" /> Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.length > 0 ? (
                    recentPayments.map((p) => (
                      <div key={p._id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold">{p.month} {p.year}</p>
                          <p className="text-xs text-muted-foreground">
                            {p.paymentDate ? format(new Date(p.paymentDate), "dd MMM, yyyy") : "Paid"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{p.amount}</p>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">PAID</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground text-xs py-4">No recent payments</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" /> Outstanding Dues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dueItems.length > 0 ? (
                    dueItems.map((d) => (
                      <div key={d._id} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold">{d.month} {d.year}</p>
                          <p className="text-xs text-muted-foreground">Due for current session</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">₹{d.amount}</p>
                          <p className="text-[10px] uppercase font-bold text-red-600">DUE</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">All Clear!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar / Alerts feed */}
        <div className="space-y-6">
          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-500" /> Library Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-6">
              {announcements.length > 0 ? (
                announcements.map((a) => (
                  <div key={a._id} className="bg-white p-3 rounded-lg shadow-sm border space-y-1">
                    <p className="font-bold text-xs">{a.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {a.body}
                    </p>
                    <p className="text-[10px] text-muted-foreground pt-1">
                      {format(new Date(a.createdAt), "dd MMM • hh:mm a")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-xs py-2">No announcements</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" /> Notifications
              </CardTitle>
              {unreadNotifications.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                  {unreadNotifications.length}
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map((n) => (
                  <div key={n._id} className="flex gap-3 text-sm">
                    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <p className="font-medium text-xs">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground">{n.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground text-xs py-2">Nothing new!</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-indigo-50/50 border-indigo-100">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <button className="w-full text-left px-3 py-2 text-xs font-semibold rounded-md hover:bg-white transition-colors flex items-center justify-between group">
                Request Slot Change <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full text-left px-3 py-2 text-xs font-semibold rounded-md hover:bg-white transition-colors flex items-center justify-between group">
                 Update Profile <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <button className="w-full text-left px-3 py-2 text-xs font-semibold rounded-md hover:bg-white transition-colors flex items-center justify-between group text-red-600">
                 Logout
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;
