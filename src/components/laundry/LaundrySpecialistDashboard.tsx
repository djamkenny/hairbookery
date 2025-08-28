import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLaundryOrders } from "@/hooks/useLaundryServices";
import { LaundryOrder, LAUNDRY_STATUS_LABELS, LAUNDRY_STATUS_COLORS, LaundryOrderStatus } from "@/types/laundry";
import { format } from "date-fns";
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Phone, 
  User,
  Eye,
  MoreHorizontal,
  Calendar
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export const LaundrySpecialistDashboard: React.FC = () => {
  const { orders, loading, updateOrderStatus } = useLaundryOrders();
  const [selectedOrder, setSelectedOrder] = useState<LaundryOrder | null>(null);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<LaundryOrderStatus>('pending_pickup');
  const [statusNotes, setStatusNotes] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);

  // Filter orders by status for different tabs
  const pendingOrders = orders.filter(order => order.status === 'pending_pickup');
  const activeOrders = orders.filter(order => 
    ['picked_up', 'washing', 'ready', 'out_for_delivery'].includes(order.status)
  );
  const completedOrders = orders.filter(order => order.status === 'delivered');

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    const success = await updateOrderStatus(selectedOrder.id, newStatus, statusNotes);
    if (success) {
      setStatusUpdateDialog(false);
      setSelectedOrder(null);
      setStatusNotes('');
    }
  };

  const openStatusUpdate = (order: LaundryOrder, status: LaundryOrderStatus) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setStatusUpdateDialog(true);
  };

  const openDetails = (order: LaundryOrder) => {
    setSelectedOrder(order);
    setDetailsDialog(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laundry Dashboard</h1>
        <p className="text-muted-foreground">Manage your laundry orders and customer requests</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Pending Pickup</p>
                <p className="text-2xl font-bold">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Active Orders</p>
                <p className="text-2xl font-bold">{activeOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold">{completedOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <OrdersList 
            orders={pendingOrders} 
            onStatusUpdate={openStatusUpdate}
            onViewDetails={openDetails}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <OrdersList 
            orders={activeOrders} 
            onStatusUpdate={openStatusUpdate}
            onViewDetails={openDetails}
          />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <OrdersList 
            orders={completedOrders} 
            onStatusUpdate={openStatusUpdate}
            onViewDetails={openDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateDialog} onOpenChange={setStatusUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Update the status for order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as LaundryOrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_pickup">Pending Pickup</SelectItem>
                  <SelectItem value="picked_up">Picked Up</SelectItem>
                  <SelectItem value="washing">Washing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this status update..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={detailsDialog} onOpenChange={setDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Badge className={LAUNDRY_STATUS_COLORS[selectedOrder.status]}>
                  {LAUNDRY_STATUS_LABELS[selectedOrder.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created {format(new Date(selectedOrder.created_at), 'PPP p')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Pickup Details
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">{selectedOrder.pickup_address}</p>
                    <p className="text-sm">
                      {format(new Date(selectedOrder.pickup_date), 'PPP')} at {selectedOrder.pickup_time}
                    </p>
                    {selectedOrder.pickup_instructions && (
                      <p className="text-sm text-muted-foreground italic">
                        Instructions: {selectedOrder.pickup_instructions}
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Truck className="w-4 h-4 mr-2" />
                      Delivery Details
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {selectedOrder.delivery_address || selectedOrder.pickup_address}
                    </p>
                    {selectedOrder.delivery_date && (
                      <p className="text-sm">
                        {format(new Date(selectedOrder.delivery_date), 'PPP')}
                        {selectedOrder.delivery_time && ` at ${selectedOrder.delivery_time}`}
                      </p>
                    )}
                    {selectedOrder.delivery_instructions && (
                      <p className="text-sm text-muted-foreground italic">
                        Instructions: {selectedOrder.delivery_instructions}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Order Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Service:</span> {selectedOrder.service_type}</p>
                      {selectedOrder.weight_kg && (
                        <p><span className="font-medium">Weight:</span> {selectedOrder.weight_kg}kg</p>
                      )}
                      {selectedOrder.amount && (
                        <p><span className="font-medium">Amount:</span> GH₵{(selectedOrder.amount / 100).toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  {selectedOrder.items_description && (
                    <div>
                      <h4 className="font-semibold mb-2">Items Description</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrder.items_description}</p>
                    </div>
                  )}

                  {selectedOrder.special_instructions && (
                    <div>
                      <h4 className="font-semibold mb-2">Special Instructions</h4>
                      <p className="text-sm text-muted-foreground">{selectedOrder.special_instructions}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface OrdersListProps {
  orders: LaundryOrder[];
  onStatusUpdate: (order: LaundryOrder, status: LaundryOrderStatus) => void;
  onViewDetails: (order: LaundryOrder) => void;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onStatusUpdate, onViewDetails }) => {
  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No orders in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">#{order.order_number}</span>
                  <Badge className={LAUNDRY_STATUS_COLORS[order.status]}>
                    {LAUNDRY_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {order.pickup_address.substring(0, 50)}...
                  </p>
                  <p className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Pickup: {format(new Date(order.pickup_date), 'PPP')} at {order.pickup_time}
                  </p>
                  {order.weight_kg && (
                    <p>Weight: {order.weight_kg}kg</p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {getAvailableStatusTransitions(order.status).map((status) => (
                      <DropdownMenuItem 
                        key={status} 
                        onClick={() => onStatusUpdate(order, status)}
                      >
                        Mark as {LAUNDRY_STATUS_LABELS[status]}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Helper function to get available status transitions
function getAvailableStatusTransitions(currentStatus: LaundryOrderStatus): LaundryOrderStatus[] {
  const statusFlow: Record<LaundryOrderStatus, LaundryOrderStatus[]> = {
    pending_pickup: ['picked_up'],
    picked_up: ['washing'],
    washing: ['ready'],
    ready: ['out_for_delivery'],
    out_for_delivery: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  return statusFlow[currentStatus] || [];
}