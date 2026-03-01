import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Search, 
  MessageSquare,
  ShieldCheck,
  UserCheck,
  SearchCode
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "@/api/studentsAdminApi";
import { chatApi } from "../chat/api/chatApi";
import { useSessionStore } from "@/stores/sessionStore";
import { format } from "date-fns";
import { useMemo } from "react";

const AdminSocialHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("connections");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { userId } = useSessionStore();

  // Queries
  const { data: conversations, isLoading: loadingConfs } = useQuery({
    queryKey: ["chat", "conversations", "admin"],
    queryFn: () => chatApi.getConversations(),
  });

  const { data: directory, isLoading: searchingPeers } = useQuery({
    queryKey: ["admin", "students", "search", searchQuery],
    queryFn: () => getStudents({ search: searchQuery }),
    enabled: activeTab === "directory" && searchQuery.length > 2,
  });

  const students = useMemo(() => {
    const resp = directory as any;
    if (resp?.data?.students && Array.isArray(resp.data.students)) return resp.data.students;
    if (resp?.students && Array.isArray(resp.students)) return resp.students;
    if (Array.isArray(resp)) return resp;
    return [];
  }, [directory]);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <Users size={20} />
             </div>
             <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
               Social <span className="text-blue-600">Command</span>
             </h1>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Communication Hub • {conversations?.length || 0} Active Signals
          </p>
        </div>

        <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 border-slate-200 gap-2 hover:bg-slate-50">
           <ShieldCheck size={14} className="text-blue-600" />
           Security Managed
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-11 sm:h-12 border border-slate-200/50 flex">
          <TabsTrigger 
            value="connections"
            className="flex-1 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            My Connections
          </TabsTrigger>
          <TabsTrigger 
            value="directory"
            className="flex-1 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
          >
            Student Directory
          </TabsTrigger>
        </TabsList>

        {/* --- CONNECTIONS TAB --- */}
        <TabsContent value="connections" className="space-y-4">
           {loadingConfs ? (
             <div className="grid gap-3">
                {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />)}
             </div>
           ) : conversations && conversations.length > 0 ? (
             <div className="grid gap-3">
                {conversations.map((conv: any) => {
                  const participant = conv.participants.find((p: any) => p.participantId !== userId);
                  if (!participant) return null;

                  return (
                    <Card key={conv._id} className="group overflow-hidden rounded-[24px] border-none shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-5 sm:p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          {participant.profilePicture ? (
                            <img 
                              src={participant.profilePicture} 
                              alt="" 
                              className="h-12 w-12 rounded-2xl object-cover border border-slate-100" 
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {participant.name?.[0] || "?"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-black text-slate-900 text-sm uppercase italic truncate flex items-center gap-2">
                              {participant.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-slate-100 bg-slate-50 text-slate-400">
                                Last Activity: {format(new Date(conv.lastMessageAt), "MMM d, HH:mm")}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-12 w-12 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={() => navigate(`/admin/chat/${conv._id}`)}
                        >
                          <MessageSquare size={20} />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
             </div>
           ) : (
             <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center px-6">
                <div className="h-20 w-20 rounded-[32px] bg-white flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                   <MessageSquare size={32} />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">No Active Signals</h2>
                <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest max-w-[240px]">
                  You haven't initiated any secure chats yet. Search the directory to connect.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-xl font-black text-[10px] uppercase tracking-widest px-8 border-slate-200 h-10"
                  onClick={() => setActiveTab("directory")}
                >
                  Explore Directory
                </Button>
             </div>
           )}
        </TabsContent>

        {/* --- DIRECTORY TAB --- */}
        <TabsContent value="directory" className="space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name or Library ID..."
                className="w-full h-14 bg-white border border-slate-100 rounded-[22px] pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all shadow-sm"
              />
           </div>

           {searchingPeers ? (
             <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
             </div>
           ) : students && students.length > 0 ? (
             <div className="grid gap-3">
                {students.map((student: any) => (
                  <Card key={student._id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
                     <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold shrink-0">
                              {student.name?.[0] || "?"}
                           </div>
                           <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-900 uppercase italic truncate">{student.name}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <Badge variant="secondary" className="bg-slate-50 text-[7px] font-black text-slate-400 border-none px-1.5 h-3.5">
                                    {student.libraryId}
                                 </Badge>
                                 <Badge variant="outline" className="text-[7px] font-black text-blue-600 border-blue-50 bg-blue-50/30 px-1.5 h-3.5 italic uppercase">
                                    {student.slotName}
                                 </Badge>
                              </div>
                           </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                           <Button 
                             size="sm" 
                             variant="outline"
                             className="h-8 rounded-lg border-slate-200 font-black text-[9px] uppercase tracking-widest gap-2 hover:bg-slate-50"
                             onClick={() => {
                               navigate(`/admin/chat?userId=${student._id}&userType=Student`);
                             }}
                           >
                              <MessageSquare size={12} className="text-blue-600" />
                              Message
                           </Button>
                           
                           <div className="flex items-center gap-1.5 px-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">
                                 Connection Ready
                              </span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
                ))}
             </div>
           ) : searchQuery.length > 2 ? (
             <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-100 italic text-slate-400 text-xs font-medium">
                No students matching "{searchQuery}"
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50 space-y-3">
                   <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <SearchCode size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase italic">Intelligence directory</h3>
                   <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">Access the student registry and initiate encrypted communication tunnels directly.</p>
                </div>
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3">
                   <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                      <UserCheck size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase italic">Admin Authority</h3>
                   <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">Standard secure communication is enforced. Messages are stored securely on the server.</p>
                </div>
             </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSocialHubPage;
