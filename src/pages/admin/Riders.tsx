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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockRiders, mockOrders, mockUsers } from "@/lib/mockData";
import { Eye } from "lucide-react";
import type { Rider } from "@/lib/mockData";

const Riders = () => {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  const getRiderOrders = (riderId: string) =>
    mockOrders.filter((order) => order.riderId === riderId);

  const getUser = (userId: string) => mockUsers.find((u) => u.id === userId);

  const getStatusColor = (status: Rider["status"]) => {
    const colors = {
      online: "bg-green-100 text-green-800",
      offline: "bg-gray-100 text-gray-800",
      "on-delivery": "bg-blue-100 text-blue-800",
    };
    return colors[status];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Riders Management</h1>
        <p className="text-muted-foreground">View and manage delivery riders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Riders ({mockRiders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Orders</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Earnings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRiders.map((rider) => (
                <TableRow key={rider.id}>
                  <TableCell className="font-medium">{rider.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{rider.email}</p>
                      <p className="text-muted-foreground">{rider.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(rider.status)}>
                      {rider.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{rider.currentOrders.length}</TableCell>
                  <TableCell>{rider.completedOrders}</TableCell>
                  <TableCell>Rs. {rider.earnings}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRider(rider)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Rider Details Dialog */}
      <Dialog open={!!selectedRider} onOpenChange={() => setSelectedRider(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Rider Details - {selectedRider?.name}</DialogTitle>
          </DialogHeader>
          {selectedRider && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Contact Information</h3>
                  <p className="text-sm">Email: {selectedRider.email}</p>
                  <p className="text-sm">Phone: {selectedRider.phone}</p>
                  <p className="text-sm">
                    Status:{" "}
                    <Badge className={getStatusColor(selectedRider.status)}>
                      {selectedRider.status}
                    </Badge>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Performance</h3>
                  <p className="text-sm">
                    Completed Deliveries: {selectedRider.completedOrders}
                  </p>
                  <p className="text-sm">
                    Total Earnings: Rs. {selectedRider.earnings}
                  </p>
                  <p className="text-sm">
                    Current Orders: {selectedRider.currentOrders.length}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Delivery History</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getRiderOrders(selectedRider.id).map((order) => {
                    const user = getUser(order.userId);
                    return (
                      <Card key={order.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{order.id}</p>
                              <p className="text-sm text-muted-foreground">
                                Customer: {user?.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.deliveryAddress}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">Rs. {order.total}</p>
                              <Badge>{order.status}</Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <p className="font-medium">Items:</p>
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-muted-foreground">
                                • {item.menuItem.name} x {item.quantity}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Riders;
