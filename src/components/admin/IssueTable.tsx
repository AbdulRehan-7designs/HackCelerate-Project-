
import { useState, useEffect } from 'react';
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
  FileCheck,
  BrainCircuit,
  Sparkles
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
import { supabase } from "@/integrations/supabase/client";
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { IssueAIInsights } from '../issue/IssueAIInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface IssueTableProps {
  issues: IssueReport[];
}

type StatusAction = 'verified' | 'in-progress' | 'resolved' | 'fake' | 'delete';

const IssueTable = ({ issues }: IssueTableProps) => {
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { analyzeIssue } = useAIAnalysis();

  const handleStatusChange = async (issueId: string, action: StatusAction) => {
    try {
      let message = '';
      let description = '';
      let newStatus = '';
      
      switch (action) {
        case 'verified':
          message = 'Issue Verified';
          description = 'The report has been marked as verified';
          newStatus = 'verified';
          break;
        case 'in-progress':
          message = 'Issue In Progress';
          description = 'The report has been marked as in progress';
          newStatus = 'in-progress';
          break;
        case 'resolved':
          message = 'Issue Resolved';
          description = 'The report has been marked as resolved';
          newStatus = 'resolved';
          break;
        case 'fake':
          message = 'Issue Marked as Fake';
          description = 'The report has been identified as invalid';
          newStatus = 'fake';
          break;
        case 'delete':
          message = 'Issue Deleted';
          description = 'The report has been removed from the system';
          // In a real app, we would delete the issue from the database
          break;
      }
      
      // In a real app with real Supabase data, update status in the database
      if (action !== 'delete') {
        // Simulate a database update for now
        // But here's how we would update it in a real app:
        // const { error } = await supabase
        //   .from('issues')
        //   .update({ status: newStatus })
        //   .eq('id', issueId);
        // 
        // if (error) throw error;
      }
      
      toast({
        title: message,
        description: description,
      });
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast({
        title: "Error",
        description: "Failed to update issue status.",
        variant: "destructive",
      });
    }
  };

  const viewDetails = (issue: IssueReport) => {
    setSelectedIssue(issue);
    setIsViewDialogOpen(true);
  };

  const handleAnalyze = async (issue: IssueReport) => {
    setIsAnalyzing(true);
    try {
      await analyzeIssue(issue.id);
      toast({
        title: "AI Analysis Complete",
        description: "The issue has been analyzed for insights.",
      });
    } catch (error) {
      console.error('Error analyzing issue:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to complete AI analysis of the issue.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleAnalyze(issue)}
              disabled={isAnalyzing}
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              {isAnalyzing ? (
                <Clock className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <BrainCircuit className="h-3.5 w-3.5 mr-1" />
              )}
              
              Analyze
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
  ], [isAnalyzing]);

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
                
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="ai-insights">
                      <Sparkles className="h-3.5 w-3.5 mr-2" />
                      AI Insights
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4 pt-4">
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
                  </TabsContent>
                  
                  <TabsContent value="ai-insights">
                    <IssueAIInsights issue={selectedIssue} />
                  </TabsContent>
                </Tabs>
                
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
