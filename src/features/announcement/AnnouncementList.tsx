import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Calendar, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export const AnnouncementList = () => {
    const { data: announcements, isLoading } = useQuery({
        queryKey: ["studentAnnouncements"],
        queryFn: async () => {
            const res = await axiosInstance.get("/student-announcements");
            return res.data.data;
        }
    });

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase flex items-center gap-3">
                        <Megaphone className="text-blue-600" size={32} />
                        Command <span className="text-blue-600">Signals</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">
                        Official announcements from HQ
                    </p>
                </div>
            </div>

            {announcements?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Megaphone className="text-slate-200" size={32} />
                    </div>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No signals received</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements?.map((item: any) => (
                        <Card key={item._id} className="border border-slate-100 shadow-sm hover:border-blue-200 transition-colors cursor-pointer group bg-white rounded-2xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                    <div className="w-full sm:w-2 h-2 sm:h-auto bg-blue-600" />
                                    <div className="p-4 sm:p-6 flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                            <span className="text-[10px] w-fit font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full tracking-widest">
                                                {item.targetScope === "ALL_STUDENTS" ? "Global" : 
                                                 item.targetScope === "SLOT" ? "Slot Specific" : 
                                                 item.targetScope === "ROOM" ? "Room Specific" : "Secret"}
                                            </span>
                                            <div className="flex flex-wrap items-center gap-3 text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    <span className="text-[10px] font-bold uppercase">{format(new Date(item.createdAt), "MMM d, yyyy")}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    <span className="text-[10px] font-bold uppercase">{format(new Date(item.createdAt), "HH:mm")}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase group-hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm font-medium mt-2 leading-relaxed">
                                            {item.body}
                                        </p>
                                    </div>
                                    <div className="p-4 sm:p-6 flex items-center justify-end sm:justify-center text-slate-200 group-hover:text-blue-600 transition-colors border-t sm:border-t-0 border-slate-50">
                                        <ChevronRight size={24} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
