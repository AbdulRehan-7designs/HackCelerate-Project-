
import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { IssueReport } from "@/utils/mockData";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MoreVertical,
  Trash2, 
  Eye,
  Edit,
  FileCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface IssueTableProps {
  issues: IssueReport[];
}

type StatusAction = 'verified' | 'in-progress' | 'resolved' | 'fake' | 'delete';

const IssueTable = ({ issues }: IssueTableProps) => {
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (issueId: string, action: StatusAction) => {
    // In a real app, this would call an API to update the status
    let message = '';
    let description = '';
    
    switch (action) {
      case 'verified':
        message = 'Issue Verified';
        description = 'The report has been marked as verified';
        break;
      case 'in-progress':
        message = 'Issue In Progress';
        description = 'The report has been marked as in progress';
        break;
      case 'resolved':
        message = 'Issue Resolved';
        description = 'The report has been marked as resolved';
        break;
      case 'fake':
        message = 'Issue Marked as Fake';
        description = 'The report has been identified as invalid';
        break;
      case 'delete':
        message = 'Issue Deleted';
        description = 'The report has been removed from the system';
        break;
    }
    
    toast({
      title: message,
      description: description,
    });
  };

  const viewDetails = (issue: IssueReport) => {
    setSelectedIssue(issue);
    setIsViewDialogOpen(true);
  };

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
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium" title={row.original.title}>
          {row.original.title}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusIcons = {
          'new': <AlertTriangle className="h-3 w-3 mr-1" />,
          'verified': <CheckCircle className="h-3 w-3 mr-1" />,
          'in-progress': <Clock className="h-3 w-3 mr-1" />,
          'resolved': <FileCheck className="h-3 w-3 mr-1" />,
          'fake': <XCircle className="h-3 w-3 mr-1" />
        };
        
        const icon = statusIcons[status as keyof typeof statusIcons] || null;
        
        return (
          <Badge className={`status-${status} flex items-center w-fit`}>
            {icon}
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
      cell: ({ row }) => {
        const issue = row.original;
        
        return (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => viewDetails(issue)}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'verified')}>
                  <CheckCircle className="h-3.5 w-3.5 mr-2" />
                  <span>Mark as Verified</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'in-progress')}>
                  <Clock className="h-3.5 w-3.5 mr-2" />
                  <span>Mark as In Progress</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'resolved')}>
                  <FileCheck className="h-3.5 w-3.5 mr-2" />
                  <span>Mark as Resolved</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'fake')}>
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  <span>Mark as Fake</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(issue.id, 'delete')} className="text-red-600">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  <span>Delete Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <DataTable
          columns={columns}
          data={issues}
        />
      </div>
      
      {/* Issue Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>
              Complete information about the reported issue
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-6 py-4">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedIssue.title}</h3>
                  <Badge className={`status-${selectedIssue.status} mt-2`}>
                    {selectedIssue.status.replace("-", " ").replace(/^\w/, c => c.toUpperCase())}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Reported By</h4>
                    <p>{selectedIssue.reportedBy}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Reported At</h4>
                    <p>{new Date(selectedIssue.reportedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Category</h4>
                  <Badge variant="outline" className="bg-purple-50">
                    {selectedIssue.category}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-gray-600">{selectedIssue.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Location</h4>
                  <p className="text-sm">{typeof selectedIssue.location === 'object' 
                      ? selectedIssue.location.address 
                      : selectedIssue.location}</p>
                </div>
                
                {selectedIssue.images && selectedIssue.images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedIssue.images.map((image, i) => (
                        <img 
                          key={i}
                          src={image} 
                          alt={`Report image ${i+1}`}
                          className="w-full aspect-square object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  <div className="space-x-2">
                    <Button 
                      variant="default"
                      onClick={() => {
                        handleStatusChange(selectedIssue.id, 'verified');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                    <Button 
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleStatusChange(selectedIssue.id, 'resolved');
                        setIsViewDialogOpen(false);
                      }}
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssueTable;
