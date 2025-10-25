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
import { mockUsers, mockOrders, mockRiders } from "@/lib/mockData";
import { Eye } from "lucide-react";
import type { User } from "@/lib/mockData";

const Users = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getUserOrders = (userId: string) =>
    mockOrders.filter((order) => order.userId === userId);

  const getRider = (riderId?: string) =>
    riderId ? mockRiders.find((r) => r.id === riderId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">View and manage registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({mockUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => {
                const userOrders = getUserOrders(user.id);
                const lastOrder = userOrders[userOrders.length - 1];
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{userOrders.length}</TableCell>
                    <TableCell>
                      {lastOrder
                        ? new Date(lastOrder.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
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

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Details - {selectedUser?.name}</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Contact Information</h3>
                  <p className="text-sm">Email: {selectedUser.email}</p>
                  <p className="text-sm">Phone: {selectedUser.phone}</p>
                  <p className="text-sm">Address: {selectedUser.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Statistics</h3>
                  <p className="text-sm">
                    Total Orders: {getUserOrders(selectedUser.id).length}
                  </p>
                  <p className="text-sm">
                    Total Spent: Rs.{" "}
                    {getUserOrders(selectedUser.id).reduce(
                      (sum, order) => sum + order.total,
                      0
                    )}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order History</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getUserOrders(selectedUser.id).map((order) => (
                    <Card key={order.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.length} items • Rs. {order.total}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rider: {getRider(order.riderId)?.name || "Not Assigned"}
                            </p>
                          </div>
                          <div className="text-right">
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
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
