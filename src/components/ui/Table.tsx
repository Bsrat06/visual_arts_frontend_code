import type { ReactNode, HTMLAttributes } from "react";

type TableProps = {
  headers?: string[];
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

export const Table = ({ children, className, ...props }: TableProps) => {
  return (
    <div 
      className={`border border-gray-200 dark:border-gray-700 rounded-md overflow-x-auto ${className}`} 
      {...props}
    >
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
};

type TableCellProps = {
  children: ReactNode;
  colSpan?: number;
  className?: string;
} & HTMLAttributes<HTMLTableCellElement>;

export const TableCell = ({ children, colSpan, className, ...props }: TableCellProps) => (
  <td 
    className={`p-2 text-gray-700 dark:text-gray-300 ${className}`} 
    colSpan={colSpan} 
    {...props}
  >
    {children}
  </td>
);

type TableRowProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLTableRowElement>;

export const TableRow = ({ children, className, ...props }: TableRowProps) => (
  <tr 
    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${className}`} 
    {...props}
  >
    {children}
  </tr>
);

type TableHeadProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLTableCellElement>;

export const TableHead = ({ children, className, ...props }: TableHeadProps) => (
  <th 
    className={`p-2 text-left font-medium text-gray-700 dark:text-gray-300 ${className}`} 
    {...props}
  >
    {children}
  </th>
);

export const TableHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <thead 
    className={`bg-gray-100 dark:bg-gray-700/30 text-sm font-medium ${className}`}
  >
    {children}
  </thead>
);

export const TableBody = ({ children, className }: { children: ReactNode; className?: string }) => (
  <tbody 
    className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`}
  >
    {children}
  </tbody>
);