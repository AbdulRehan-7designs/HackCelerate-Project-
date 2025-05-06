
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface IssueFiltersProps {
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAreaFilterChange: (value: string) => void;
  searchTerm: string;
  statusFilter: string;
  selectedArea: string;
}

const IssueFilters = ({ 
  onSearchChange, 
  onStatusFilterChange, 
  onAreaFilterChange,
  searchTerm,
  statusFilter,
  selectedArea
}: IssueFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search issues..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <div className="w-40">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
          <Select value={selectedArea} onValueChange={onAreaFilterChange}>
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
  );
};

export default IssueFilters;
