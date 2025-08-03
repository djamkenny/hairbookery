
import React from "react";
import { Filter, Search, CalendarDays } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";
import { Appointment } from "@/types/appointment";

interface AppointmentFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortKey: keyof Appointment | undefined;
  sortDirection: 'asc' | 'desc';
  handleSort: (key: keyof Appointment) => void;
  clearFilters: () => void;
}

const AppointmentFilters = ({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  sortKey,
  sortDirection,
  handleSort,
  clearFilters
}: AppointmentFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 max-w-xs"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2">
        <ToggleGroup type="single" variant="outline">
          <ToggleGroupItem value="date" onClick={() => handleSort('date')}>
            <CalendarDays className="h-4 w-4 mr-1" />
            Date {sortKey === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </ToggleGroupItem>
          <ToggleGroupItem value="client" onClick={() => handleSort('client')}>
            Client {sortKey === 'client' && (sortDirection === 'asc' ? '↑' : '↓')}
          </ToggleGroupItem>
          <ToggleGroupItem value="status" onClick={() => handleSort('status')}>
            Status {sortKey === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
          </ToggleGroupItem>
        </ToggleGroup>
        
        {(statusFilter !== "all" || searchQuery || sortKey) && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentFilters;
