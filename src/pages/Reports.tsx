
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, CheckCircle, Clock, AlertTriangle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { mockIssues } from "@/utils/mockData";

// Status helper functions - reused from MyReports
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

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
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

  const filteredReports = activeFilter === 'all' 
    ? reports 
    : reports.filter(report => report.status === activeFilter);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    toast({
      title: "Filter Applied",
      description: `Showing ${filter === 'all' ? 'all' : filter} reports`,
    });
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
            
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
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
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-500 mb-4">No reports found</div>
              <Button className="gradient-header hover:opacity-90">Create a Report</Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in stagger-children">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="aspect-video relative">
                    <img 
                      src={report.imageUrl || "https://source.unsplash.com/random/300x200/?pothole"} 
                      alt={report.title} 
                      className="object-cover w-full h-full"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-1 ${getStatusColor(report.status)}`}
                    >
                      {getStatusIcon(report.status)}
                      <span className="capitalize">{report.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="bg-purple-50 text-purple-800 hover:bg-purple-100">
                        {report.category}
                      </Badge>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {report.date}
                      </div>
                    </div>
                    <CardTitle className="text-xl mt-2">{report.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {report.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      {/* Fix: Access the address property of the location object */}
                      {typeof report.location === 'object' ? report.location.address : report.location}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" className="text-sm">
                      View Details
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M7 10v12"></path>
                          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                        </svg>
                        {report.votes || 0}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} TownReport AI. All rights reserved.
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
