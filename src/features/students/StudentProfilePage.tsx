import React from "react";
import { useSessionStore } from "../../stores/sessionStore";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Mail, Phone, MapPin, User, BookOpen } from "lucide-react";

const StudentProfilePage: React.FC = () => {
  const { student } = useSessionStore();

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        No profile data available.
      </div>
    );
  }

  const initials = student.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "S";

  const infoItems = [
    { icon: Mail, label: "Email", value: student.email },
    { icon: Phone, label: "Phone", value: student.phone || "Not provided" },
    { icon: MapPin, label: "Address", value: (student as any).address || "Not provided" },
    { icon: User, label: "Father's Name", value: (student as any).fatherName || "Not provided" },
    { icon: BookOpen, label: "Seat Number", value: (student as any).seatNumber || "Not assigned" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 space-y-6">
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
            <User size={18} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Student Profile
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
          My Profile
        </h1>
        <p className="text-slate-500 font-medium text-sm">
          Your personal and library information.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-8">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg mb-4">
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-black">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {student.name}
              </h2>
              <Badge className="mt-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200 uppercase tracking-wider text-[10px] px-3 py-1 h-6">
                {(student as any).status || "ACTIVE"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2 bg-white rounded-xl text-slate-400 shadow-sm shrink-0">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="font-bold text-slate-700 text-sm truncate">{value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Session Status */}
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white ring-1 ring-slate-200 h-fit">
          <CardContent className="p-6 space-y-4 pt-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Membership Status
            </h3>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-emerald-700 font-bold text-sm">Active Member</p>
                <p className="text-emerald-600/80 text-xs">Library access granted</p>
              </div>
            </div>
            {(student as any).monthlyFee && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Monthly Fee</p>
                <p className="text-blue-700 font-black text-2xl mt-1">
                  ₹{(student as any).monthlyFee?.toLocaleString("en-IN")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfilePage;
