import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from "../../../components/ui";

interface AuditLog {
  _id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
}

interface AuditLogTableProps {
  logs: AuditLog[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const AuditLogTable: React.FC<AuditLogTableProps> = React.memo(
  ({ logs, page, totalPages, onPageChange, isLoading }) => (
    <div className="bg-white shadow rounded p-4 mb-4">
      <div className="font-semibold mb-2">Audit Logs</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.details || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-end mt-2 gap-2">
        <Button onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Prev
        </Button>
        <span className="px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  ),
);

export default AuditLogTable;
