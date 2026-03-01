import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bell, 
  CheckCheck, 
  RefreshCcw, 
  Filter, 
  CreditCard,
  ShieldAlert,
  Info,
  Inbox,
  Clock,
  ChevronRight
} from "lucide-react";
import { 
  notificationService, 
  type NotificationHistoryResponse 
} from "@/features/notifications/api/notification.service";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import type { AppNotification, NotificationCategory } from "@/features/notifications/types/notification.types";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { useToast } from "@/hooks/useToast";

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<string>("ALL");
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<NotificationHistoryResponse, Error>({
    queryKey: ["all-notifications", filter],
    queryFn: () => notificationService.getHistory(1, 50, filter === "UNREAD"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
      toast.success("Success", "All notifications marked as read");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-notifications"] });
    },
  });

  // Category Configuration
  const categoryConfig: Record<string, { icon: any, color: string, bg: string, label: string }> = {
    PAYMENT: { icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50", label: "Financial" },
    DUE: { icon: Clock, color: "text-rose-600", bg: "bg-rose-50", label: "Urgent" },
    SYSTEM: { icon: ShieldAlert, color: "text-blue-600", bg: "bg-blue-50", label: "System" },
    GENERAL: { icon: Info, color: "text-slate-600", bg: "bg-slate-50", label: "General" },
  };

  const getCategoryTheme = (type: NotificationCategory) => {
    if (type.startsWith("PAYMENT") || type.includes("FEE")) return categoryConfig.PAYMENT;
    if (type.includes("DUE") || type === "FEE_OVERDUE_BULK") return categoryConfig.DUE;
    if (type === "SYSTEM_ALERT" || type === "ADMIN_REMINDER") return categoryConfig.SYSTEM;
    return categoryConfig.GENERAL;
  };

  // Grouping Logic
  const groupedNotifications = useMemo(() => {
    if (!data?.notifications) return {};

    const filtered = data.notifications.filter(n => {
      if (filter === "ALL" || filter === "UNREAD") return true;
      const theme = getCategoryTheme(n.type);
      return theme.label.toUpperCase() === filter;
    });

    return filtered.reduce((acc: Record<string, AppNotification[]>, n) => {
      const date = parseISO(n.createdAt);
      let group = format(date, "MMMM dd, yyyy");
      if (isToday(date)) group = "Today";
      else if (isYesterday(date)) group = "Yesterday";
      
      if (!acc[group]) acc[group] = [];
      acc[group].push(n);
      return acc;
    }, {});
  }, [data?.notifications, filter]);

  const groupKeys = Object.keys(groupedNotifications);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-28 sm:pb-24">
      {/* 1. HEADER CENTER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shrink-0">
                <Bell size={18} className="sm:size-5" />
             </div>
             <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Communication <span className="text-blue-600">Hub</span></h1>
          </div>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            {data?.unreadCount || 0} Unread Pulse Signals • {data?.pagination?.total || 0} Total Archived
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:flex-none rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest h-9 sm:h-10 border-slate-200 hover:bg-slate-50 gap-1.5 sm:gap-2"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
            <span className="xs:inline">Sync</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex-1 sm:flex-none rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest h-9 sm:h-10 text-blue-600 hover:bg-blue-50 gap-1.5 sm:gap-2"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending || data?.unreadCount === 0}
          >
            <CheckCheck size={16} />
            <span className="xs:inline">Mark All Read</span>
          </Button>
        </div>
      </header>

      {/* 2. FILTER STRIPS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <Tabs value={filter} onValueChange={setFilter} className="w-full lg:w-auto">
          <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-10 sm:h-12 border border-slate-200/50 flex overflow-x-auto no-scrollbar justify-start">
            {["ALL", "UNREAD", "FINANCIAL", "SYSTEM", "URGENT"].map((f) => (
              <TabsTrigger 
                key={f} 
                value={f}
                className="rounded-xl font-black text-[8px] sm:text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-3 sm:px-6 shrink-0"
              >
                {f}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
           <Filter size={14} className="text-slate-400" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Density Control</span>
        </div>
      </div>

      {/* 3. GROUPED LISTS */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 w-full bg-slate-50 animate-pulse rounded-[20px] sm:rounded-[24px]" />
          ))}
        </div>
      ) : isError ? (
        <Card className="p-8 sm:p-12 border-rose-100 bg-rose-50/30 text-center rounded-[24px] sm:rounded-[32px]">
           <ShieldAlert size={40} className="mx-auto text-rose-300 mb-4 sm:size-12" />
           <p className="text-xs sm:text-sm font-black text-rose-500 uppercase italic">Signal Lost: Neural Net Disconnected</p>
           <Button variant="link" onClick={() => refetch()} className="mt-2 text-rose-600 font-bold text-xs sm:text-sm">Try Recalibrating</Button>
        </Card>
      ) : groupKeys.length > 0 ? (
        <div className="space-y-8 sm:space-y-12">
          {groupKeys.map(group => (
            <section key={group} className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-4">
                 <h3 className="text-[9px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] pl-1">{group}</h3>
                 <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent" />
              </div>

              <div className="grid gap-2.5 sm:gap-3">
                {groupedNotifications[group].map((n: AppNotification) => {
                  const theme = getCategoryTheme(n.type);
                  const Icon = theme.icon;
                  return (
                    <Card 
                      key={n._id}
                      onClick={() => !n.read && markReadMutation.mutate(n._id)}
                      className={`
                        group relative overflow-hidden transition-all duration-300 cursor-pointer rounded-[20px] sm:rounded-[24px] border-none shadow-sm hover:shadow-xl hover:translate-y-[-2px]
                        ${n.read ? "bg-white/60 opacity-80" : "bg-white ring-1 ring-blue-100 shadow-blue-50/50"}
                      `}
                    >
                      {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5 bg-blue-600" />}
                      
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-6">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl ${theme.bg} ${theme.color} flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                           <Icon size={18} className="sm:size-5" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                          <div className="flex items-center justify-between gap-2">
                             <div className="flex items-center gap-2 min-w-0">
                                <h4 className={`text-[13px] sm:text-sm tracking-tight truncate uppercase italic ${n.read ? "font-bold text-slate-600" : "font-black text-slate-900"}`}>
                                  {n.title}
                                </h4>
                                {!n.read && <Badge className="bg-blue-600 text-[7px] sm:text-[8px] font-black italic px-1 h-3.5 sm:h-4 shrink-0">NEW</Badge>}
                             </div>
                             <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase italic whitespace-nowrap shrink-0">
                                {format(parseISO(n.createdAt), "HH:mm")}
                             </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-normal sm:leading-relaxed line-clamp-2">
                             {n.message}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                             <Badge variant="outline" className={`${theme.bg} ${theme.color} border-none text-[7px] sm:text-[8px] font-black uppercase tracking-widest px-1.5 sm:px-2`}>
                                {theme.label}
                             </Badge>
                             {n.data?.studentId && (
                               <Badge variant="secondary" className="bg-slate-50 text-slate-400 text-[7px] sm:text-[8px] font-black border-none px-1.5 sm:px-2 uppercase italic">
                                  Linked
                               </Badge>
                             )}
                          </div>
                        </div>

                        <div className="hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 hover:text-blue-600 transition-colors">
                              <ChevronRight size={16} />
                           </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-24 bg-white rounded-[24px] sm:rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center px-4">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-[32px] bg-slate-50 flex items-center justify-center text-slate-200 mb-6 sm:mb-8 animate-float">
             <Inbox size={40} className="sm:size-12" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase italic tracking-tighter">Quiet Signals</h2>
          <p className="text-slate-400 text-[10px] sm:text-xs font-bold mt-2 uppercase tracking-widest max-w-[240px] sm:max-w-[280px]">No active communications are streaming through your Neural Hub.</p>
          <Button 
            variant="outline" 
            className="mt-6 sm:mt-8 rounded-xl font-black text-[10px] uppercase tracking-widest px-8 border-slate-200 h-10"
            onClick={() => refetch()}
          >
            Refresh Stream
          </Button>
        </div>
      )}

      {/* 4. FOOTER STATS */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 px-4 py-3 sm:p-4 z-50 overflow-hidden">
         <div className="flex items-center justify-center gap-4 sm:gap-8 max-w-4xl mx-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 shrink-0">
               <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500" />
               <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Stability: 100%</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
               <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Network Active</span>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default NotificationsPage;
