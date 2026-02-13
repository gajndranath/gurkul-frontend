import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNotifications } from "../../api/notificationApi";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";

const NotificationsPage: React.FC = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["all-notifications"],
    queryFn: fetchAllNotifications,
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          className="px-4 py-2 rounded bg-primary text-white font-medium hover:bg-primary/90 transition"
          onClick={() => refetch()}
        >
          Refresh
        </button>
      </div>
      {isLoading ? (
        <div>Loading notifications...</div>
      ) : isError ? (
        <div className="text-red-500">Failed to load notifications.</div>
      ) : data && data.length ? (
        <div className="space-y-2">
          {data.map((n: import("../../api/notificationApi").Notification) => (
            <Card key={n._id} className="flex flex-row items-center gap-3 p-3">
              <div className="flex-1">
                <div
                  className={
                    n.read ? "text-gray-400" : "font-bold text-primary-600"
                  }
                >
                  {n.title}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              {!n.read && <Badge variant="outline">New</Badge>}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-gray-400">No notifications found.</div>
      )}
    </div>
  );
};

export default NotificationsPage;
