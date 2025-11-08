import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Search, Upload, LogIn, LogOut, User, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import ReportForm from './ReportForm';
import { useAuth } from '@/context/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2);
  const { user, profile, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Simulate search functionality
    if (e.target.value.length > 2) {
      // Mock API call - would be replaced with actual search API
      setTimeout(() => {
        const mockResults = [
          { id: 1, title: "Pothole on Main Street", type: "Road Damage" },
          { id: 2, title: "Broken streetlight near park", type: "Street Light" },
          { id: 3, title: "Graffiti on building wall", type: "Vandalism" }
        ].filter(item => 
          item.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
          item.type.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setSearchResults(mockResults);
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      toast({
        title: "Searching",
        description: `Searching for "${searchTerm}"`,
      });
      // Would navigate to search results page in a full implementation
      setSearchResults([]);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setNotificationCount(0); // Mark as read when clicked
  };

  // AI-powered notification suggestion
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAuthenticated && Math.random() > 0.7) {
        toast({
          title: "AI Suggestion",
          description: "Based on your location, there might be issues nearby that need attention.",
        });
      }
    }, 60000); // Check once per minute

    return () => clearInterval(interval);
  }, [isAuthenticated, toast]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out from your account.",
    });
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to report an issue.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    setIsOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-blue-600 text-white shadow-md animate-fade-in">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity hover:scale-105 duration-200">
          <MapPin className="h-6 w-6 text-white" />
          <span className="hidden font-bold sm:inline-block text-xl">CivicPulse</span>
          <span className="font-bold sm:hidden text-lg">CP</span>
          <span className="rounded bg-white/25 backdrop-blur-sm text-white px-1.5 py-0.5 text-xs font-semibold">AI</span>
        </Link>
        
        <div className="flex-1 mx-4">
          <nav className="hidden md:flex items-center space-x-4 text-sm">
            <Link to="/reports" className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors">
              All Reports
            </Link>
            <Link to="/my-reports" className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors">
              My Reports
            </Link>
            {isAuthenticated && (profile?.role === 'official' || profile?.role === 'admin') ? (
              <Link to="/official" className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center">
                <ShieldCheck className="h-4 w-4 mr-1" /> Official Portal
              </Link>
            ) : (
              <Link to="/officials/login" className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center">
                <ShieldCheck className="h-4 w-4 mr-1" /> Officials
              </Link>
            )}
            <Link to="/insights" className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors flex items-center relative">
              AI Insights
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded px-1.5 text-[10px]">
                New
              </span>
            </Link>
            <Link to="/community-stats" className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors">
              Community Stats
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center justify-end space-x-2">
          <form onSubmit={(e) => e.preventDefault()} className="hidden w-full max-w-sm md:flex items-center space-x-2 mr-4 relative">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/70" />
              <input
                type="search"
                placeholder="Search reports..."
                className="w-full bg-white/10 backdrop-blur-sm text-white placeholder:text-white/70 pl-8 rounded-md border border-white/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600 transition-all hover:bg-white/15"
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                  {searchResults.map(result => (
                    <div 
                      key={result.id} 
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 border-b last:border-b-0"
                      onClick={() => {
                        setSearchTerm('');
                        setSearchResults([]);
                        toast({
                          title: "Report Selected",
                          description: `Viewing ${result.title}`,
                        });
                      }}
                    >
                      <div className="font-medium">{result.title}</div>
                      <div className="text-xs text-gray-500">{result.type}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                className="gap-2 bg-white text-blue-600 hover:bg-white/90 hover:scale-105 transition-all font-medium"
                onClick={handleReportClick}
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Report Issue</span>
                <span className="sm:hidden">Report</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report a Civic Issue</DialogTitle>
                <DialogDescription>
                  Help improve your community by reporting issues that need attention.
                </DialogDescription>
              </DialogHeader>
              <ReportForm onSubmitSuccess={() => setIsOpen(false)} />
            </DialogContent>
          </Dialog>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/20 hover:scale-105 transition-all relative"
                onClick={handleNotificationClick}
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0">
              <div className="p-3 border-b">
                <h4 className="font-medium text-sm">Notifications</h4>
              </div>
              <div className="p-0">
                <div className="p-3 border-b hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">Your report has been acknowledged</div>
                  <div className="text-xs text-gray-500">The pothole report on Main St has been assigned to a crew</div>
                </div>
                <div className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">New issue reported near you</div>
                  <div className="text-xs text-gray-500">A street light outage was reported in your neighborhood</div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/20 flex items-center gap-1.5 hover:scale-105 transition-all">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.email.split('@')[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profile?.role === 'admin' && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100">
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {profile?.role === 'official' && (
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100">
                    <Link to="/official">Official Portal</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100">
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:bg-gray-100">
                  <Link to="/my-reports">My Reports</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-white/20 flex items-center gap-1.5 hover:scale-105 transition-all">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
