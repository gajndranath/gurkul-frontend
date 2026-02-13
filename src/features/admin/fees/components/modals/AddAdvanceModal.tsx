// frontend/src/features/admin/fees/components/modals/AddAdvanceModal.tsx

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  DollarSign,
  Search,
  User,
  Plus,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/useToast";
import { useAddAdvance } from "@/features/admin/fees/hooks/useAdvance";
import * as studentAdminApi from "@/api/studentsAdminApi";
import { formatCurrency } from "@/lib/utils";
import type { Student } from "@/features/admin/students/types";

interface AddAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedStudentId?: string;
}

const AddAdvanceModal: React.FC<AddAdvanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedStudentId,
}) => {
  const toast = useToast();
  const addAdvanceMutation = useAddAdvance();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [remarks, setRemarks] = useState("");

  // Fetch students for selection
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students", "active", searchQuery],
    queryFn: async () => {
      const response = await studentAdminApi.getStudents({
        limit: 20,
        status: "ACTIVE",
        search: searchQuery || undefined,
      });
      return response;
    },
    enabled: isOpen && !preselectedStudentId, // Only fetch if no preselected student
  });

  // Fetch preselected student details
  const { data: preselectedStudentData } = useQuery({
    queryKey: ["student", preselectedStudentId],
    queryFn: async () => {
      if (!preselectedStudentId) return null;
      const student = await studentAdminApi.getStudent(preselectedStudentId);
      return student;
    },
    enabled: !!preselectedStudentId && isOpen,
  });

  // Set preselected student when data loads
  React.useEffect(() => {
    if (preselectedStudentData) {
      setSelectedStudent(preselectedStudentData);
    }
  }, [preselectedStudentData]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedStudent(null);
      setAmount(0);
      setRemarks("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error("Error", "Please select a student");
      return;
    }

    if (amount <= 0) {
      toast.error("Error", "Amount must be greater than 0");
      return;
    }

    try {
      await addAdvanceMutation.mutateAsync({
        studentId: selectedStudent._id || selectedStudent.id,
        amount,
        remarks: remarks || undefined,
      });

      toast.success("Success", `Advance added to ${selectedStudent.name}`);
      onSuccess?.();
      onClose();
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          z-[9999]
          w-[92vw] max-w-[500px] 
          rounded-[32px] p-0 overflow-hidden 
          border-none shadow-2xl bg-white outline-none 
          [&>button]:hidden
          max-h-[90vh] flex flex-col
        "
      >
        {/* Header */}
        <DialogHeader className="p-6 border-b border-slate-50 bg-white sticky top-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-7 p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-100">
              <DollarSign size={20} className="text-white" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg font-black text-slate-900 tracking-tighter uppercase italic">
                Add Advance<span className="text-blue-600">.</span>
              </DialogTitle>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                Student Credit Balance
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* Student Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Select Student
              </label>

              {preselectedStudentId ? (
                // Preselected student view
                selectedStudent && (
                  <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm">
                          {selectedStudent.name}
                        </p>
                        <p className="text-[9px] font-medium text-slate-500 mt-0.5">
                          {selectedStudent.phone} • {selectedStudent.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-lg bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-black uppercase"
                    >
                      Selected
                    </Badge>
                  </div>
                )
              ) : (
                // Student search view
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-11 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>

                  <ScrollArea className="h-[200px] rounded-xl border border-slate-100 bg-white">
                    {isLoadingStudents ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : studentsData?.students?.length ? (
                      <div className="divide-y divide-slate-50">
                        {studentsData.students.map((student) => (
                          <button
                            key={student._id || student.id}
                            type="button"
                            onClick={() => setSelectedStudent(student)}
                            className={`
                              w-full p-3 flex items-center justify-between hover:bg-slate-50 transition-colors
                              ${selectedStudent?._id === student._id ? "bg-blue-50/50" : ""}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <span className="text-xs font-black text-slate-600">
                                  {student.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-bold text-slate-900">
                                  {student.name}
                                </p>
                                <p className="text-[9px] text-slate-500">
                                  {student.phone}
                                </p>
                              </div>
                            </div>
                            {selectedStudent?._id === student._id && (
                              <Badge className="bg-blue-600 text-white text-[8px] px-2 py-0.5 rounded-full">
                                Selected
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center p-6">
                        <User className="h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-xs font-medium text-slate-500">
                          No students found
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Amount Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Advance Amount (₹)
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-blue-600">
                  ₹
                </span>
                <Input
                  type="number"
                  value={amount || ""}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount"
                  className="pl-8 h-14 rounded-2xl border-none bg-slate-50 font-black text-xl focus-visible:ring-2 focus-visible:ring-blue-600 transition-all"
                  min="1"
                  step="1"
                />
              </div>
              {amount > 0 && (
                <p className="text-[9px] font-medium text-slate-500 ml-1">
                  Amount: {formatCurrency(amount)}
                </p>
              )}
            </div>

            {/* Remarks Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Remarks (Optional)
              </label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for advance payment..."
                className="min-h-[100px] rounded-2xl border-none bg-slate-50 p-4 text-xs font-medium resize-none focus-visible:ring-2 focus-visible:ring-blue-600"
                maxLength={200}
              />
              <div className="flex justify-between">
                <span className="text-[8px] font-medium text-slate-400">
                  Max 200 characters
                </span>
                <span className="text-[8px] font-medium text-slate-400">
                  {remarks.length}/200
                </span>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 rounded-2xl flex gap-3 items-start border border-blue-100">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[10px] text-blue-700 font-bold leading-relaxed">
                <p className="font-black uppercase tracking-wider">
                  Credit Balance
                </p>
                <p className="mt-1 text-blue-600/80 font-medium">
                  Advance payments will be added to student's credit balance and
                  can be applied to future months automatically or manually.
                </p>
              </div>
            </div>

            {/* Warning if no student selected */}
            {!selectedStudent && (
              <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 items-start border border-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 font-bold">
                  Please select a student to add advance
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-white">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="flex-1 rounded-2xl font-black text-slate-400 text-[10px] uppercase tracking-widest h-12 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  addAdvanceMutation.isPending ||
                  !selectedStudent ||
                  amount <= 0
                }
                className="flex-[2] rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white h-12 shadow-xl shadow-blue-100 uppercase tracking-[0.2em] text-[10px] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addAdvanceMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Advance
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAdvanceModal;
