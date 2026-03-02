import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  fetchMyPayments, 
  fetchMyFeeCalendar, 
} from "./api/studentPaymentApi";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  IndianRupee,
  History,
  Info
} from "lucide-react";
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
import { Button } from "../../../components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StudentPaymentsPage: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [page] = useState(1);
  const limit = 10;

  // Fetch Calendar Data
  const { 
    data: calendarData, 
    isLoading: loadingCalendar 
  } = useQuery({
    queryKey: ["myFeeCalendar", selectedYear],
    queryFn: () => fetchMyFeeCalendar(selectedYear),
  });

  // Fetch Transaction History
  const { 
    data: historyData, 
    isLoading: loadingHistory 
  } = useQuery({
    queryKey: ["myPayments", page],
    queryFn: () => fetchMyPayments(page, limit),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100/50";
      case "DUE": return "bg-rose-50 text-rose-700 border-rose-200 shadow-rose-100/50";
      case "PENDING": return "bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100/50";
      default: return "bg-slate-50 text-slate-400 border-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "DUE": return <AlertCircle size={16} className="text-rose-500" />;
      case "PENDING": return <Clock size={16} className="text-amber-500" />;
      default: return null;
    }
  };

  if (loadingCalendar || loadingHistory) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-xl border-4 border-slate-100 border-t-blue-600 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Records...</p>
      </div>
    );
  }

  const calendarSummary = calendarData?.summary;
  const calendarItems = calendarData?.calendar || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <IndianRupee size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Terminal</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900 leading-none">
            Fee <span className="text-blue-600">Dynamics</span>
          </h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">
            Monitor your subscription status and upcoming obligations
          </p>
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-9 w-9"
            onClick={() => setSelectedYear(prev => prev - 1)}
          >
            <ChevronLeft size={18} />
          </Button>
          <div className="px-4 text-sm font-black text-slate-800 tracking-tighter uppercase italic">
            Cycle {selectedYear}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-9 w-9"
            onClick={() => setSelectedYear(prev => prev + 1)}
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase">
                {calendarSummary?.paidMonths} Months
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Settled</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{calendarSummary?.totalPaid.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-rose-200/30 bg-white rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 group-hover:scale-110 transition-transform">
                <AlertCircle size={24} />
              </div>
              <Badge variant="secondary" className="bg-rose-50 text-rose-700 border-none font-black text-[10px] uppercase">
                {calendarSummary?.dueMonths} Months
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Overdue Balance</p>
              <p className="text-2xl font-black text-rose-600 tracking-tighter">₹{calendarSummary?.totalDue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-amber-200/30 bg-white rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-black text-[10px] uppercase">
                {calendarSummary?.pendingMonths} Planned
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upcoming Estimate</p>
              <p className="text-2xl font-black text-amber-600 tracking-tighter">₹{calendarSummary?.totalPending.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-blue-200/30 bg-blue-600 rounded-[2rem] overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4 text-white">
              <div className="p-3 bg-blue-500 rounded-2xl group-hover:scale-110 transition-transform">
                <CalendarIcon size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-wider">Next Due Date</p>
              <p className="text-xl font-black text-white tracking-tighter italic">
                {calendarItems.find(c => c.status === "PENDING" || c.status === "DUE")?.feeDueDate 
                  ? new Date(calendarItems.find(c => c.status === "PENDING" || c.status === "DUE")!.feeDueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
                  : "No Pending"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon size={16} className="text-slate-400" />
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Yearly Performance Matrix</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {calendarItems.map((item) => (
            <TooltipProvider key={`${item.month}-${item.year}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={`p-4 rounded-3xl border transition-all duration-300 relative group cursor-help ${getStatusColor(item.status)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                        {item.label.split(' ')[0]}
                      </span>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-lg font-black tracking-tighter">₹{(item.totalAmount || 0).toLocaleString()}</div>
                      <div className="text-[9px] font-bold uppercase tracking-tight opacity-50">
                        {item.status === "PAID" ? "Settled" : item.status === "DUE" ? `${item.daysOverdue}d Overdue` : "Expected"}
                      </div>
                    </div>
                    
                    {/* Status Dot */}
                    <div className={`absolute bottom-2 right-2 h-1.5 w-1.5 rounded-full ${
                      item.status === "PAID" ? "bg-emerald-500" : 
                      item.status === "DUE" ? "bg-rose-500 animate-pulse" : 
                      item.status === "PENDING" ? "bg-amber-500" : "bg-slate-300"
                    }`} />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-none rounded-2xl p-3 shadow-2xl">
                  <div className="space-y-2 min-w-[140px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-1 mb-1">Details: {item.label}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Total Fee</span>
                      <span className="font-bold">₹{item.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Paid</span>
                      <span className="font-bold text-emerald-400">₹{item.paidAmount}</span>
                    </div>
                    {item.remainingAmount > 0 && (
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-rose-400">Remaining</span>
                        <span className="font-bold text-rose-400">₹{item.remainingAmount}</span>
                      </div>
                    )}
                    {item.paymentDate && (
                      <div className="text-[9px] text-slate-500 mt-2 italic">
                        Settled on {new Date(item.paymentDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>

      {/* Detailed Transaction History */}
      <Card className="border-none shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
              <History size={18} />
            </div>
            <div className="space-y-0.5">
              <CardTitle className="text-xl font-black text-slate-900 tracking-tighter italic uppercase">Transaction <span className="text-blue-600">Log</span></CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chronological signal history</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!historyData || historyData.payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
              <Info size={48} strokeWidth={1} className="mb-4" />
              <p className="text-sm font-black uppercase tracking-widest">No terminal records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-y border-slate-100">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12">Month</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12 text-center">Protocol</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12">Settled Amount</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 h-12">Timestamp</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-8 text-right pr-8 h-12">Reference ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyData.payments.map((payment) => (
                    <TableRow key={payment._id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs italic ${
                            payment.status === "PAID" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}>
                            {new Date(0, payment.month).toLocaleString("default", { month: "short" })}
                          </div>
                          <div>
                            <div className="text-sm font-black text-slate-900 tracking-tight">{new Date(0, payment.month).toLocaleString("default", { month: "long" })}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none">Cycle {payment.year}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-8 text-center">
                        <div className="flex justify-center">
                          <Badge 
                            className={`rounded-lg font-black text-[9px] uppercase tracking-wider px-2 py-0.5 border-none ${
                                payment.paymentMethod === "ONLINE" || payment.paymentMethod === "UPI" 
                                ? "bg-blue-50 text-blue-600" 
                                : payment.paymentMethod === "CASH" 
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-50 text-slate-400"
                            }`}
                          >
                            {payment.paymentMethod || "UNSPECIFIED"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        {payment.paidAmount > 0 ? (
                          <div className="space-y-0.5">
                            <span className="text-sm font-black text-emerald-600 tracking-tighter">₹{payment.paidAmount.toLocaleString()}</span>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Full Settlement</div>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-black">---</span>
                        )}
                      </TableCell>
                      <TableCell className="px-8">
                        {payment.paymentDate ? (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock size={12} className="opacity-40" />
                            <span className="text-xs font-bold">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300">---</span>
                        )}
                      </TableCell>
                      <TableCell className="px-8 text-right pr-8">
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                          {payment.transactionId || payment._id.slice(-8)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPaymentsPage;
