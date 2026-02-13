import React from "react";
import { useQuery } from "@tanstack/react-query";
// Import the service you provided
import {
  notificationService,
  type NotificationHistoryResponse,
} from "@/features/notifications/api/notification.service";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button"; // Use Shadcn Button
import type { AppNotification } from "@/features/notifications/types/notification.types";

const NotificationsPage: React.FC = () => {
  // Use the service method 'getHistory' instead of the non-existent 'fetchAllNotifications'
  const { data, isLoading, isError, refetch } = useQuery<
    NotificationHistoryResponse,
    Error
  >({
    queryKey: ["all-notifications"],
    queryFn: () => notificationService.getHistory(1, 20),
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {data && (
            <p className="text-sm text-muted-foreground">
              You have {data.unreadCount} unread notifications
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">Loading notifications...</div>
      ) : isError ? (
        <div className="text-destructive p-4 border border-destructive rounded-md bg-destructive/10">
          Failed to load notifications.
        </div>
      ) : data?.notifications && data.notifications.length > 0 ? (
        <div className="space-y-3">
          {data.notifications.map((n: AppNotification) => (
            <Card
              key={n._id} // Fixed: Only use _id as per your interface
              className={n.read ? "opacity-70" : "border-l-4 border-l-primary"}
            >
              <CardContent className="flex flex-row items-center gap-4 p-4">
                <div className="flex-1 space-y-1">
                  <div
                    className={`text-sm ${
                      n.read ? "text-muted-foreground" : "font-semibold"
                    }`}
                  >
                    {n.title}
                  </div>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
                {!n.read && (
                  <Badge variant="default" className="h-5">
                    New
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground border rounded-lg border-dashed">
          No notifications found.
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
