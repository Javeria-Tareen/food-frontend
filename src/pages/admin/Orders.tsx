import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockOrders, mockUsers, mockRiders } from "@/lib/mockData";
import { Eye } from "lucide-react";
import type { Order } from "@/lib/mockData";

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const filteredOrders = mockOrders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const getUser = (userId: string) => mockUsers.find((u) => u.id === userId);
  const getRider = (riderId?: string) =>
    riderId ? mockRiders.find((r) => r.id === riderId) : null;

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      preparing: "bg-blue-100 text-blue-800",
      "out-for-delivery": "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">View and manage all customer orders</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "preparing", "out-for-delivery", "delivered", "cancelled"].map(
          (status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status === "all" ? "All Orders" : status.replace("-", " ")}
            </Button>
          )
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Rider</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const user = getUser(order.userId);
                const rider = getRider(order.riderId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{user?.name || "Unknown"}</TableCell>
                    <TableCell>{rider?.name || "Not Assigned"}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>Rs. {order.total}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Customer</h3>
                  <p>{getUser(selectedOrder.userId)?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getUser(selectedOrder.userId)?.email}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Rider</h3>
                  <p>{getRider(selectedOrder.riderId)?.name || "Not Assigned"}</p>
                  <p className="text-sm text-muted-foreground">
                    {getRider(selectedOrder.riderId)?.phone}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="text-sm">{selectedOrder.deliveryAddress}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between border-b pb-2"
                    >
                      <span>
                        {item.menuItem.name} x {item.quantity}
                      </span>
                      <span>Rs. {item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span>Rs. {selectedOrder.total}</span>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <Badge>{selectedOrder.paymentMethod.toUpperCase()}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
