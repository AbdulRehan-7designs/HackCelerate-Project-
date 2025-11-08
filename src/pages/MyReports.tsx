
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, CheckCircle, Clock, AlertTriangle, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import VoteButton from "@/components/VoteButton";

// Mock data for reports
const mockReports = [
  {
    id: "report-1",
    title: "Pothole on Main Street",
    description: "Large pothole causing traffic hazards",
    status: "in-progress",
    category: "Road Damage",
    location: "123 Main St",
    date: "2023-05-10",
    votes: 15,
    imageUrl: "https://www.bing.com/images/search?view=detailV2&ccid=a9oq90Cu&id=F3725D9E1AFB346C75E408157EC92FEF4BC21B19&thid=OIP.a9oq90CupsQCYTX6ihmY0AHaEK&mediaurl=https%3a%2f%2fwww.hindustantimes.com%2fht-img%2fimg%2f2023%2f07%2f18%2f1600x900%2fMumbai--India---July-18--2023---Huge-potholes-Seen_1689706903750.jpg&exph=900&expw=1600&q=pothhole+on+street+india&simid=608011407093275162&FORM=IRPRST&ck=7F72057DD9E3358822CBBF06AF01AF0C&selectedIndex=6&itb=0"
  },
  {
    id: "report-2",
    title: "Broken Streetlight",
    description: "Streetlight not working near the park entrance",
    status: "reported",
    category: "Street Light",
    location: "Oak Park, East Entrance",
    date: "2023-05-15",
    votes: 8,
    imageUrl: "https://www.bing.com/images/search?view=detailV2&ccid=8M0rM2sd&id=8E6524878C0CB6F51E911C509FCEA31B4E44F352&thid=OIP.8M0rM2sdczYAY_tX89PbtgHaEK&mediaurl=https%3a%2f%2fwww.hindustantimes.com%2fht-img%2fimg%2f2023%2f07%2f23%2f1600x900%2fA-non-functioning-street-light-at-southern-bypass-_1690134239324.jpg&exph=900&expw=1600&q=Broken+street+light++india&simid=607991585820640763&FORM=IRPRST&ck=0652503B4BACE304C5E7F0067905AFD7&selectedIndex=0&itb=0"
  },
  {
    id: "report-3",
    title: "Fallen Tree Branch",
    description: "Large branch blocking sidewalk after storm",
    status: "resolved",
    category: "Tree Hazard",
    location: "45 Elm Street",
    date: "2023-05-01",
    votes: 12,
    imageUrl: "https://www.bing.com/images/search?view=detailV2&ccid=hSltZSVN&id=BE45115554E266D13A4787E1F73BA8D3E3CB4458&thid=OIP.hSltZSVNb3uzOMihquf8KwHaFj&mediaurl=https%3a%2f%2fthumbs.dreamstime.com%2fb%2ftree-fallen-road-amphan-india-west-bengal-tree-fallen-road-amphan-india-west-184504168.jpg&exph=600&expw=800&q=Fallen++tree++india&simid=608000179976734962&FORM=IRPRST&ck=1ECFAC3B1BFE7AAEE0545841C732B858&selectedIndex=2&itb=0"
  }
];

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

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const handleVoteChange = (reportId: string, newVotes: number) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === reportId ? { ...report, votes: newVotes } : report
      )
    );
  };

  useEffect(() => {
    // Simulate API call to fetch user's reports
    const fetchReports = async () => {
      setIsLoading(true);
      // In a real app, this would be an API call
      setTimeout(() => {
        setReports(mockReports);
        setIsLoading(false);
      }, 1000);
    };

    fetchReports();
  }, []);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

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
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Reports</h1>
              <p className="text-gray-500 mt-1">Track and manage your community issue reports</p>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 animate-fade-in stagger-children">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                  <div className="aspect-video relative">
                    <img 
                      src={report.imageUrl} 
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
                      {report.location}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between pt-2">
                    <Button variant="outline" size="sm" className="text-sm">
                      View Details
                    </Button>
                    
                    <VoteButton 
                      issueId={report.id} 
                      initialVotes={report.votes}
                      onVoteChange={(newVotes) => handleVoteChange(report.id, newVotes)}
                    />
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

export default MyReports;
