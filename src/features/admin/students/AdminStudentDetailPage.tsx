import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Armchair,
  IndianRupee,
  Archive,
  RefreshCcw,
  Info,
  History,
  Wallet,
  ShieldAlert,
  Download,
  User,
  CheckCircle2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui";

import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../../components/ui/tabs";
import { useToast } from "../../../hooks/useToast";
import {
  getStudent,
  updateStudent as updateStudentApi,
  archiveStudent,
  reactivateStudent,
} from "../../../api/studentsAdminApi";
import StudentFeeLedgerWidget from "../fees/widgets/StudentFeeLedgerWidget";
import type { SingleStudentResponse } from "./types";
import ReminderHistory from "../fees/components/ReminderHistory";

const AdminStudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [archiveDialog, setArchiveDialog] = useState(false);
  const [reactivateDialog, setReactivateDialog] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<SingleStudentResponse>({
    queryKey: ["student", studentId],
    queryFn: async () => {
      const data = await getStudent(studentId!);
      return data as unknown as SingleStudentResponse;
    },
    enabled: !!studentId,
  });

  const archiveMutation = useMutation({
    mutationFn: (reason: string) => archiveStudent(studentId!, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      toast.success("Student archived successfully");
      setArchiveDialog(false);
      navigate("/admin/students");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: () => reactivateStudent(studentId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      toast.success("Student reactivated");
      setReactivateDialog(false);
    },
  });

  // State for editing status and verification fields (must be before early returns)
  const [editFields, setEditFields] = React.useState({
    status: undefined as "ACTIVE" | "INACTIVE" | "ARCHIVED" | undefined,
    emailVerified: false,
    phoneVerified: false,
  });
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  // Update editFields when student data loads - only if not already editing/saving
  React.useEffect(() => {
    if (response?.data?.student && !saving) {
      setEditFields({
        status: response.data.student.status,
        emailVerified: response.data.student.emailVerified ?? false,
        phoneVerified: response.data.student.phoneVerified ?? false,
      });
    }
  }, [response?.data?.student, saving]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8fafc]">
        <RefreshCcw className="h-10 w-10 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (isError || !response?.data) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[32px] p-8 text-center bg-white">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Record Not Found
          </h2>
          <p className="text-slate-500 mt-2 mb-8">
            The student ID might be incorrect or the record was permanently
            deleted.
          </p>
          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl py-6 font-bold"
            onClick={() => navigate("/admin/students")}
          >
            Return to Directory
          </Button>
        </Card>
      </div>
    );
  }

  const { student, feeSummary } = response.data;
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Handler to update student fields
  const handleFieldChange = (
    field: "status" | "emailVerified" | "phoneVerified",
    value: string | boolean,
  ) => {
    if (field === "status") {
      setEditFields((prev) => ({
        ...prev,
        status: value as "ACTIVE" | "INACTIVE" | "ARCHIVED",
      }));
    } else if (field === "emailVerified") {
      setEditFields((prev) => ({ ...prev, emailVerified: value as boolean }));
    } else if (field === "phoneVerified") {
      setEditFields((prev) => ({ ...prev, phoneVerified: value as boolean }));
    }
  };


  // Save handler (calls backend API)
  const handleSave = async () => {
    if (!studentId) return;
    setSaving(true);
    setSaved(false);
    try {
      await updateStudentApi(studentId, {
        status: editFields.status,
        emailVerified: editFields.emailVerified,
        phoneVerified: editFields.phoneVerified,
      });
      toast.success("Student updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      const errMsg = (error as Error)?.message || "Failed to update student";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        {/* --- REFINED TOP BAR --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/students")}
              className="group flex items-center justify-center h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-transform group-hover:-translate-x-0.5" />
            </button>

            <div>
              <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                <span
                  className="hover:text-slate-600 cursor-pointer transition-colors"
                  onClick={() => navigate("/admin/students")}
                >
                  Directory
                </span>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600">Student Profile</span>
              </nav>
              <h2 className="text-sm font-medium text-slate-500">
                Ref:{" "}
                <span className="text-slate-900 font-mono tracking-tight">
                  {studentId?.slice(-8).toUpperCase()}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex rounded-xl bg-white border-slate-200 text-slate-500 hover:text-blue-600 h-10 w-10 shadow-sm transition-all"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["student", studentId],
                })
              }
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>

            {student.status === "ARCHIVED" ? (
              <Button
                className="flex-1 sm:flex-none h-10 rounded-xl px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm shadow-blue-100 gap-2 transition-all"
                onClick={() => setReactivateDialog(true)}
              >
                <RefreshCcw className="h-4 w-4" /> Reactivate Profile
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 sm:flex-none h-10 rounded-xl px-5 border-slate-200 bg-white text-slate-700 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 shadow-sm gap-2 transition-all"
                onClick={() => setArchiveDialog(true)}
              >
                <Archive className="h-4 w-4 text-red-500" /> Archive
              </Button>
            )}
          </div>
        </div>

        {/* --- HERO HEADER --- */}
        {/* --- MINIMALIST PROFILE HEADER --- */}
        <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-sm">
          <div className="p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar with Soft Glow */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-[28px] blur opacity-10 group-hover:opacity-25 transition duration-500" />
                <Avatar className="h-32 w-32 rounded-[24px] border-2 border-white shadow-sm relative">
                  <AvatarFallback className="bg-slate-50 text-slate-900 text-4xl font-bold rounded-[22px]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4 text-center md:text-left">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                      {student.name}
                    </h1>
                    {/* Status Dropdown */}
                    <select
                      className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm bg-white"
                      value={editFields.status}
                      onChange={(e) =>
                        handleFieldChange("status", e.target.value)
                      }
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                    {/* Email/Phone Verified Checkboxes */}
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={editFields.emailVerified}
                          onChange={(e) =>
                            handleFieldChange("emailVerified", e.target.checked)
                          }
                        />
                        Email Verified
                      </label>
                      <label className="flex items-center gap-1 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={editFields.phoneVerified}
                          onChange={(e) =>
                            handleFieldChange("phoneVerified", e.target.checked)
                          }
                        />
                        Phone Verified
                      </label>
                    </div>
                    {/* Save Button */}
                    <div className="mt-2">
                      <Button
                        className={`${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 flex items-center gap-2`}
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <RefreshCcw className="h-3 w-3 animate-spin" />
                            Saving...
                          </>
                        ) : saved ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            Saved!
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-slate-500 font-medium text-sm md:text-base">
                    Enrollment ID:{" "}
                    <span className="text-slate-900 font-semibold uppercase">
                      {studentId?.slice(-10)}
                    </span>
                  </p>
                </div>

                {/* Info Grid */}
                <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                        Email Address
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-indigo-50">
                      <Phone className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                        Phone Number
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {student.phone || "Not linked"}
                      </p>
                    </div>
                  </div>

                  <div className="hidden xl:flex items-center gap-3">
                    <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100">
                      <History className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                        Last Update
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        Today
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle Footer Bar */}
          <div className="bg-slate-50/80 border-t border-slate-100 px-10 py-3 hidden md:flex items-center justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                MEMBER SINCE JAN 2026
              </div>
            </div>
            <div className="flex gap-2">
              {/* Small secondary actions could go here */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm border-none ring-1 ring-slate-200 rounded-[28px] bg-white overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" /> Allocation Detail
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Armchair className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">
                      Assigned Seat
                    </span>
                  </div>
                  <span className="font-black text-xl text-slate-900">
                    {student.seatNumber || "—"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50 ring-1 ring-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <IndianRupee className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-600">
                      Monthly Plan
                    </span>
                  </div>
                  <span className="font-black text-xl text-slate-900">
                    ₹{student.monthlyFee}
                  </span>
                </div>

                <Separator className="my-2 opacity-60" />

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="p-2.5 bg-blue-50 rounded-xl h-fit">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Residential Address
                      </p>
                      <p className="text-sm leading-relaxed font-semibold text-slate-700">
                        {student.address || "No address on file."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="p-2.5 bg-blue-50 rounded-xl h-fit">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Parent / Guardian
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {student.fatherName || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="lg:col-span-8 space-y-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* --- POLISHED SEGMENTED CONTROL --- */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                {/* Tabs Container: Full width on mobile, auto width on desktop */}
                <TabsList
                  className="
    grid grid-cols-4 w-full /* Mobile: 3 equal columns */
    sm:flex sm:w-auto /* Desktop: Back to flex */
    bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 backdrop-blur-sm 
    h-auto /* Ensures list grows with content */
  "
                >
                  <TabsTrigger
                    value="overview"
                    className="
        rounded-xl py-2.5 
        px-2 sm:px-6 /* Tight padding on mobile, generous on desktop */
        text-[10px] sm:text-xs /* Smaller text on tiny screens */
        font-black uppercase tracking-widest transition-all
        data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md 
        data-[state=inactive]:text-slate-400
      "
                  >
                    Overview
                  </TabsTrigger>

                  <TabsTrigger
                    value="fees"
                    className="
        rounded-xl py-2.5 px-2 sm:px-6 
        text-[10px] sm:text-xs 
        font-black uppercase tracking-widest transition-all
        data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md 
        data-[state=inactive]:text-slate-400
      "
                  >
                    {/* Shortened label for mobile UX */}
                    <span className="sm:hidden">Fees</span>
                    <span className="hidden sm:inline">Fees & Ledger</span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="details"
                    className="
        rounded-xl py-2.5 px-2 sm:px-6 
        text-[10px] sm:text-xs 
        font-black uppercase tracking-widest transition-all
        data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md 
        data-[state=inactive]:text-slate-400
      "
                  >
                    Activity
                  </TabsTrigger>

                  <TabsTrigger
                    value="history"
                    className="
        rounded-xl py-2.5 
        px-2 sm:px-6 /* Tight padding on mobile, generous on desktop */
        text-[10px] sm:text-xs /* Smaller text on tiny screens */
        font-black uppercase tracking-widest transition-all
        data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md 
        data-[state=inactive]:text-slate-400
      "
                  >
                    <span className="sm:hidden">History</span>
                    <span className="hidden sm:inline">Reminder History</span>
                  </TabsTrigger>
                </TabsList>

                {/* Status indicator: Pushed below tabs on mobile */}
                <div className="flex items-center gap-2 px-1 sm:px-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
                    Node: Live Financial Sync
                  </span>
                </div>
              </div>

              <TabsContent
                value="overview"
                className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500 outline-none"
              >
                {/* --- REFINED FINANCIAL STATS (Clean monochrome depth) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    {
                      label: "Total Paid",
                      val: feeSummary?.totals?.totalPaid || 0,
                      color: "text-emerald-600",
                      bg: "bg-emerald-50/50",
                    },
                    {
                      label: "Total Due",
                      val: feeSummary?.totals?.totalDue || 0,
                      color: "text-rose-600",
                      bg: "bg-rose-50/50",
                    },
                    {
                      label: "Pending",
                      val: feeSummary?.totals?.totalPending || 0,
                      color: "text-amber-600",
                      bg: "bg-amber-50/50",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="group relative bg-white border border-slate-200 rounded-[24px] p-6 transition-all hover:shadow-md hover:border-slate-300"
                    >
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
                        {item.label}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-400">
                          ₹
                        </span>
                        <p className="text-3xl font-black text-slate-900 tracking-tighter">
                          {item.val.toLocaleString()}
                        </p>
                      </div>
                      {/* Minimalist Progress Indicator */}
                      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color.replace("text", "bg")}`}
                          style={{ width: "60%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- POLISHED DATA TABLE / HISTORY --- */}
                <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/30 px-8 py-5">
                    <div>
                      <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-700">
                        Recent Transactions
                      </CardTitle>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">
                        Auto-generated billing history
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold text-xs gap-2 bg-white border-slate-200 h-9"
                    >
                      <Download className="h-3 w-3" /> Export
                    </Button>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* If you have transaction data, map a table here. Otherwise, use this high-end placeholder */}
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-blue-100 rounded-full blur-2xl opacity-30" />
                        <div className="relative h-16 w-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                          <Wallet className="h-7 w-7 text-slate-300" />
                        </div>
                      </div>
                      <h3 className="text-slate-900 font-bold">
                        No Transaction Data
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 max-w-[240px] text-center leading-relaxed">
                        Once payments are processed, the ledger will appear here
                        automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* NEW CHANGE: INTEGRATED FEES TAB CONTENT */}
              <TabsContent value="fees" className="outline-none">
                {/* This widget handles all month-by-month financial logic */}

                <StudentFeeLedgerWidget studentId={studentId!} />
              </TabsContent>
              <TabsContent value="details" className="outline-none">
                <div className="bg-white border border-slate-200 rounded-[24px] p-12 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-top-2">
                  <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                    <History className="h-8 w-8 text-slate-200" />
                  </div>
                  <h3 className="font-black text-slate-900 uppercase tracking-widest text-sm">
                    Log Empty
                  </h3>
                  <p className="text-slate-400 text-xs mt-2 max-w-[280px]">
                    There are currently no administrative events or status
                    changes recorded for this profile.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="history" className="outline-none">
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  <ReminderHistory studentId={studentId} limit={50} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION DIALOGS --- */}
      <Dialog open={archiveDialog} onOpenChange={setArchiveDialog}>
        <DialogContent className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center mb-6">
              <Archive className="h-10 w-10 text-red-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">
                Archive Profile?
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-3 text-base leading-relaxed">
                This will move <strong>{student.name}</strong> to the archive
                and release seat <strong>{student.seatNumber || "N/A"}</strong>.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl font-bold h-12"
              onClick={() => setArchiveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-xl font-bold h-12 shadow-lg shadow-red-100"
              onClick={() => archiveMutation.mutate("Admin request")}
            >
              {archiveMutation.isPending ? "Archiving..." : "Yes, Archive"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reactivateDialog} onOpenChange={setReactivateDialog}>
        <DialogContent className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <RefreshCcw className="h-10 w-10 text-blue-600" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">
                Reactivate Student
              </DialogTitle>
              <DialogDescription className="text-slate-500 mt-3 text-base leading-relaxed">
                Confirming this will restore <strong>{student.name}</strong> to
                the active list. You'll need to re-assign a seat manually.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl font-bold h-12"
              onClick={() => setReactivateDialog(false)}
            >
              Discard
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold h-12 shadow-lg shadow-blue-100"
              onClick={() => reactivateMutation.mutate()}
            >
              {reactivateMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudentDetailPage;
