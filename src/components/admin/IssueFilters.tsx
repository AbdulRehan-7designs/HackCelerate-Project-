
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X, Calendar, Calendar as CalendarIcon } from "lucide-react";
import { issueCategories } from "@/utils/mockData";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface IssueFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAreaFilterChange: (value: string) => void;
  onCategoryFilterChange?: (value: string) => void;
  onDateFilterChange?: (date: Date | undefined) => void;
  searchTerm: string;
  statusFilter: string;
  selectedArea: string;
  categoryFilter?: string;
  dateFilter?: Date;
}

const IssueFilters = ({ 
  onSearchChange, 
  onStatusFilterChange, 
  onAreaFilterChange,
  onCategoryFilterChange,
  onDateFilterChange,
  searchTerm,
  statusFilter,
  selectedArea,
  categoryFilter = 'all',
  dateFilter
}: IssueFiltersProps) => {
  const [date, setDate] = useState<Date | undefined>(dateFilter);

  useEffect(() => {
    if (onDateFilterChange && date) {
      onDateFilterChange(date);
    }
  }, [date, onDateFilterChange]);

  const handleClearFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onAreaFilterChange('all');
    if (onCategoryFilterChange) onCategoryFilterChange('all');
    if (onDateFilterChange) onDateFilterChange(undefined);
    setDate(undefined);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            className="pl-8 pr-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="absolute right-2.5 top-2.5" 
              onClick={handleClearSearch}
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="w-32">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="fake">Fake</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-32">
            <Select value={selectedArea} onValueChange={onAreaFilterChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span>Area</span>
                </div>
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
          
          {onCategoryFilterChange && (
            <div className="w-32">
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Category</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {issueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {onDateFilterChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-[200px] justify-start text-left font-normal ${
                    !date && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearFilters}
            className="text-gray-500"
          >
            Clear Filters
          </Button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {searchTerm && (
          <Badge onX={() => onSearchChange('')}>
            Search: {searchTerm}
          </Badge>
        )}
        {statusFilter !== 'all' && (
          <Badge onX={() => onStatusFilterChange('all')}>
            Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
          </Badge>
        )}
        {selectedArea !== 'all' && (
          <Badge onX={() => onAreaFilterChange('all')}>
            Area: {selectedArea.charAt(0).toUpperCase() + selectedArea.slice(1)}
          </Badge>
        )}
        {categoryFilter !== 'all' && onCategoryFilterChange && (
          <Badge onX={() => onCategoryFilterChange('all')}>
            Category: {categoryFilter}
          </Badge>
        )}
        {date && onDateFilterChange && (
          <Badge onX={() => {setDate(undefined); onDateFilterChange(undefined);}}>
            Date: {format(date, "MMM d, yyyy")}
          </Badge>
        )}
      </div>
    </div>
  );
};

// Custom Badge component that extends the shadcn/ui Badge
const Badge = ({ children, onX }: { children: React.ReactNode; onX: () => void }) => {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
      {children}
      <button onClick={onX} className="ml-1.5 text-gray-500 hover:text-gray-700">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default IssueFilters;
