import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Building2, FileText, Route, BarChart3, LogOut } from "lucide-react";
import { mockIssues } from "@/utils/mockData";
import IssueTable from "@/components/admin/IssueTable";
import RouteOptimization from "@/components/admin/RouteOptimization";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Official = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const { profile, userRole, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  // Redirect if not official or admin
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (userRole !== 'official' && userRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to officials and administrators.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, userRole, toast]);

  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = searchTerm === "" || 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesArea = selectedArea === "all" || 
      (typeof issue.location === 'string' && issue.location.toLowerCase().includes(selectedArea.toLowerCase()));
    
    return matchesSearch && matchesStatus && matchesArea;
  });

  // Show loading or redirect if not authorized
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'official' && userRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="p-4">
          <div className="flex items-center mb-6">
            <Building2 className="h-6 w-6 text-white mr-2" />
            <h2 className="font-bold text-lg">Official Portal</h2>
          </div>
          <div className="space-y-2 mb-6">
            <div className="p-3 bg-white/10 rounded-md backdrop-blur-sm">
              <div className="text-sm font-medium">{profile?.full_name || 'Official'}</div>
              <div className="text-xs text-white/80">{profile?.email}</div>
              <div className="mt-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  {userRole === 'admin' ? 'Administrator' : 'Official'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                toast({
                  title: "Logged Out",
                  description: "You have been logged out successfully.",
                });
              }}
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Official Dashboard</h1>
              <p className="text-gray-500">Manage and respond to community issues</p>
            </div>
            <Link to="/">
              <Button variant="outline" size="sm" className="md:hidden">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="issues">
            <TabsList className="mb-4">
              <TabsTrigger value="issues">
                <FileText className="h-4 w-4 mr-2" />
                Issues
              </TabsTrigger>
              <TabsTrigger value="routes">
                <Route className="h-4 w-4 mr-2" />
                Route Optimization
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="issues" className="space-y-4 pt-4">
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Assigned Issues</h3>
                  <IssueTable issues={filteredIssues} />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="routes" className="pt-4">
              <RouteOptimization issues={filteredIssues} />
            </TabsContent>
            
            <TabsContent value="analytics" className="pt-4">
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold mb-4">Issue Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold">{filteredIssues.length}</div>
                      <div className="text-sm text-gray-600">Total Issues</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {filteredIssues.filter(i => i.status === 'in-progress').length}
                      </div>
                      <div className="text-sm text-gray-600">In Progress</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold">
                        {filteredIssues.filter(i => i.status === 'resolved').length}
                      </div>
                      <div className="text-sm text-gray-600">Resolved</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Official;

