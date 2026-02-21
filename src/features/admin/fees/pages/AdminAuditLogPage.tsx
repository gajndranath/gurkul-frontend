import { fetchAuditLogs } from "@/api/adminDashboardApi";
import type { AuditLog } from "@/api/adminDashboardApi";
// AdminAuditLogPage.tsx
import React, { useEffect, useState } from "react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ACTIONS = [
  "all",
  "CREATE_STUDENT",
  "UPDATE_STUDENT",
  "ARCHIVE_STUDENT",
  "REACTIVATE_STUDENT",
  "MARK_PAID",
  "MARK_DUE",
  "ADD_ADVANCE",
  "OVERRIDE_FEE",
  "CREATE_ADMIN",
  "UPDATE_ADMIN",
  "DELETE_ADMIN",
];

const AdminAuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAuditLogs(page, limit, search, action).then((res) => {
      setLogs(res.logs);
      setTotalPages(res.pagination.pages);
      setLoading(false);
    });
  }, [page, limit, search, action]);

  return (
    <Card className="bg-white border-slate-200 shadow-md">
      <CardHeader>
        <CardTitle>Admin Audit Logs</CardTitle>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Search by entity, admin, or ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a === "all" ? "All Actions" : a}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : logs.length === 0 ? (
          <div className="text-slate-400 text-center py-8">
            No audit logs found.
          </div>
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-2 py-2">Action</th>
                <th className="px-2 py-2">Entity</th>
                <th className="px-2 py-2">Target ID</th>
                <th className="px-2 py-2">Admin</th>
                <th className="px-2 py-2">Timestamp</th>
                <th className="px-2 py-2">Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="px-2 py-2 font-bold text-blue-600">
                    {log.action}
                  </td>
                  <td className="px-2 py-2">{log.targetEntity}</td>
                  <td className="px-2 py-2">{log.targetId}</td>
                  <td className="px-2 py-2">{log.admin}</td>
                  <td className="px-2 py-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-2 py-2">
                    {log.changes && (
                      <pre className="bg-slate-100 rounded p-1 text-xs max-w-xs overflow-x-auto">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Pagination */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </Button>
          <span className="text-xs">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuditLogPage;
