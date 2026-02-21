// frontend/src/features/admin/fees/widgets/DueTrackingTableWidget.tsx

import React, { memo, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Bell,
  CreditCard,
  AlertCircle,
  Calendar,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useDueTracking } from "../hooks/useDueTracking";
import { getUrgencyConfig, formatDueDate } from "../lib/dueCalculations";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/useToast"; // ✅ ADDED
import type { DueRecord } from "../types/fee.types";

// ✅ Import Modals
import SendReminderModal from "../components/modals/SendReminderModal";
import PaymentActionModal from "./PaymentActionModal";
import ApplyAdvanceModal from "../components/modals/ApplyAdvanceModal"; // ✅ NEW

const ITEMS_PER_PAGE = 10;

interface DueTrackingTableWidgetProps {
  className?: string;
}

const DueTrackingTableWidget: React.FC<DueTrackingTableWidgetProps> = memo(
  ({ className = "" }) => {
    const navigate = useNavigate();
    const toast = useToast(); // ✅ ADDED
    const { filteredRecords, isLoading, refetch } = useDueTracking();

    // ✅ State for modals
    const [reminderRecord, setReminderRecord] = useState<DueRecord | null>(
      null,
    );
    const [paymentItem, setPaymentItem] = useState<DueRecord | null>(null);
    const [applyAdvanceStudent, setApplyAdvanceStudent] =
      useState<DueRecord | null>(null); // ✅ NEW

    // Local State
    const [searchQuery, setSearchQuery] = useState("");
    const [daysFilter, setDaysFilter] = useState<string>("all");
    const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Apply filters
    const filteredData = useMemo(() => {
      let records = filteredRecords({
        search: searchQuery || undefined,
      });

      if (daysFilter !== "all") {
        const minDays = parseInt(daysFilter);
        records = records.filter((r) => r.daysOverdue >= minDays);
      }

      if (urgencyFilter !== "all") {
        records = records.filter((r) => r.urgency === urgencyFilter);
      }

      return records;
    }, [filteredRecords, searchQuery, daysFilter, urgencyFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE,
    );

    // Reset page when filters change
    React.useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, daysFilter, urgencyFilter]);

    const clearFilters = () => {
      setSearchQuery("");
      setDaysFilter("all");
      setUrgencyFilter("all");
    };

    const hasFilters =
      searchQuery || daysFilter !== "all" || urgencyFilter !== "all";

    if (isLoading) {
      return <DueTableSkeleton />;
    }

    return (
      <>
        <div className={`space-y-4 ${className}`}>
          {/* Filters Section */}
          <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] bg-white">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    placeholder="Search by student name, phone or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all w-full"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={daysFilter} onValueChange={setDaysFilter}>
                    <SelectTrigger className="w-full sm:w-[160px] h-11 bg-white border-slate-200 rounded-xl">
                      <SelectValue placeholder="Days Overdue" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-slate-200">
                      <SelectItem value="all">All Overdue</SelectItem>
                      <SelectItem value="7">7+ days overdue</SelectItem>
                      <SelectItem value="15">15+ days overdue</SelectItem>
                      <SelectItem value="30">30+ days overdue</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={urgencyFilter}
                    onValueChange={setUrgencyFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[140px] h-11 bg-white border-slate-200 rounded-xl">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-slate-200">
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>

                  {hasFilters && (
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="h-11 px-4 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table Section */}
          <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-4 md:p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight">
                    Overdue Fee Records
                  </CardTitle>
                  <CardDescription className="text-[10px] md:text-xs font-medium text-slate-500 mt-1">
                    Showing {paginatedData.length} of {filteredData.length}{" "}
                    records
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[9px] font-black uppercase border-rose-200 bg-rose-50 text-rose-600"
                >
                  {filteredData.length} Overdue
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredData.length === 0 ? (
                <div className="py-16 md:py-20 text-center space-y-3">
                  <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto ring-1 ring-slate-100">
                    <CheckCircle className="text-emerald-500" size={24} />
                  </div>
                  <p className="text-slate-900 font-black text-sm md:text-base uppercase tracking-wider">
                    No Overdue Records!
                  </p>
                  <p className="text-slate-400 font-medium text-[10px] md:text-xs uppercase tracking-wider">
                    All fees are up to date
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Student
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Month
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Amount
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Due Date
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Days
                          </th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Priority
                          </th>
                          <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {paginatedData.map((record, index) => {
                          const urgency = getUrgencyConfig(record.urgency);
                          return (
                            <tr
                              key={`${record.studentId || "unknown"}-${record.month}-${record.year}-${record.totalAmount}-${index}`}
                              className="group hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`h-8 w-8 rounded-full ${urgency.color.split(" ")[0]} flex items-center justify-center`}
                                  >
                                    <AlertCircle
                                      className={`h-4 w-4 ${urgency.color.split(" ")[1]}`}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">
                                      {record.studentName}
                                    </p>
                                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tighter">
                                      ID:{" "}
                                      {(record.studentId || "unknown").slice(
                                        -6,
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  <span className="text-xs font-medium text-slate-700">
                                    {formatDueDate(record.month, record.year)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-black text-rose-600 text-sm">
                                  {formatCurrency(record.totalAmount)}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs text-slate-600">
                                  {formatDate(record.dueDate)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  variant="outline"
                                  className={`
                                  rounded-lg px-2 py-0.5 text-[9px] font-black uppercase
                                  ${record.daysOverdue > 30 ? "bg-rose-50 text-rose-600 border-rose-200" : ""}
                                  ${record.daysOverdue > 15 && record.daysOverdue <= 30 ? "bg-orange-50 text-orange-600 border-orange-200" : ""}
                                  ${record.daysOverdue > 7 && record.daysOverdue <= 15 ? "bg-amber-50 text-amber-600 border-amber-200" : ""}
                                  ${record.daysOverdue <= 7 ? "bg-slate-50 text-slate-600 border-slate-200" : ""}
                                `}
                                >
                                  {record.daysOverdue}d
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <Badge
                                  className={`rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase ${urgency.color}`}
                                >
                                  {urgency.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-xl hover:bg-slate-100"
                                    >
                                      <span className="font-black text-slate-400 text-xs">
                                        •••
                                      </span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="bg-white rounded-xl border-slate-200 shadow-lg p-1 min-w-[200px]"
                                  >
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(
                                          `/admin/students/${record.studentId || "unknown"}`,
                                        )
                                      }
                                      className="rounded-lg text-xs font-medium py-2 cursor-pointer hover:bg-slate-50"
                                    >
                                      <User className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                      View Student
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setReminderRecord(record)}
                                      className="rounded-lg text-xs font-medium py-2 cursor-pointer hover:bg-slate-50"
                                    >
                                      <Bell className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                      Send Reminder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setPaymentItem(record)}
                                      className="rounded-lg text-xs font-medium py-2 cursor-pointer hover:bg-slate-50"
                                    >
                                      <CreditCard className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                      Record Payment
                                    </DropdownMenuItem>
                                    {/* ✅ NEW: Apply Advance Option */}
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setApplyAdvanceStudent(record)
                                      }
                                      className="rounded-lg text-xs font-medium py-2 cursor-pointer hover:bg-slate-50"
                                    >
                                      <CreditCard className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                      Apply Advance
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden divide-y divide-slate-100">
                    {paginatedData.map((record, index) => {
                      const urgency = getUrgencyConfig(record.urgency);
                      return (
                        <div
                          key={`${record.studentId || "unknown"}-${record.month}-${record.year}-${record.totalAmount}-${index}`}
                          className="p-5 space-y-4 hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div
                                className={`h-10 w-10 rounded-xl ${urgency.color.split(" ")[0]} flex items-center justify-center shrink-0`}
                              >
                                <AlertCircle
                                  className={`h-5 w-5 ${urgency.color.split(" ")[1]}`}
                                />
                              </div>
                              <div>
                                <p className="font-black text-slate-900 text-sm leading-tight">
                                  {record.studentName}
                                </p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                                  ID:{" "}
                                  {(record.studentId || "unknown").slice(-8)}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={`rounded-md px-2 py-1 text-[8px] font-black uppercase ${urgency.color}`}
                            >
                              {urgency.label}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                Amount
                              </p>
                              <p className="font-black text-rose-600 text-base">
                                {formatCurrency(record.totalAmount)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                Days Overdue
                              </p>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                <span className="font-bold text-slate-900 text-sm">
                                  {record.daysOverdue}d
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                Due Date
                              </p>
                              <p className="text-xs font-medium text-slate-600">
                                {formatDate(record.dueDate)}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                Month
                              </p>
                              <p className="text-xs font-medium text-slate-600">
                                {formatDueDate(record.month, record.year)}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-10 rounded-xl border-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-wider hover:bg-slate-100"
                              onClick={() => setReminderRecord(record)}
                            >
                              <Bell className="h-3.5 w-3.5 mr-1.5" />
                              Remind
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-wider"
                              onClick={() => setPaymentItem(record)}
                            >
                              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                              Collect
                            </Button>
                          </div>

                          {/* ✅ NEW: Mobile Apply Advance Button - Optional, can be added if space permits */}
                          {/* Uncomment if you want a third button
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-10 rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700 font-black text-[9px] uppercase tracking-wider hover:bg-emerald-100"
                            onClick={() => setApplyAdvanceStudent(record)}
                          >
                            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                            Apply Advance
                          </Button>
                          */}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 md:px-6 py-4 border-t border-slate-100">
                      <p className="text-[9px] md:text-[10px] font-medium text-slate-500">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                          className="h-8 px-3 rounded-xl text-xs font-bold"
                        >
                          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                          className="h-8 px-3 rounded-xl text-xs font-bold"
                        >
                          Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Send Reminder Modal */}
        {reminderRecord && (
          <SendReminderModal
            record={reminderRecord}
            isOpen={!!reminderRecord}
            onClose={() => setReminderRecord(null)}
            onSuccess={() => refetch()}
          />
        )}

        {/* Payment Action Modal */}
        {paymentItem && (
          <PaymentActionModal
            studentId={paymentItem.studentId || "unknown"}
            item={{
              month: paymentItem.month,
              year: paymentItem.year,
              totalAmount: paymentItem.totalAmount,
              status: paymentItem.status,
              baseFee: 0,
              dueCarriedForward: 0,
              coveredByAdvance: false,
              locked: false,
              paidAmount: 0,
              remainingAmount: paymentItem.totalAmount,
              daysOverdue: 0,
            }}
            isOpen={!!paymentItem}
            onClose={() => {
              setPaymentItem(null);
              refetch();
            }}
          />
        )}

        {/* ✅ NEW: Apply Advance Modal */}
        {applyAdvanceStudent && (
          <ApplyAdvanceModal
            studentId={applyAdvanceStudent.studentId || "unknown"}
            isOpen={!!applyAdvanceStudent}
            onClose={() => setApplyAdvanceStudent(null)}
            onSuccess={() => {
              refetch();
              toast.success("Success", "Advance applied successfully");
            }}
          />
        )}
      </>
    );
  },
);

// Skeleton Loading State
const DueTableSkeleton = () => (
  <div className="space-y-4">
    <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] bg-white">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <Skeleton className="flex-1 h-11 rounded-xl" />
          <div className="flex gap-3">
            <Skeleton className="w-[160px] h-11 rounded-xl" />
            <Skeleton className="w-[140px] h-11 rounded-xl" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] overflow-hidden bg-white">
      <CardHeader className="p-4 md:p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden md:block p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

DueTrackingTableWidget.displayName = "DueTrackingTableWidget";
export default DueTrackingTableWidget;
