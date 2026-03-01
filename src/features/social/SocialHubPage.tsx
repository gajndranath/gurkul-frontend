import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  MessageSquare,
  Trash2,
  Inbox,
  UserCheck,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi, type Peer, type SocialFriend } from "./api/socialApi";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";

const SocialHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: friends, isLoading: loadingFriends } = useQuery({
    queryKey: ["social", "friends"],
    queryFn: socialApi.getFriends,
  });

  const { data: requests, isLoading: loadingRequests } = useQuery({
    queryKey: ["social", "requests"],
    queryFn: socialApi.getRequests,
  });

  const { data: peersData, isLoading: searchingPeers } = useQuery({
    queryKey: ["social", "search", searchQuery],
    queryFn: () => socialApi.searchPeers({ search: searchQuery }),
    enabled: searchQuery.length > 2,
  });

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: (id: string) => socialApi.sendRequest(id),
    onSuccess: () => {
      success("Request Sent", "Your pulse signal has been broadcasted.");
      queryClient.invalidateQueries({ queryKey: ["social"] });
    },
    onError: (err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : "Could not broadcast pulse.";
      error("Signal Failed", errorMsg);
    }
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "reject" }) => 
      socialApi.respondRequest(id, action),
    onSuccess: (_, variables) => {
      success(
        variables.action === "accept" ? "Connection Bonded" : "Request Declined",
        variables.action === "accept" ? "You are now connected." : "Signal dropped." 
      );
      queryClient.invalidateQueries({ queryKey: ["social"] });
    },
    onError: (err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : "Transaction interrupted.";
      error("Action Failed", errorMsg);
    }
  });

  const removeFriendMutation = useMutation({
    mutationFn: (id: string) => socialApi.removeFriend(id),
    onSuccess: () => {
      success("Connection Severed", "Student removed from your circle.");
      queryClient.invalidateQueries({ queryKey: ["social"] });
    },
    onError: (err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : "Could not remove student.";
      error("Severing Failed", errorMsg);
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                <Users size={20} />
             </div>
             <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Social <span className="text-blue-600">Hub</span></h1>
          </div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Connect with peers • {friends?.length || 0} Established Bonds
          </p>
        </div>

        <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-10 border-slate-200 gap-2 hover:bg-slate-50">
           <ShieldCheck size={14} className="text-blue-600" />
           Privacy Control
        </Button>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-11 sm:h-12 border border-slate-200/50 flex overflow-x-auto no-scrollbar">
          <TabsTrigger 
            value="friends"
            className="rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-6"
          >
            My Friends
          </TabsTrigger>
          <TabsTrigger 
            value="requests"
            className="rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-6"
          >
            Requests {(requests?.incoming?.length || 0) > 0 && (
              <Badge className="ml-2 bg-blue-600 h-4 px-1 text-[8px] animate-pulse">
                {requests?.incoming?.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="find"
            className="rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-6"
          >
            Find Peers
          </TabsTrigger>
        </TabsList>

        {/* --- FRIENDS TAB --- */}
        <TabsContent value="friends" className="space-y-4">
           {loadingFriends ? (
             <div className="grid gap-3">
                {[1, 2].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-3xl" />)}
             </div>
           ) : friends && friends.length > 0 ? (
             <div className="grid gap-3">
                {friends.map((friend: SocialFriend) => (
                  <Card key={friend._id} className="group overflow-hidden rounded-[24px] border-none shadow-sm hover:shadow-md transition-all">
                     <CardContent className="p-5 sm:p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                           <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">
                              {friend.name?.[0] || "?"}
                           </div>
                           <div className="min-w-0">
                              <h4 className="font-black text-slate-900 text-sm uppercase italic truncate">{friend.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{friend.libraryId}</p>
                              <div className="flex items-center gap-2 mt-1">
                               <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest border-slate-100 bg-slate-50 text-slate-400">
                                    {friend.userType === "Admin" ? "Permanent" : `Bonded ${friend.bondedAt ? format(new Date(friend.bondedAt), "MMM yyyy") : "N/A"}`}
                                 </Badge>
                                 {friend.userType === "Admin" && (
                                   <Badge className="bg-slate-900 text-white border-none text-[7px] font-black uppercase tracking-widest h-3.5 italic">
                                      Management
                                   </Badge>
                                 )}
                               </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <Button 
                             size="icon" 
                             variant="ghost" 
                             className="h-10 w-10 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                             onClick={() => {
                               // We'll let the chat page handle conversation creation/lookup
                               // Redirecting to chat with studentId and userType as query params
                               navigate(`/student/chat?userId=${friend._id}&userType=${friend.userType || 'Student'}`); 
                             }}
                           >
                              <MessageSquare size={18} />
                           </Button>
                           {friend.userType !== "Admin" && (
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                               onClick={() => removeFriendMutation.mutate(friend._id)}
                             >
                                <Trash2 size={18} />
                             </Button>
                           )}
                        </div>
                     </CardContent>
                  </Card>
                ))}
             </div>
           ) : (
             <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center px-6">
                <div className="h-20 w-20 rounded-[32px] bg-white flex items-center justify-center text-slate-200 mb-6 shadow-sm">
                   <Users size={32} />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Your circle is quiet</h2>
                <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest max-w-[240px]">Connect with other students in your slot to share notes or coordinate study sessions.</p>
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-xl font-black text-[10px] uppercase tracking-widest px-8 border-slate-200 h-10"
                  onClick={() => setActiveTab("find")}
                >
                  Discover Peers
                </Button>
             </div>
           )}
        </TabsContent>

        {/* --- REQUESTS TAB --- */}
        <TabsContent value="requests" className="space-y-8">
           {/* Incoming */}
           <section className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incoming Signals</h3>
                 <div className="h-px flex-1 bg-slate-100" />
              </div>
              
              {loadingRequests ? (
                <div className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
              ) : requests?.incoming && requests.incoming.length > 0 ? (
                <div className="grid gap-3">
                   {requests.incoming.map((req) => (
                     <Card key={req._id} className="rounded-2xl border-none shadow-sm bg-blue-50/30">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-bold text-blue-600 shadow-sm">
                                 {req.requesterId?.name?.[0] || "?"}
                              </div>
                              <div>
                                 <h4 className="text-xs font-black text-slate-900 uppercase italic">{req.requesterId?.name}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase">Wants to connect</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 font-black text-[9px] uppercase tracking-widest"
                                onClick={() => respondMutation.mutate({ id: req._id, action: "accept" })}
                              >
                                 Accept
                              </Button>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-600"
                                onClick={() => respondMutation.mutate({ id: req._id, action: "reject" })}
                              >
                                 <X size={14} />
                              </Button>
                           </div>
                        </CardContent>
                     </Card>
                   ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No incoming connection requests</p>
                </div>
              )}
           </section>

           {/* Outgoing */}
           <section className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                 <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent Signals</h3>
                 <div className="h-px flex-1 bg-slate-100" />
              </div>

              {requests?.outgoing && requests.outgoing.length > 0 ? (
                <div className="grid gap-3">
                   {requests.outgoing.map((req) => (
                     <Card key={req._id} className="rounded-2xl border-none shadow-sm opacity-70">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                                 {req.recipientId?.name?.[0] || "?"}
                              </div>
                              <div>
                                 <h4 className="text-xs font-black text-slate-900 uppercase italic">{req.recipientId?.name}</h4>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Signal Broadcasting...</p>
                              </div>
                           </div>
                           <Badge variant="secondary" className="bg-slate-100 text-[8px] font-black uppercase text-slate-400">PENDING</Badge>
                        </CardContent>
                     </Card>
                   ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">You haven't sent any requests</p>
                </div>
              )}
           </section>
        </TabsContent>

        {/* --- DISCOVERY TAB --- */}
        <TabsContent value="find" className="space-y-6">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search peers by name or Library ID..."
                className="w-full h-14 bg-white border border-slate-100 rounded-[22px] pl-14 pr-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all shadow-sm"
              />
           </div>

           {searchingPeers ? (
             <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
             </div>
           ) : peersData?.students && peersData.students.length > 0 ? (
             <div className="grid gap-3">
                {peersData.students.map((peer: Peer) => {
                  const isFriend = friends?.some(f => f._id === peer._id);
                  const isIncoming = requests?.incoming?.some(r => r.requesterId?._id === peer._id);
                  const isOutgoing = requests?.outgoing?.some(r => r.recipientId?._id === peer._id);

                  return (
                    <Card key={peer._id} className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
                       <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                             <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold shrink-0">
                                {peer.name?.[0] || "?"}
                             </div>
                             <div className="min-w-0">
                                <h4 className="text-xs font-black text-slate-900 uppercase italic truncate">{peer.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <Badge variant="secondary" className="bg-slate-50 text-[7px] font-black text-slate-400 border-none px-1.5 h-3.5">
                                      {peer.libraryId}
                                   </Badge>
                                   <Badge variant="outline" className="text-[7px] font-black text-blue-600 border-blue-50 bg-blue-50/30 px-1.5 h-3.5 italic uppercase">
                                      {peer.slotName}
                                   </Badge>
                                </div>
                             </div>
                          </div>
                          
                          {isFriend ? (
                             <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[8px] uppercase tracking-widest gap-1 py-1">
                                <UserCheck size={10} /> Connected
                             </Badge>
                          ) : isOutgoing ? (
                             <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[8px] uppercase tracking-widest py-1">
                                Sent
                             </Badge>
                          ) : isIncoming ? (
                            <Button 
                              size="sm" 
                              className="h-8 rounded-lg bg-blue-600 font-black text-[9px] uppercase tracking-widest"
                              onClick={() => {
                                const req = requests?.incoming?.find(r => r.requesterId?._id === peer._id);
                                if (req) respondMutation.mutate({ id: req._id, action: "accept" });
                              }}
                            >
                               Accept
                            </Button>
                          ) : (
                             <Button 
                               size="sm" 
                               variant="outline"
                               className="h-8 rounded-lg border-slate-200 font-black text-[9px] uppercase tracking-widest gap-2 hover:bg-slate-50"
                               onClick={() => sendRequestMutation.mutate(peer._id)}
                               disabled={sendRequestMutation.isPending}
                             >
                                <UserPlus size={12} className="text-blue-600" />
                                Connect
                             </Button>
                          )}
                       </CardContent>
                    </Card>
                  );
                })}
             </div>
           ) : searchQuery.length > 2 ? (
             <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-100 italic text-slate-400 text-xs font-medium">
                No active students matching "{searchQuery}"
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50 space-y-3">
                   <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Search size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase italic">Peer Discovery</h3>
                   <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">Search for peers by their unique Library ID or name. Respects privacy settings.</p>
                </div>
                <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-3">
                   <div className="h-10 w-10 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                      <Inbox size={20} />
                   </div>
                   <h3 className="text-sm font-black text-slate-900 uppercase italic">Pending Requests</h3>
                   <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight">Manage incoming signals from students who wish to share study resources.</p>
                </div>
             </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialHubPage;
