import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminProfile } from "../../auth/api/profileApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { ShieldCheck, Mail, User, Loader2 } from "lucide-react";

const AdminProfilePage: React.FC = () => {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["admin", "profile"],
    queryFn: fetchAdminProfile,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <div className="p-1.5 bg-blue-50 rounded-lg ring-1 ring-blue-100">
              <ShieldCheck size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              System Identity
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            My Registry
          </h1>
          <p className="text-slate-500 font-medium">
            Manage your administrative profile and credentials.
          </p>
        </div>

      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white ring-1 ring-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-8">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg mb-4">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback className="bg-blue-600 text-white text-2xl font-black">
                  {profile.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {profile.name}
              </h2>
              <Badge className="mt-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 uppercase tracking-wider text-[10px] px-3 py-1 h-6">
                {profile.role || "Administrator"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2.5 bg-white rounded-xl text-slate-400 shadow-sm">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="font-bold text-slate-700">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="p-2.5 bg-white rounded-xl text-slate-400 shadow-sm">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Role ID
                  </p>
                  <p className="font-bold text-slate-700">{profile._id}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status Card (Placeholder for future stats) */}
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden bg-white ring-1 ring-slate-200">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Your current administrative session details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-4">
               <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
               <div>
                  <p className="text-emerald-700 font-bold text-sm">Active Session</p>
                  <p className="text-emerald-600/80 text-xs">Connected to secure node</p>
               </div>
            </div>

             <div className="space-y-4 pt-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-lg py-1.5 px-3">Student Management</Badge>
                    <Badge variant="outline" className="rounded-lg py-1.5 px-3">Fee Controls</Badge>
                    <Badge variant="outline" className="rounded-lg py-1.5 px-3">System Settings</Badge>
                    <Badge variant="outline" className="rounded-lg py-1.5 px-3">Audit Logs</Badge>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfilePage;
