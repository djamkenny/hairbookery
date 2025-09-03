import React, { useState } from "react";
import { LaundryOrder } from "@/types/laundry";
import { LaundryAppointmentCard } from "./LaundryAppointmentCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, Package } from "lucide-react";
import { LAUNDRY_STATUS_LABELS } from "@/types/laundry";

interface LaundryAppointmentsListProps {
  orders: (LaundryOrder & { client_name?: string; client_phone?: string })[];
  loading: boolean;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onViewDetails: (order: LaundryOrder) => void;
}

export const LaundryAppointmentsList: React.FC<LaundryAppointmentsListProps> = ({
  orders,
  loading,
  onUpdateStatus,
  onViewDetails
}) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = !searchQuery || 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.client_name && order.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.pickup_address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, client name, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(LAUNDRY_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(statusFilter !== "all" || searchQuery) && (
          <Button 
            variant="outline" 
            onClick={clearFilters}
            className="px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No cleaning orders found</h3>
          <p className="text-muted-foreground">
            {statusFilter !== "all" || searchQuery 
              ? "Try adjusting your filters to see more orders."
              : "You don't have any cleaning orders yet."
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map(order => (
            <LaundryAppointmentCard
              key={order.id}
              order={order}
              onUpdateStatus={onUpdateStatus}
              onViewDetails={() => onViewDetails(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
};