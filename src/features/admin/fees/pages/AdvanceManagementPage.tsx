// frontend/src/features/admin/fees/pages/AdvanceManagementPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Download,
  RefreshCw,
  Plus,
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { useAllAdvanceBalances } from "../hooks/useAdvance";
import { formatCurrency } from "@/lib/utils";
import AddAdvanceModal from "../components/modals/AddAdvanceModal";
import ApplyAdvanceModal from "../components/modals/ApplyAdvanceModal";
import type { AdvanceBalance } from "../hooks/useAdvance";

const AdvanceManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<AdvanceBalance | null>(
    null,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Hooks
  const {
    data: advanceBalances = [],
    isLoading,
    refetch,
  } = useAllAdvanceBalances();

  // Filter balances based on search
  const filteredBalances = React.useMemo(() => {
    if (!searchQuery) return advanceBalances;

    const query = searchQuery.toLowerCase();
    return advanceBalances.filter(
      (item) =>
        item.studentName.toLowerCase().includes(query) ||
        item.studentPhone.toLowerCase().includes(query) ||
        item.studentId.toLowerCase().includes(query),
    );
  }, [advanceBalances, searchQuery]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return advanceBalances.reduce(
      (acc, curr) => {
        acc.totalAdvance += curr.totalAmount;
        acc.remainingAdvance += curr.remainingAmount;
        acc.utilizedAdvance += curr.usedAmount;
        return acc;
      },
      { totalAdvance: 0, utilizedAdvance: 0, remainingAdvance: 0 },
    );
  }, [advanceBalances]);

  const handleRefresh = () => {
    refetch();
    toast.success("Success", "Advance balances refreshed");
  };

  const handleExport = () => {
    toast.info("Export", "Advance report export coming soon");
  };

  const handleAddSuccess = () => {
    refetch();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/fees")}
              className="h-8 w-8 rounded-lg hover:bg-blue-50"
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <DollarSign size={16} className="text-blue-600" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              Credit Terminal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
            Advance Management
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md leading-relaxed">
            Manage student advance payments, track credit balances, and apply
            advances to pending fees.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* System Status */}
          <div className="hidden xs:flex items-center gap-3 bg-white p-2.5 rounded-2xl ring-1 ring-slate-200 shadow-sm">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Credit Node
              </p>
              <p className="text-[11px] font-bold text-emerald-500 flex items-center justify-end gap-1.5 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {advanceBalances.length} Active
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 mx-1" />
            <ShieldCheck className="text-blue-600" size={20} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className="h-10 w-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleExport}
              className="h-10 w-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
              title="Export Report"
            >
              <Download className="h-4 w-4 text-slate-600" />
            </Button>
            <Button
              className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Add Advance
            </Button>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Credit Overview
          </h2>
          <Separator className="flex-1 opacity-50" />
          <Badge
            variant="outline"
            className="rounded-full px-3 py-1 text-[9px] font-black uppercase border-blue-200 bg-blue-50 text-blue-600 whitespace-nowrap"
          >
            {advanceBalances.length} Students with Credit
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-[24px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Advance Card */}
            <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <DollarSign size={20} />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase tracking-tighter"
                  >
                    Total Credit
                  </Badge>
                </div>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">
                  {formatCurrency(totals.totalAdvance)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  Total Advance Received
                </p>
              </CardContent>
            </Card>

            {/* Utilized Advance Card */}
            <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle size={20} />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase tracking-tighter text-emerald-600 border-emerald-100"
                  >
                    Utilized
                  </Badge>
                </div>
                <p className="text-2xl font-black text-emerald-600 tracking-tighter">
                  {formatCurrency(totals.utilizedAdvance)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  Applied to Fees
                </p>
              </CardContent>
            </Card>

            {/* Available Advance Card */}
            <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <AlertCircle size={20} />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-black uppercase tracking-tighter text-amber-600 border-amber-100"
                  >
                    Available
                  </Badge>
                </div>
                <p className="text-2xl font-black text-amber-600 tracking-tighter">
                  {formatCurrency(totals.remainingAdvance)}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                  Remaining Credit Balance
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Search & Table Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
            Student Credit Ledger
          </h2>
          <Separator className="flex-1 opacity-50" />
        </div>

        {/* Search Bar */}
        <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
          <CardContent className="p-4 md:p-6">
            <div className="relative flex-1 group">
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
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] md:rounded-[32px] overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredBalances.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="bg-slate-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto ring-1 ring-slate-100">
                  <DollarSign className="text-slate-300" size={24} />
                </div>
                <p className="text-slate-900 font-black text-sm md:text-base uppercase tracking-wider">
                  No Advance Records Found
                </p>
                <p className="text-slate-400 font-medium text-[10px] md:text-xs uppercase tracking-wider">
                  {searchQuery
                    ? "Try adjusting your search"
                    : "Add an advance to get started"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest px-6"
                  >
                    <Plus className="h-3.5 w-3.5 mr-2" />
                    Add First Advance
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Student
                      </TableHead>
                      <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total Advance
                      </TableHead>
                      <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Utilized
                      </TableHead>
                      <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Available
                      </TableHead>
                      <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Months Covered
                      </TableHead>
                      <TableHead className="text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBalances.map((balance) => (
                      <TableRow
                        key={balance.studentId}
                        className="hover:bg-slate-50/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-black text-blue-600">
                                {balance.studentName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">
                                {balance.studentName}
                              </p>
                              <p className="text-[9px] font-medium text-slate-400">
                                {balance.studentPhone}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-slate-900">
                            {formatCurrency(balance.totalAmount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-emerald-600">
                            {formatCurrency(balance.usedAmount)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`
                              rounded-lg px-2 py-0.5 text-[9px] font-black uppercase
                              ${
                                balance.remainingAmount > 0
                                  ? "bg-amber-50 text-amber-600 border-amber-200"
                                  : "bg-slate-50 text-slate-400 border-slate-200"
                              }
                            `}
                          >
                            {formatCurrency(balance.remainingAmount)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-medium text-slate-700">
                            {balance.monthsCovered}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
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
                              className="bg-white rounded-xl border-slate-200 shadow-lg p-1 min-w-[160px]"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    `/admin/students/${balance.studentId}`,
                                  )
                                }
                                className="rounded-lg text-xs font-medium py-2 cursor-pointer hover:bg-slate-50"
                              >
                                <User className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                View Student
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedStudent(balance);
                                  setIsAddModalOpen(true);
                                }}
                                className="rounded-lg text-xs font-medium py-2 cursor-pointer hover:bg-slate-50"
                              >
                                <Plus className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                Add Advance
                              </DropdownMenuItem>
                              {balance.remainingAmount > 0 && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedStudent(balance);
                                    setIsApplyModalOpen(true);
                                  }}
                                  className="rounded-lg text-xs font-medium py-2 cursor-pointer hover:bg-slate-50"
                                >
                                  <CreditCard className="h-3.5 w-3.5 mr-2 text-slate-500" />
                                  Apply Advance
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer Stats */}
      <footer className="pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200/60">
        <div className="flex items-center gap-4 text-[9px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {advanceBalances.filter((b) => b.remainingAmount > 0).length} Active
            Credits
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Avg. Credit:{" "}
            {formatCurrency(
              totals.remainingAdvance / (advanceBalances.length || 1),
            )}
          </span>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
            Library Management Protocol • Credit Module
          </p>
          <p className="text-[8px] font-bold text-blue-600 uppercase tracking-tighter mt-1">
            Last updated:{" "}
            {new Date().toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}{" "}
            IST
          </p>
        </div>
      </footer>

      {/* Modals */}
      <AddAdvanceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedStudent(null);
        }}
        onSuccess={handleAddSuccess}
        preselectedStudentId={selectedStudent?.studentId}
      />

      {selectedStudent && (
        <ApplyAdvanceModal
          studentId={selectedStudent.studentId}
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            refetch();
            toast.success("Success", "Advance applied successfully");
          }}
        />
      )}
    </div>
  );
};

export default AdvanceManagementPage;
