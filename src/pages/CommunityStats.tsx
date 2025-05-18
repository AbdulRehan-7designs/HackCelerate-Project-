
import { useState } from 'react';
import { 
  BarChart3, TrendingUp, PieChart, Clock, Users, Building, AlertTriangle, 
  ChevronDown, MessageCircle, X, Minimize, Maximize
} from "lucide-react";
import { mockIssues } from "@/utils/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartPieChart, Pie, Cell 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const CommunityStats = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isModelReady } = useAIAnalysis();

  // Calculate statistics from mock data
  const totalReports = mockIssues.length;
  const resolvedIssues = mockIssues.filter(issue => issue.status === 'resolved').length;
  const avgResponseTime = '48h';
  const activeAreas = 8;

  // Generate category data for pie chart
  const getCategoryData = () => {
    const categoryData = mockIssues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
  };

  const pieData = getCategoryData();

  // Monthly report trend data
  const monthlyTrendData = [
    { month: 'Jan', reports: 15 },
    { month: 'Feb', reports: 19 },
    { month: 'Mar', reports: 24 },
    { month: 'Apr', reports: 17 },
    { month: 'May', reports: 28 },
    { month: 'Jun', reports: 23 },
  ];

  // Department data
  const departmentData = [
    { name: 'Public Works Department (PWD)', responseTime: '48-72 hours' },
    { name: 'Water Supply & Sewerage Board', responseTime: '24 hours' },
    { name: 'Municipal Corporation', responseTime: '48 hours' },
    { name: 'Electricity Department', responseTime: '12-24 hours' },
    { name: 'Transport Department', responseTime: '72 hours' },
    { name: 'Horticulture Department', responseTime: '72 hours' },
    { name: 'Public Health Department', responseTime: '24 hours' },
    { name: 'Fire & Emergency Services', responseTime: 'Immediate' },
    { name: 'Education Department', responseTime: '72 hours' },
    { name: 'Social Welfare Department', responseTime: '48 hours' },
    { name: 'Citizen Services & Certification', responseTime: '3-4 days' }
  ];

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7f0e'];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Community Statistics</h1>
              <p className="text-gray-500 mt-1">Analytics and insights about community issues</p>
            </div>
            {!isModelReady && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                AI Analysis Limited
              </Badge>
            )}
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-yellow-500" />
                  Total Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalReports}</div>
                <p className="text-xs text-muted-foreground">Community issues reported</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-green-500" />
                  Resolved Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resolvedIssues}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(resolvedIssues / totalReports) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Avg. Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgResponseTime}</div>
                <p className="text-xs text-muted-foreground">Average time to resolution</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Building className="h-4 w-4 mr-2 text-purple-500" />
                  Active Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeAreas}</div>
                <p className="text-xs text-muted-foreground">Neighborhoods engaged</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Monthly Report Trend
                </CardTitle>
                <CardDescription>Reports submitted per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={monthlyTrendData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="reports" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  Issues by Category
                </CardTitle>
                <CardDescription>Distribution of issues by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="bg-gray-100">Encroachment 7%</Badge>
                  <Badge variant="outline" className="bg-gray-100">Noise Pollution 5%</Badge>
                  <Badge variant="outline" className="bg-gray-100">Stray Animals 3%</Badge>
                  <Badge variant="outline" className="bg-gray-100">Fire Safety 2%</Badge>
                  <Badge variant="outline" className="bg-gray-100">Building Violations 9%</Badge>
                  <Badge variant="outline" className="bg-gray-100">Air Pollution 7%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* City Departments */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">City Departments</CardTitle>
              <CardDescription>Response times and handling of community issues</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {departmentData.map((dept, index) => (
                  <AccordionItem key={index} value={`dept-${index}`}>
                    <AccordionTrigger className="hover:bg-gray-50 px-4">
                      <div className="flex justify-between w-full pr-4">
                        <span>{dept.name}</span>
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                          {dept.responseTime} Response
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="text-sm text-gray-600">
                        <p>Current handling {Math.floor(Math.random() * 15) + 5} open issues.</p>
                        <p className="mt-2">Performance rating: {Math.floor(Math.random() * 2) + 4}/5</p>
                        <div className="mt-2 flex gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {Math.floor(Math.random() * 10) + 10} Resolved This Month
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {Math.floor(Math.random() * 5) + 1} In Progress
                          </Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CommunityStats;
