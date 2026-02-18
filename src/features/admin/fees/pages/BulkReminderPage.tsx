// frontend/src/features/admin/fees/pages/BulkReminderPage.tsx

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Send,
  Users,
  Search,
  X,
  Mail,
  Phone,
  Smartphone,
  CheckCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/useToast";
import { useDueTracking } from "../hooks/useDueTracking";
import { notificationService } from "@/features/notifications/api/notification.service";
import { formatCurrency } from "@/lib/utils";
import type { DueRecord } from "../types/fee.types";
import ReminderHistory from "../components/ReminderHistory";
type ChannelType = "email" | "sms" | "push" | "in-app";

interface SelectedStudent {
  studentId: string;
  studentName: string;
  phone: string;
  email?: string;
  amount: number;
  daysOverdue: number;
  month: number;
  year: number;
}

const BulkReminderPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { dueRecords, isLoading } = useDueTracking();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([
    "email",
    "sms",
  ]);
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>(
    [],
  );
  const [selectAll, setSelectAll] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState(
    `Dear {student_name}, your fee payment of {amount} for {month_year} is overdue by {days} days. Please clear your dues at the earliest to avoid service interruption. Thank you.`,
  );
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState("select");

  // Filter students
  const filteredRecords = useMemo(() => {
    if (!dueRecords) return [];

    return dueRecords.filter((record) => {
      const matchesSearch =
        record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (record.studentPhone || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [dueRecords, searchQuery]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      const all = filteredRecords.map((record) => ({
        studentId: record.studentId,
        studentName: record.studentName,
        phone: record.studentPhone || "",
        email: record.studentEmail,
        amount: record.totalAmount,
        daysOverdue: record.daysOverdue,
        month: record.month,
        year: record.year,
      }));
      setSelectedStudents(all);
    }
    setSelectAll(!selectAll);
  };

  // Handle select single
  const handleSelectStudent = (record: DueRecord) => {
    const exists = selectedStudents.some(
      (s) => s.studentId === record.studentId,
    );

    if (exists) {
      setSelectedStudents(
        selectedStudents.filter((s) => s.studentId !== record.studentId),
      );
      setSelectAll(false);
    } else {
      setSelectedStudents([
        ...selectedStudents,
        {
          studentId: record.studentId,
          studentName: record.studentName,
          phone: record.studentPhone || "",
          email: record.studentEmail,
          amount: record.totalAmount,
          daysOverdue: record.daysOverdue,
          month: record.month,
          year: record.year,
        },
      ]);
    }
  };

  // Toggle channel
  const toggleChannel = (channel: ChannelType) => {
    setSelectedChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel],
    );
  };

  // Send bulk reminders
  const handleSendReminders = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Error", "Please select at least one student");
      return;
    }

    if (selectedChannels.length === 0) {
      toast.error("Error", "Please select at least one notification channel");
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Send to each selected student via each channel
      for (const student of selectedStudents) {
        for (const channel of selectedChannels) {
          try {
            // Replace placeholders
            const monthYear = `${student.month + 1}/${student.year}`;
            const personalizedMessage = messageTemplate
              .replace(/{student_name}/g, student.studentName)
              .replace(/{amount}/g, formatCurrency(student.amount))
              .replace(/{month_year}/g, monthYear)
              .replace(/{days}/g, student.daysOverdue.toString());

            await notificationService.sendToStudent({
              studentId: student.studentId,
              channel,
              title: "Fee Payment Reminder",
              message: personalizedMessage,
            });
            successCount++;
          } catch {
            failCount++;
          }
        }
      }

      toast.success(
        "Success",
        `Reminders sent: ${successCount} successful, ${failCount} failed`,
      );

      if (failCount === 0) {
        setActiveTab("success");
        setSelectedStudents([]);
        setSelectAll(false);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Template variables
  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => prev + ` {${variable}}`);
  };

  const channels: { id: ChannelType; label: string; icon: React.ReactNode }[] =
    [
      { id: "email", label: "Email", icon: <Mail className="h-4 w-4" /> },
      { id: "sms", label: "SMS", icon: <Phone className="h-4 w-4" /> },
      { id: "push", label: "Push", icon: <Smartphone className="h-4 w-4" /> },
      { id: "in-app", label: "In-App", icon: <Bell className="h-4 w-4" /> },
    ];

  if (isLoading) {
    return <BulkReminderSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 bg-[#f8fafc] min-h-screen animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin/fees/due")}
              className="h-8 w-8 rounded-lg hover:bg-amber-50"
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="p-1.5 bg-amber-50 rounded-lg">
              <Bell size={16} className="text-amber-600" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-amber-600">
              Bulk Operations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">
            Bulk Reminders
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-sm max-w-md leading-relaxed">
            Send payment reminders to multiple students at once. Select
            recipients, customize message, and send via multiple channels.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden xs:flex items-center gap-3 bg-white p-2.5 rounded-2xl ring-1 ring-slate-200 shadow-sm">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Selected
              </p>
              <p className="text-[11px] font-bold text-amber-600 flex items-center justify-end gap-1.5 mt-1">
                <Users size={14} />
                {selectedStudents.length} Students
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-100 mx-1" />
            <ShieldCheck className="text-amber-600" size={20} />
          </div>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-white p-1">
          <TabsTrigger
            value="select"
            className="rounded-xl text-[10px] font-black uppercase tracking-wider"
          >
            1. Select Students
          </TabsTrigger>
          <TabsTrigger
            value="compose"
            className="rounded-xl text-[10px] font-black uppercase tracking-wider"
          >
            2. Compose Message
          </TabsTrigger>
          <TabsTrigger
            value="success"
            className="rounded-xl text-[10px] font-black uppercase tracking-wider"
          >
            3. Confirm & Send
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="rounded-xl text-[10px] font-black uppercase tracking-wider"
          >
            3. History
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SELECT STUDENTS */}
        <TabsContent value="select" className="space-y-6 mt-6">
          <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Users size={18} className="text-amber-600" />
                Select Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-none rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-amber-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200"
                  >
                    <X className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Select All */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="selectAll"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    className="h-5 w-5 rounded-lg border-2 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                  />
                  <Label
                    htmlFor="selectAll"
                    className="text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Select All Students ({filteredRecords.length})
                  </Label>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-[9px] font-black uppercase border-amber-200 bg-amber-50 text-amber-600"
                >
                  {selectedStudents.length} Selected
                </Badge>
              </div>

              {/* Student List */}
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {filteredRecords.map((record) => {
                  const isSelected = selectedStudents.some(
                    (s) => s.studentId === record.studentId,
                  );
                  return (
                    <div
                      key={record.studentId}
                      onClick={() => handleSelectStudent(record)}
                      className={`
                        flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${
                          isSelected
                            ? "border-amber-200 bg-amber-50/50"
                            : "border-slate-100 hover:border-slate-200 bg-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          className="h-5 w-5 rounded-lg border-2 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {record.studentName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] font-medium text-slate-500">
                              ID: {record.studentId.slice(-6)}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400">
                              •
                            </span>
                            <span className="text-[9px] font-medium text-rose-600">
                              {formatCurrency(record.totalAmount)}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400">
                              •
                            </span>
                            <span className="text-[9px] font-medium text-slate-500">
                              {record.daysOverdue}d overdue
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`
                          rounded-lg px-2 py-0.5 text-[8px] font-black uppercase
                          ${record.urgency === "critical" ? "bg-rose-50 text-rose-600 border-rose-200" : ""}
                          ${record.urgency === "high" ? "bg-orange-50 text-orange-600 border-orange-200" : ""}
                          ${record.urgency === "medium" ? "bg-amber-50 text-amber-600 border-amber-200" : ""}
                        `}
                      >
                        {record.urgency}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              {/* Next Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setActiveTab("compose")}
                  disabled={selectedStudents.length === 0}
                  className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100"
                >
                  Continue to Compose ({selectedStudents.length})
                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: COMPOSE MESSAGE */}
        <TabsContent value="compose" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Message Composer */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Bell size={18} className="text-amber-600" />
                    Message Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  {/* Channel Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Notification Channels
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {channels.map((channel) => (
                        <button
                          key={channel.id}
                          type="button"
                          onClick={() => toggleChannel(channel.id)}
                          className={`
                            flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all active:scale-95 relative
                            ${
                              selectedChannels.includes(channel.id)
                                ? "border-amber-600 bg-amber-50/50 text-amber-600 shadow-sm shadow-amber-100"
                                : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                            }
                          `}
                        >
                          {channel.icon}
                          <span className="text-[9px] font-black uppercase tracking-wider">
                            {channel.label}
                          </span>
                          {selectedChannels.includes(channel.id) && (
                            <CheckCircle className="h-3 w-3 text-amber-600 absolute top-1 right-1" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Template */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Message Content
                      </label>
                      <span className="text-[8px] font-medium text-slate-400">
                        {messageTemplate.length}/500
                      </span>
                    </div>
                    <Textarea
                      value={messageTemplate}
                      onChange={(e) =>
                        setMessageTemplate(e.target.value.slice(0, 500))
                      }
                      className="min-h-[150px] rounded-2xl border-none bg-slate-50 p-4 text-xs font-medium resize-none focus-visible:ring-2 focus-visible:ring-amber-600"
                      placeholder="Enter reminder message..."
                    />
                  </div>

                  {/* Template Variables */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Insert Variables
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["student_name", "amount", "month_year", "days"].map(
                        (variable) => (
                          <Button
                            key={variable}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(variable)}
                            className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 text-[9px] font-black uppercase tracking-wider hover:bg-slate-50"
                          >
                            {`{${variable}}`}
                          </Button>
                        ),
                      )}
                    </div>
                    <p className="text-[8px] text-slate-400 mt-1">
                      Variables will be replaced with actual student data
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white sticky top-24">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  {selectedStudents.length > 0 ? (
                    <>
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2">
                          To: {selectedStudents[0].studentName}
                        </p>
                        <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                          {messageTemplate
                            .replace(
                              /{student_name}/g,
                              selectedStudents[0].studentName,
                            )
                            .replace(
                              /{amount}/g,
                              formatCurrency(selectedStudents[0].amount),
                            )
                            .replace(
                              /{month_year}/g,
                              `${selectedStudents[0].month + 1}/${selectedStudents[0].year}`,
                            )
                            .replace(
                              /{days}/g,
                              selectedStudents[0].daysOverdue.toString(),
                            )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500">
                        <Users size={12} />
                        <span>
                          + {selectedStudents.length - 1} more recipients
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-[10px] font-medium">
                      Select students to preview message
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px]">
                      <span className="font-medium text-slate-500">
                        Recipients:
                      </span>
                      <span className="font-bold text-slate-900">
                        {selectedStudents.length}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="font-medium text-slate-500">
                        Channels:
                      </span>
                      <span className="font-bold text-slate-900">
                        {selectedChannels
                          .map((c) => c.toUpperCase())
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab("select")}
              className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest"
            >
              Back to Selection
            </Button>
            <Button
              onClick={handleSendReminders}
              disabled={
                isSending ||
                selectedStudents.length === 0 ||
                selectedChannels.length === 0
              }
              className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-amber-100"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5 mr-2" />
                  Send Reminders
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* TAB 3: SUCCESS */}
        <TabsContent value="success" className="space-y-6 mt-6">
          <Card className="border-none ring-1 ring-slate-200 shadow-sm rounded-[24px] bg-white">
            <CardContent className="p-12 text-center space-y-4">
              <div className="bg-emerald-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tighter">
                Reminders Sent Successfully!
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Your bulk reminders have been queued and will be delivered to{" "}
                {selectedStudents.length} students via {selectedChannels.length}{" "}
                channels.
              </p>
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/fees/due")}
                  className="h-11 px-6 rounded-xl border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-widest"
                >
                  Back to Due Tracking
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("select");
                    setSelectedStudents([]);
                    setSelectAll(false);
                  }}
                  className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[10px] uppercase tracking-widest"
                >
                  Send More Reminders
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <ReminderHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Skeleton Loading State
const BulkReminderSkeleton = () => (
  <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-[#f8fafc] min-h-screen">
    <Skeleton className="h-20 w-full rounded-[24px]" />
    <Skeleton className="h-[600px] w-full rounded-[24px]" />
  </div>
);

export default BulkReminderPage;
