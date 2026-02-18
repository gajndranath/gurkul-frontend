// frontend/src/features/admin/fees/components/ReminderHistory.tsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  History,
  Search,
  X,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  Phone,
  Smartphone,
  Bell,
  Download,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { formatDate, formatTime, formatDateTime } from "@/lib/utils";

export interface ReminderLog {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  type: "manual" | "auto" | "bulk";
  channel: "email" | "sms" | "push" | "in-app";
  status: "sent" | "failed" | "pending";
  title: string;
  message: string;
  sentAt: string;
  deliveredAt?: string;
  errorMessage?: string;
  reminderId?: string;
  month?: number;
  year?: number;
  amount?: number;
}

interface ReminderHistoryProps {
  studentId?: string;
  limit?: number;
}

// Mock data generator - moved outside component to prevent recreation
const generateMockHistory = (): ReminderLog[] => {
  const statuses: ("sent" | "failed" | "pending")[] = [
    "sent",
    "sent",
    "sent",
    "failed",
    "sent",
    "pending",
  ];
  const channels: ("email" | "sms" | "push" | "in-app")[] = [
    "email",
    "sms",
    "push",
    "in-app",
  ];
  const types: ("manual" | "auto" | "bulk")[] = ["manual", "auto", "bulk"];
  const students = [
    {
      id: "STU001",
      name: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul@email.com",
    },
    {
      id: "STU002",
      name: "Priya Patel",
      phone: "9876543211",
      email: "priya@email.com",
    },
    {
      id: "STU003",
      name: "Amit Kumar",
      phone: "9876543212",
      email: "amit@email.com",
    },
    {
      id: "STU004",
      name: "Neha Singh",
      phone: "9876543213",
      email: "neha@email.com",
    },
    {
      id: "STU005",
      name: "Vikram Mehta",
      phone: "9876543214",
      email: "vikram@email.com",
    },
  ];

  const history: ReminderLog[] = [];

  for (let i = 0; i < 50; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const channel = channels[Math.floor(Math.random() * channels.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));

    history.push({
      id: `rem-${Date.now()}-${i}`,
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      studentEmail: student.email,
      type,
      channel,
      status,
      title: "Fee Payment Reminder",
      message: `Dear ${student.name}, your fee payment is overdue. Please clear your dues at the earliest.`,
      sentAt: date.toISOString(),
      deliveredAt:
        status === "sent"
          ? new Date(date.getTime() + 5000).toISOString()
          : undefined,
      errorMessage:
        status === "failed"
          ? "Failed to deliver: Invalid phone number"
          : undefined,
      month: Math.floor(Math.random() * 12) + 1, // Fixed: Month 1-12 instead of 0-11
      year: 2024,
      amount: Math.floor(Math.random() * 5000) + 2000,
    });
  }

  return history.sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  );
};

const ReminderHistory: React.FC<ReminderHistoryProps> = ({
  studentId,
  limit = 20,
}) => {
  const toast = useToast();
  const toastRef = useRef(toast);
  const [history, setHistory] = useState<ReminderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<ReminderLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    toastRef.current = toast;
  }, [toast]);

  // Load history - wrapped in useCallback
  const loadHistory = useCallback(() => {
    setIsLoading(true);
    try {
      const mockHistory = generateMockHistory();
      const filtered = studentId
        ? mockHistory.filter((log) => log.studentId === studentId)
        : mockHistory;
      setHistory(filtered);
    } catch {
      toastRef.current.error("Error", "Failed to load reminder history");
    } finally {
      setIsLoading(false);
    }
  }, [studentId]); // Remove toast from dependencies

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Apply filters - using useMemo
  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.studentName.toLowerCase().includes(query) ||
          log.studentId.toLowerCase().includes(query) ||
          log.studentPhone.includes(query) ||
          log.studentEmail?.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }

    if (channelFilter !== "all") {
      filtered = filtered.filter((log) => log.channel === channelFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((log) => log.type === typeFilter);
    }

    return filtered.slice(0, limit);
  }, [history, searchQuery, statusFilter, channelFilter, typeFilter, limit]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const mockHistory = generateMockHistory();
      setHistory(mockHistory);
      setIsLoading(false);
      toast.success("Success", "History refreshed");
    }, 1000);
  }, [toast]);

  const handleExport = useCallback(() => {
    toast.info("Export", "Export functionality coming soon");
  }, [toast]);

  const handleResend = useCallback(
    (log: ReminderLog) => {
      toast.success("Success", `Reminder resent to ${log.studentName}`);
    },
    [toast],
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleLogClick = useCallback((log: ReminderLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  // Memoized helper functions
  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-3.5 w-3.5 text-rose-500" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    }
  }, []);

  const getChannelIcon = useCallback((channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-3.5 w-3.5" />;
      case "sms":
        return <Phone className="h-3.5 w-3.5" />;
      case "push":
        return <Smartphone className="h-3.5 w-3.5" />;
      case "in-app":
        return <Bell className="h-3.5 w-3.5" />;
      default:
        return <Bell className="h-3.5 w-3.5" />;
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "sent":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "failed":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  }, []);

  if (isLoading) {
    return <ReminderHistorySkeleton />;
  }

  return (
    <>
      <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
        <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <History size={18} className="text-amber-600" />
            Reminder History
            <Badge
              variant="outline"
              className="ml-2 rounded-full px-2 py-0.5 text-[8px] font-black"
            >
              {filteredHistory.length} Records
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
              type="button"
            >
              <RefreshCw size={14} className="text-slate-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
              type="button"
            >
              <Download size={14} className="text-slate-500" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search by student name, phone or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-slate-50 border-none rounded-xl text-xs"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200"
                  type="button"
                >
                  <X className="h-3 w-3 text-slate-400" />
                </button>
              )}
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[110px] h-10 bg-slate-50 border-none rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full sm:w-[110px] h-10 bg-slate-50 border-none rounded-xl">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="in-app">In-App</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[110px] h-10 bg-slate-50 border-none rounded-xl">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* History List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center">
                <History className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500">
                  No reminder history found
                </p>
              </div>
            ) : (
              filteredHistory.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white transition-all cursor-pointer"
                  onClick={() => handleLogClick(log)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleLogClick(log);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        {getChannelIcon(log.channel)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">
                            {log.studentName}
                          </p>
                          <Badge
                            variant="outline"
                            className={`rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase ${getStatusColor(log.status)}`}
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(log.status)}
                              {log.status}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-medium text-slate-500">
                            {log.channel.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-slate-300">•</span>
                          <span className="text-[9px] font-medium text-slate-500">
                            {formatDate(log.sentAt)}
                          </span>
                          <span className="text-[9px] text-slate-300">•</span>
                          <span className="text-[9px] font-medium text-slate-500">
                            {formatTime(log.sentAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        rounded-lg px-2 py-0.5 text-[8px] font-black uppercase
                        ${log.type === "manual" ? "bg-blue-50 text-blue-600 border-blue-200" : ""}
                        ${log.type === "auto" ? "bg-purple-50 text-purple-600 border-purple-200" : ""}
                        ${log.type === "bulk" ? "bg-amber-50 text-amber-600 border-amber-200" : ""}
                      `}
                    >
                      {log.type}
                    </Badge>
                  </div>

                  <p className="text-[10px] text-slate-600 line-clamp-2 ml-10">
                    {log.message}
                  </p>

                  {log.status === "failed" && log.errorMessage && (
                    <p className="text-[9px] text-rose-500 mt-1 ml-10">
                      {log.errorMessage}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-white rounded-[32px] max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              Reminder Details
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">
                      Student Information
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`rounded-md px-2 py-0.5 text-[8px] font-black uppercase ${getStatusColor(selectedLog.status)}`}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedLog.status)}
                      {selectedLog.status}
                    </span>
                  </Badge>
                </div>

                <div>
                  <p className="font-black text-slate-900">
                    {selectedLog.studentName}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    ID: {selectedLog.studentId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <div>
                    <span className="font-medium text-slate-400">Phone:</span>
                    <span className="ml-2 font-bold text-slate-600">
                      {selectedLog.studentPhone}
                    </span>
                  </div>
                  {selectedLog.studentEmail && (
                    <div>
                      <span className="font-medium text-slate-400">Email:</span>
                      <span className="ml-2 font-bold text-slate-600">
                        {selectedLog.studentEmail}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {getChannelIcon(selectedLog.channel)}
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    {selectedLog.channel} Message
                  </span>
                </div>

                <div>
                  <p className="text-[9px] font-medium text-slate-400 mb-1">
                    Subject:
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {selectedLog.title}
                  </p>
                </div>

                <div>
                  <p className="text-[9px] font-medium text-slate-400 mb-1">
                    Message:
                  </p>
                  <p className="text-[10px] text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                    {selectedLog.message}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-medium text-slate-400">Sent at:</span>
                  <span className="font-bold text-slate-700">
                    {formatDateTime(selectedLog.sentAt)}
                  </span>
                </div>
                {selectedLog.deliveredAt && (
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="font-medium text-slate-400">
                      Delivered at:
                    </span>
                    <span className="font-bold text-emerald-600">
                      {formatDateTime(selectedLog.deliveredAt)}
                    </span>
                  </div>
                )}
                {selectedLog.month !== undefined && selectedLog.year && (
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="font-medium text-slate-400">
                      Related Fee:
                    </span>
                    <span className="font-bold text-slate-700">
                      Month {selectedLog.month}/{selectedLog.year}
                      {selectedLog.amount && ` • ₹${selectedLog.amount}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCloseDetails}
                  className="flex-1 rounded-xl h-10 font-black text-[9px] uppercase tracking-widest"
                  type="button"
                >
                  Close
                </Button>
                {selectedLog.status === "failed" && (
                  <Button
                    onClick={() => {
                      handleResend(selectedLog);
                      setIsDetailsOpen(false);
                    }}
                    className="flex-1 rounded-xl h-10 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] uppercase tracking-widest"
                    type="button"
                  >
                    <RefreshCw size={12} className="mr-1.5" />
                    Resend
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// Skeleton Loading State
const ReminderHistorySkeleton = React.memo(() => (
  <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
    <CardHeader className="p-6 pb-4">
      <Skeleton className="h-6 w-40" />
    </CardHeader>
    <CardContent className="p-6 pt-0 space-y-4">
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </CardContent>
  </Card>
));

ReminderHistorySkeleton.displayName = "ReminderHistorySkeleton";

export default ReminderHistory;
