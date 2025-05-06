
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { IssueReport } from "@/utils/mockData";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface IssueTableProps {
  issues: IssueReport[];
}

const IssueTable = ({ issues }: IssueTableProps) => {
  // Define table columns
  const columns: ColumnDef<IssueReport>[] = useMemo(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div className="font-mono text-xs">{row.original.id.substring(0, 8)}</div>,
    },
    {
      accessorKey: "title",
      header: "Issue",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge className={`status-${status}`}>
            {status.replace("-", " ").replace(/^\w/, c => c.toUpperCase())}
          </Badge>
        );
      },
    },
    {
      accessorKey: "votes",
      header: "Votes",
      cell: ({ row }) => <div className="font-semibold">{row.original.votes}</div>,
    },
    {
      accessorKey: "reportedAt",
      header: "Reported",
      cell: ({ row }) => <div>{new Date(row.original.reportedAt).toLocaleDateString()}</div>,
    },
    {
      id: "actions",
      cell: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">View</Button>
          <Button variant="outline" size="sm">Update</Button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="rounded-md border">
      <DataTable
        columns={columns}
        data={issues}
      />
    </div>
  );
};

export default IssueTable;
