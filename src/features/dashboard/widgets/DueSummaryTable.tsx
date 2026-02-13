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

interface DueStudent {
  _id: string;
  name: string;
  dueAmount: number;
  dueMonth: string;
  status: string;
}

interface DueSummaryTableProps {
  students: DueStudent[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const DueSummaryTable: React.FC<DueSummaryTableProps> = React.memo(
  ({ students, total, page, pageSize, onPageChange, isLoading }) => {
    const totalPages = Math.ceil(total / pageSize);

    return (
      <div className="bg-white shadow rounded p-4 mb-4">
        <div className="font-semibold mb-2">End-of-Month Due Summary</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Due Amount</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No due students found
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>₹{student.dueAmount}</TableCell>
                  <TableCell>{student.dueMonth}</TableCell>
                  <TableCell>{student.status}</TableCell>
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
    );
  },
);

export default DueSummaryTable;
