"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "w-full overflow-x-auto",
          // Better scrollbar styling
          "scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300",
          "dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ResponsiveTable.displayName = "ResponsiveTable";

interface ResponsiveTableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  minWidth?: string;
}

const ResponsiveTableHead = React.forwardRef<HTMLTableCellElement, ResponsiveTableHeadProps>(
  ({ className, children, minWidth = "120px", ...props }, ref) => {
    return (
      <TableHead
        ref={ref}
        className={cn("whitespace-nowrap", className)}
        style={{ minWidth }}
        {...props}
      >
        {children}
      </TableHead>
    );
  }
);
ResponsiveTableHead.displayName = "ResponsiveTableHead";

interface ResponsiveTableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  truncate?: boolean;
}

const ResponsiveTableCell = React.forwardRef<HTMLTableCellElement, ResponsiveTableCellProps>(
  ({ className, children, truncate = false, ...props }, ref) => {
    return (
      <TableCell
        ref={ref}
        className={cn(
          truncate && "max-w-0",
          className
        )}
        {...props}
      >
        <div className={cn(truncate && "truncate")}>
          {children}
        </div>
      </TableCell>
    );
  }
);
ResponsiveTableCell.displayName = "ResponsiveTableCell";

export { 
  ResponsiveTable, 
  ResponsiveTableHead, 
  ResponsiveTableCell, 
  Table as ResponsiveTableTable,
  TableBody as ResponsiveTableBody,
  TableHeader as ResponsiveTableHeader,
  TableRow as ResponsiveTableRow
};
