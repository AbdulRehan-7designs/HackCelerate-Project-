
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, UserCheck, FileText, BarChart3, Settings, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { mockIssues, IssueReport } from "@/utils/mockData";

// Mock admin component with the most essential functionality
const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedArea, setSelectedArea] = useState("all");

  // Filter issues based on search term and status
  const filteredIssues = mockIssues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    
    // Apply area filter if we had area property in our data
    // For now just simulate it
    const matchesArea = selectedArea === "all" || Math.random() > 0.3; // Random filtering for demo
    
    return matchesSearch && matchesStatus && matchesArea;
  });

  // Define table columns
  const columns: ColumnDef<IssueReport>[] = [
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
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 bg-gradient-to-b from-civic-blue to-blue-700 text-white flex-col">
        <div className="p-4 flex items-center space-x-2 border-b border-white/20">
          <span className="font-bold text-xl">TownReport</span>
          <span className="bg-white/20 rounded px-2 py-0.5 text-xs">Admin</span>
        </div>
        
        <div className="flex-1 py-6">
          <div className="px-4 mb-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <UserCheck size={20} />
              </div>
              <div>
                <div className="font-medium">Admin User</div>
                <div className="text-xs text-white/70">Super Admin</div>
              </div>
            </div>
          </div>
          
          <nav className="space-y-1 px-2">
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md bg-white/10">
              <FileText size={18} />
              <span>Reports</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10">
              <BarChart3 size={18} />
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 rounded-md text-white/70 hover:bg-white/10">
              <Settings size={18} />
              <span>Settings</span>
            </a>
          </nav>
        </div>
        
        <div className="p-4 border-t border-white/20">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full bg-white/10 border-white/20 hover:bg-white/20 text-white">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Site
            </Button>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="container py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Link to="/">
              <Button variant="outline" size="sm" className="md:hidden">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
            </Link>
          </div>
          
          <Tabs defaultValue="reports">
            <TabsList>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="reports" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Reports</CardTitle>
                  <CardDescription>
                    Manage and update reported civic issues.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search issues..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="w-40">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <Filter className="h-4 w-4 mr-2" />
                            <span>Status</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-40">
                        <Select value={selectedArea} onValueChange={setSelectedArea}>
                          <SelectTrigger>
                            <Filter className="h-4 w-4 mr-2" />
                            <span>Area</span>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Areas</SelectItem>
                            <SelectItem value="north">North</SelectItem>
                            <SelectItem value="south">South</SelectItem>
                            <SelectItem value="east">East</SelectItem>
                            <SelectItem value="west">West</SelectItem>
                            <SelectItem value="central">Central</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border">
                    <DataTable
                      columns={columns}
                      data={filteredIssues}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    View statistics and insights about reported issues.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96 flex items-center justify-center">
                  <p className="text-muted-foreground">Analytics features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Settings</CardTitle>
                  <CardDescription>
                    Configure system settings and permissions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-96 flex items-center justify-center">
                  <p className="text-muted-foreground">Settings features coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
