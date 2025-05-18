
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, CheckCircle, Clock, AlertTriangle, Filter, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { mockIssues, IssueReport, formatTimeAgo } from "@/utils/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VoteButton from "@/components/VoteButton";
import { IssueCardDetails } from "@/components/issue/IssueCardDetails";

// Status helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'reported':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'reported':
      return <AlertTriangle className="h-4 w-4" />;
    case 'in-progress':
      return <Clock className="h-4 w-4" />;
    case 'resolved':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

// Priority helper
const getPriorityBadge = (votes) => {
  if (votes >= 10) {
    return <Badge className="bg-red-100 text-red-800 border-red-200">High Priority</Badge>;
  } else if (votes >= 5) {
    return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Medium Priority</Badge>;
  }
  return null;
};

const Reports = () => {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to fetch all reports
    const fetchReports = async () => {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setReports(mockIssues);
        setIsLoading(false);
      }, 1000);
    };

    fetchReports();
  }, []);

  // Filter and sort reports
  const processedReports = [...reports]
    .filter(report => activeFilter === 'all' ? true : report.status === activeFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.reportedAt).getTime();
        const dateB = new Date(b.reportedAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // Sort by priority (votes)
        return sortOrder === 'asc' ? a.votes - b.votes : b.votes - a.votes;
      }
    });

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    toast({
      title: "Filter Applied",
      description: `Showing ${filter === 'all' ? 'all' : filter} reports`,
    });
  };

  const toggleSort = (newSortBy: 'date' | 'priority') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc'); // Default to descending when changing sort type
    }
  };

  const handleViewDetails = (issue: IssueReport) => {
    setSelectedIssue(issue);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <Navbar />
      
      <main className="flex-1 container py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Community Reports</h1>
              <p className="text-gray-500 mt-1">View and track all reported issues in your community</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
              <Button
                variant={activeFilter === 'all' ? "default" : "outline"}
                className={activeFilter === 'all' ? "gradient-header" : ""}
                onClick={() => handleFilterChange('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'reported' ? "default" : "outline"}
                className={activeFilter === 'reported' ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                onClick={() => handleFilterChange('reported')}
              >
                Reported
              </Button>
              <Button
                variant={activeFilter === 'in-progress' ? "default" : "outline"}
                className={activeFilter === 'in-progress' ? "bg-blue-500 hover:bg-blue-600" : ""}
                onClick={() => handleFilterChange('in-progress')}
              >
                In Progress
              </Button>
              <Button
                variant={activeFilter === 'resolved' ? "default" : "outline"}
                className={activeFilter === 'resolved' ? "bg-green-500 hover:bg-green-600" : ""}
                onClick={() => handleFilterChange('resolved')}
              >
                Resolved
              </Button>
              
              <div className="flex items-center gap-2 ml-2 border-l pl-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('date')}
                  className={`flex items-center ${sortBy === 'date' ? 'text-primary' : ''}`}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Date
                  {sortBy === 'date' && (
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort('priority')}
                  className={`flex items-center ${sortBy === 'priority' ? 'text-primary' : ''}`}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  Priority
                  {sortBy === 'priority' && (
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-pulse flex flex-col items-center">
                <div className="rounded-md bg-gray-200 h-12 w-40 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2.5"></div>
                <div className="h-2 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          ) : processedReports.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 mb-4">No reports found</div>
              <Button className="gradient-header hover:opacity-90">Create a Report</Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in stagger-children">
              {processedReports.map((report) => (
                <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="aspect-video relative">
                    <img 
                      src={report.images && report.images.length > 0 ? report.images[0] : "/placeholder.svg"} 
                      alt={report.title} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                      <Badge 
                        className={`flex items-center gap-1 px-2 py-1 ${getStatusColor(report.status)}`}
                      >
                        {getStatusIcon(report.status)}
                        <span className="capitalize">{report.status.replace('-', ' ')}</span>
                      </Badge>
                      {getPriorityBadge(report.votes)}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-purple-50 text-purple-800 hover:bg-purple-100">
                        {report.category}
                      </Badge>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(report.reportedAt)}
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">{report.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {report.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {typeof report.location === 'object' ? report.location.address : report.location}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <div className="flex items-center">
                      <VoteButton issueId={report.id} initialVotes={report.votes} />
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-sm"
                      onClick={() => handleViewDetails(report)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Issue Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
          </DialogHeader>
          
          {selectedIssue && (
            <IssueCardDetails
              issue={selectedIssue}
              onClose={() => setIsDialogOpen(false)}
              getStatusClass={(status) => `status-${status}`}
            />
          )}
        </DialogContent>
      </Dialog>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} CivicPulse AI. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with community in mind. Version 1.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Reports;
