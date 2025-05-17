
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  BrainCircuit, 
  Map, 
  AlertTriangle, 
  Loader2, 
  TrendingUp,
  Activity,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';

export const AIInsightsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [trendPeriod, setTrendPeriod] = useState('weekly');
  const { toast } = useToast();
  
  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      
      try {
        // Get AI analyses
        const { data: analyses, error } = await supabase
          .from('ai_analyses')
          .select('*');
          
        if (error) throw error;
        
        // Process priority distribution
        const priorityCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        analyses?.forEach(analysis => {
          if (analysis.priority_score) {
            priorityCount[analysis.priority_score] = 
              (priorityCount[analysis.priority_score] || 0) + 1;
          }
        });
        
        const priorityChartData = Object.entries(priorityCount).map(([priority, count]) => ({
          name: getPriorityLabel(Number(priority)),
          value: count,
          color: getPriorityColor(Number(priority))
        }));
        
        setPriorityData(priorityChartData);
        
        // Process category distribution
        const categoryCount = {};
        analyses?.forEach(analysis => {
          if (analysis.predicted_category) {
            categoryCount[analysis.predicted_category] = 
              (categoryCount[analysis.predicted_category] || 0) + 1;
          }
        });
        
        const categoryChartData = Object.entries(categoryCount)
          .map(([category, count]) => ({
            name: category,
            value: count
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
          
        setCategoryData(categoryChartData);
        
        // Process department distribution
        const deptCount = {};
        analyses?.forEach(analysis => {
          if (analysis.assigned_departments) {
            analysis.assigned_departments.forEach(dept => {
              deptCount[dept] = (deptCount[dept] || 0) + 1;
            });
          }
        });
        
        const deptChartData = Object.entries(deptCount)
          .map(([dept, count]) => ({
            name: dept,
            count: count
          }))
          .sort((a, b) => b.count - a.count);
          
        setDepartmentData(deptChartData);
      } catch (error) {
        console.error('Error fetching insights:', error);
        toast({
          title: "Error loading insights",
          description: "Could not load AI insights data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    fetchInsights();
  }, []);
  
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium-Low';
      case 3: return 'Medium';
      case 4: return 'High';
      case 5: return 'Critical';
      default: return 'Unknown';
    }
  };
  
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return '#10B981'; // Green
      case 2: return '#6EE7B7'; // Light green
      case 3: return '#FBBF24'; // Yellow
      case 4: return '#F59E0B'; // Orange
      case 5: return '#EF4444'; // Red
      default: return '#CBD5E1'; // Gray
    }
  };
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading AI insights...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <BrainCircuit className="h-6 w-6 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold">AI-Powered Insights</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Priority Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Issue Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value} issues`, name]} 
                    contentStyle={{ borderRadius: '0.375rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Top Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Issue Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`${value} issues`]} 
                    contentStyle={{ borderRadius: '0.375rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Department Workload */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Department Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.slice(0, 5).map((dept, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{dept.name}</span>
                    <span className="font-medium">{dept.count} issues</span>
                  </div>
                  <Progress 
                    value={dept.count / Math.max(...departmentData.map(d => d.count)) * 100} 
                    className="h-2" 
                    indicatorClassName={`${i % 2 === 0 ? 'bg-blue-500' : 'bg-purple-500'}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Trend Analysis
            </CardTitle>
            
            <div className="flex items-center space-x-1">
              <button 
                className={`px-3 py-1 rounded text-xs font-medium ${trendPeriod === 'daily' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setTrendPeriod('daily')}
              >
                Daily
              </button>
              <button 
                className={`px-3 py-1 rounded text-xs font-medium ${trendPeriod === 'weekly' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setTrendPeriod('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`px-3 py-1 rounded text-xs font-medium ${trendPeriod === 'monthly' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:bg-gray-100'}`}
                onClick={() => setTrendPeriod('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="issues">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="issues">
                <Activity className="h-4 w-4 mr-1" />
                Issue Volume
              </TabsTrigger>
              <TabsTrigger value="resolution">
                <Calendar className="h-4 w-4 mr-1" />
                Resolution Times
              </TabsTrigger>
            </TabsList>
            <TabsContent value="issues" className="pt-4">
              <div className="h-[300px] w-full">
                {/* This would be connected to real trend data in a production app */}
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMockTrendData(trendPeriod)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value} issues`, name]} 
                      contentStyle={{ borderRadius: '0.375rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar name="Water Issues" dataKey="water" stackId="a" fill="#60A5FA" />
                    <Bar name="Road Issues" dataKey="road" stackId="a" fill="#F87171" />
                    <Bar name="Waste Issues" dataKey="waste" stackId="a" fill="#34D399" />
                    <Bar name="Other Issues" dataKey="other" stackId="a" fill="#A78BFA" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            <TabsContent value="resolution" className="pt-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMockResolutionData()}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} hours`]} 
                      contentStyle={{ borderRadius: '0.375rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar name="Avg. Resolution Time" dataKey="time" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
              <h4 className="font-medium text-blue-700 mb-1 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" /> 
                AI Detected Pattern
              </h4>
              <p className="text-blue-600">
                Water-related issues have increased by 34% in the Downtown area over the past week, 
                possibly related to the recent heavy rainfall. Consider allocating additional resources 
                to address potential infrastructure stress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hotspot Map - Placeholder since we'd need a real map integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Map className="h-5 w-5 mr-2 text-blue-500" />
            Issue Hotspots
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] bg-slate-100 flex items-center justify-center">
            <div className="text-center">
              <Map className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">
                Hotspot map visualization would appear here in a production application.
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Requires integration with a mapping service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Mock data generation functions
function getMockTrendData(period: string) {
  if (period === 'daily') {
    return Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        water: Math.floor(Math.random() * 10) + 5,
        road: Math.floor(Math.random() * 15) + 3,
        waste: Math.floor(Math.random() * 8) + 2,
        other: Math.floor(Math.random() * 12) + 1,
      };
    });
  } else if (period === 'weekly') {
    return Array(4).fill(0).map((_, i) => {
      return {
        name: `Week ${i+1}`,
        water: Math.floor(Math.random() * 30) + 15,
        road: Math.floor(Math.random() * 40) + 10,
        waste: Math.floor(Math.random() * 25) + 5,
        other: Math.floor(Math.random() * 20) + 8,
      };
    });
  } else {
    return Array(6).fill(0).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      return {
        name: date.toLocaleDateString('en-US', { month: 'short' }),
        water: Math.floor(Math.random() * 80) + 40,
        road: Math.floor(Math.random() * 120) + 30,
        waste: Math.floor(Math.random() * 60) + 20,
        other: Math.floor(Math.random() * 50) + 30,
      };
    });
  }
}

function getMockResolutionData() {
  return [
    { name: 'Water Issues', time: Math.floor(Math.random() * 72) + 24 },
    { name: 'Road Damage', time: Math.floor(Math.random() * 120) + 48 },
    { name: 'Waste Issues', time: Math.floor(Math.random() * 48) + 12 },
    { name: 'Street Lights', time: Math.floor(Math.random() * 36) + 24 },
    { name: 'Tree Hazards', time: Math.floor(Math.random() * 24) + 12 },
  ];
}
