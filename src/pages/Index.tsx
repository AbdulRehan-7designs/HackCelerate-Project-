
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "../components/Navbar";
import IssueCard from "../components/IssueCard";
import IssueMap from "../components/IssueMap";
import { mockIssues, statusOptions, IssueReport } from "@/utils/mockData";
import { Search, ArrowUp, Calendar, Clock } from "lucide-react";

const Index = () => {
  const [issues] = useState<IssueReport[]>(mockIssues);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("votes");

  // Filter issues by status
  const filteredIssues = issues.filter(issue => {
    if (statusFilter === "all") return true;
    return issue.status === statusFilter;
  });

  // Sort issues
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    switch (sortBy) {
      case "votes":
        return b.votes - a.votes;
      case "recent":
        return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
      case "updated":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      default:
        return b.votes - a.votes;
    }
  });

  const getStatusCount = (status: string) => {
    if (status === "all") return issues.length;
    return issues.filter(issue => issue.status === status).length;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Community Issue Reporter</h1>
          
          <div className="grid gap-6 md:grid-cols-12">
            {/* Sidebar */}
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>Filter issues by status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <RadioGroup 
                      value={statusFilter} 
                      onValueChange={setStatusFilter} 
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="all" />
                          <Label htmlFor="all">All Issues</Label>
                        </div>
                        <span className="text-sm text-gray-500">{getStatusCount("all")}</span>
                      </div>
                      
                      {statusOptions.map(option => (
                        <div key={option.value} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <Label htmlFor={option.value}>{option.label}</Label>
                          </div>
                          <span className="text-sm text-gray-500">{getStatusCount(option.value)}</span>
                        </div>
                      ))}
                    </RadioGroup>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-3">Sort By</h3>
                      <RadioGroup 
                        value={sortBy} 
                        onValueChange={setSortBy} 
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="votes" id="votes" />
                          <Label htmlFor="votes" className="flex items-center">
                            <ArrowUp className="h-4 w-4 mr-1" /> 
                            Most Votes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="recent" id="recent" />
                          <Label htmlFor="recent" className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" /> 
                            Recently Added
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="updated" id="updated" />
                          <Label htmlFor="updated" className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" /> 
                            Recently Updated
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Search</h3>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search issues..."
                          className="pl-8"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                  <CardDescription>Issue reporting metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Reports</span>
                      <span className="font-medium">{issues.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resolved</span>
                      <span className="font-medium">{issues.filter(i => i.status === 'resolved').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">In Progress</span>
                      <span className="font-medium">{issues.filter(i => i.status === 'in-progress').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Avg. Resolution Time</span>
                      <span className="font-medium">3.2 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-9">
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="map">Map View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="space-y-4">
                  {sortedIssues.length > 0 ? (
                    sortedIssues.map(issue => (
                      <IssueCard key={issue.id} issue={issue} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-muted-foreground mb-2">No issues found matching your filters.</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filter criteria or report a new issue.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="map" className="h-[70vh]">
                  <IssueMap issues={sortedIssues} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
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

export default Index;
