import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Send, History } from "lucide-react";
import { toast } from "sonner";

export const AdminAnnouncementManager = () => {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [scope, setScope] = useState("ALL_STUDENTS");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [selectedRoom, setSelectedRoom] = useState("");

    const { data: slots } = useQuery({
        queryKey: ["slots"],
        queryFn: async () => {
            const res = await axiosInstance.get("/slots");
            return res.data.data;
        }
    });

    const { data: rooms } = useQuery({
        queryKey: ["rooms"],
        queryFn: async () => {
            const res = await axiosInstance.get("/rooms");
            return res.data.data;
        }
    });

    const { data: history } = useQuery({
        queryKey: ["adminAnnouncements"],
        queryFn: async () => {
            const res = await axiosInstance.get("/announcements");
            return res.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (payload: any) => {
            return axiosInstance.post("/announcements", payload);
        },
        onSuccess: () => {
            toast.success("Signal Broadcasted", {
                description: `Successfully transmitted "${title}" to target scope.`,
                duration: 5000,
            });
            setTitle("");
            setBody("");
            setSelectedSlot("");
            setSelectedRoom("");
            queryClient.invalidateQueries({ queryKey: ["adminAnnouncements"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to broadcast signal");
        }
    });

    const handleSend = () => {
        if (!body) {
            return toast.error("Message body is required");
        }

        const finalTitle = title.trim() || "Official Signal";
        
        if (scope === "SLOT" && !selectedSlot) {
            return toast.error("Please select a slot");
        }
        if (scope === "ROOM" && !selectedRoom) {
            return toast.error("Please select a room");
        }

        createMutation.mutate({
            title: finalTitle,
            body,
            targetScope: scope,
            slotId: scope === "SLOT" ? selectedSlot : undefined,
            roomId: scope === "ROOM" ? selectedRoom : undefined
        });
    };

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight italic uppercase flex items-center gap-3">
                        <Megaphone className="text-blue-600" size={32} />
                        Command <span className="text-blue-600">Broadcast</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                        Send priority signals to student terminals
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Composer */}
                <Card className="lg:col-span-2 border border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                             Compose Signal
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Signal Header</label>
                            <Input 
                                placeholder="E.g. Schedule Update, New Resources..." 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-white border-slate-200 font-semibold text-sm h-11 focus-visible:ring-blue-500 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Scope</label>
                                <Select value={scope} onValueChange={(val) => {
                                    setScope(val);
                                    setSelectedSlot("");
                                    setSelectedRoom("");
                                }}>
                                    <SelectTrigger className="bg-white border-slate-200 font-semibold text-sm h-11 focus:ring-blue-500 rounded-xl px-4">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL_STUDENTS">Global (All Students)</SelectItem>
                                        <SelectItem value="SLOT">Specific Slot</SelectItem>
                                        <SelectItem value="ROOM">Specific Room</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {scope === "SLOT" && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Slot</label>
                                    <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                                    <SelectTrigger className="bg-white border-slate-200 font-semibold text-sm h-11 focus:ring-blue-500 rounded-xl px-4">
                                        <SelectValue placeholder="Target Slot" />
                                    </SelectTrigger>
                                        <SelectContent>
                                            {slots?.map((slot: any) => (
                                                <SelectItem key={slot._id} value={slot._id}>
                                                    {slot.name} ({slot.timeRange?.start})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {scope === "ROOM" && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select Room</label>
                                    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                                    <SelectTrigger className="bg-white border-slate-200 font-semibold text-sm h-11 focus:ring-blue-500 rounded-xl px-4">
                                        <SelectValue placeholder="Target Room" />
                                    </SelectTrigger>
                                        <SelectContent>
                                            {rooms?.map((room: any) => (
                                                <SelectItem key={room._id} value={room._id}>
                                                    {room.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Signal Payload</label>
                            <Textarea 
                                placeholder="Enter the detailed message here..." 
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="bg-white border-slate-200 font-medium text-sm min-h-[140px] resize-none focus-visible:ring-blue-500 rounded-xl p-4"
                            />
                        </div>

                        <Button 
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-tighter italic text-white flex gap-2"
                            onClick={handleSend}
                            disabled={createMutation.isPending}
                        >
                            <Send size={16} />
                            {createMutation.isPending ? "Broadcasting..." : "Broadcast Signal"}
                        </Button>
                    </CardContent>
                </Card>

                {/* History/Settings Sidebar */}
                <div className="space-y-6">
                    <Card className="border-none shadow-lg shadow-slate-100 bg-white">
                        <CardHeader className="p-4 border-b border-slate-50">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <History size={12} /> Broadcast History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                             <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
                                {history && history.length > 0 ? (
                                    history.map((item: any) => (
                                        <div key={item._id} className="p-4 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[8px] font-black uppercase text-blue-600 px-2 py-0.5 bg-blue-50 rounded-full tracking-tighter">
                                                    {item.targetScope}
                                                </span>
                                                <span className="text-[8px] font-bold text-slate-300 uppercase">
                                                    {new Date(item.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="text-[10px] font-black text-slate-900 uppercase truncate">{item.title}</h4>
                                            <p className="text-[9px] text-slate-500 font-medium line-clamp-2 mt-1">{item.body}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest px-4 py-8">No recent broadcasts</p>
                                    </div>
                                )}
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
