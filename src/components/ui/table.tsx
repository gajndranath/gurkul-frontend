import React from "react";

export const Table = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) => (
  <table className="min-w-full" {...props}>
    {children}
  </table>
);
export const TableHeader = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead {...props}>{children}</thead>
);
export const TableBody = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody {...props}>{children}</tbody>
);
export const TableRow = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props}>{children}</tr>;
export const TableHead = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement>) => (
  <th className="px-2 py-1 text-left" {...props}>
    {children}
  </th>
);
export const TableCell = ({
  children,
  colSpan,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement> & { colSpan?: number }) => (
  <td className="px-2 py-1" colSpan={colSpan} {...props}>
    {children}
  </td>
);
