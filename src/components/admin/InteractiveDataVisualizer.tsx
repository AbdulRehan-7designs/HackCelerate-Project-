
import { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  ChartBar, LineChart as LineChartIcon, PieChart as PieChartIcon, 
  Calendar, RefreshCcw, Download, Share2, Filter
} from 'lucide-react';

// Mock data for visualization
const generateMockData = () => {
  const categories = ['Road Issues', 'Water Problems', 'Lighting', 'Garbage', 'Noise', 'Safety'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const districts = ['Downtown', 'North', 'South', 'East', 'West', 'Central'];
  
  // For line/bar charts (time-based)
  const timeData = months.map(month => {
    const obj: Record<string, any> = { month };
    categories.forEach(cat => {
      obj[cat] = Math.floor(Math.random() * 100) + 10;
    });
    return obj;
  });
  
  // For pie chart (category distribution)
  const categoryData = categories.map(name => ({
    name,
    value: Math.floor(Math.random() * 1000) + 200
  }));
  
  // For regional data
  const regionalData = districts.map(name => {
    const obj: Record<string, any> = { name };
    categories.forEach(cat => {
      obj[cat] = Math.floor(Math.random() * 50) + 5;
    });
    return obj;
  });
  
  return { timeData, categoryData, regionalData };
};

interface InteractiveDataVisualizerProps {
  className?: string;
}

const InteractiveDataVisualizer = ({ className }: InteractiveDataVisualizerProps) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [dataView, setDataView] = useState<'time' | 'category' | 'region'>('time');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState(() => generateMockData());

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(generateMockData());
      setIsRefreshing(false);
    }, 800);
  };

  // Custom colors for visualization
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

  const renderChart = () => {
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={dataView === 'region' ? data.regionalData : data.timeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataView === 'region' ? 'name' : 'month'} />
            <YAxis />
            <Tooltip />
            <Legend />
            {dataView === 'time' ? (
              <>
                <Bar dataKey="Road Issues" fill="#8884d8" />
                <Bar dataKey="Water Problems" fill="#82ca9d" />
                <Bar dataKey="Lighting" fill="#ffc658" />
              </>
            ) : (
              <>
                <Bar dataKey="Road Issues" fill="#8884d8" />
                <Bar dataKey="Safety" fill="#82ca9d" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={dataView === 'region' ? data.regionalData : data.timeData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataView === 'region' ? 'name' : 'month'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Road Issues" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="Water Problems" stroke="#82ca9d" />
            <Line type="monotone" dataKey="Garbage" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data.categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.categoryData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">Interactive Issue Analytics</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData} 
              disabled={isRefreshing}
            >
              <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center space-x-1">
            <Button 
              variant={chartType === 'bar' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('bar')}
              className={chartType === 'bar' ? 'bg-blue-600' : ''}
            >
              <ChartBar className="h-4 w-4 mr-1" />
              Bar
            </Button>
            <Button 
              variant={chartType === 'line' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('line')}
              className={chartType === 'line' ? 'bg-blue-600' : ''}
            >
              <LineChartIcon className="h-4 w-4 mr-1" />
              Line
            </Button>
            <Button 
              variant={chartType === 'pie' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setChartType('pie')}
              className={chartType === 'pie' ? 'bg-blue-600' : ''}
            >
              <PieChartIcon className="h-4 w-4 mr-1" />
              Pie
            </Button>
          </div>
          
          <div className="flex-grow"></div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select 
              value={dataView} 
              onValueChange={(v) => setDataView(v as 'time' | 'category' | 'region')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time-based</SelectItem>
                <SelectItem value="region">Regional</SelectItem>
                <SelectItem value="category">Categorical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {renderChart()}
      </div>
      
      <div className="p-4 bg-blue-50 border-t">
        <p className="text-sm text-blue-700">
          <strong>AI Insight:</strong> Analysis shows a 23% increase in reporting rates when comparing this month to last month. The highest growth is observed in Road Issues category.
        </p>
      </div>
    </Card>
  );
};

export default InteractiveDataVisualizer;
