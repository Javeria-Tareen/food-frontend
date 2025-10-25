import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingBag, Bike, DollarSign, Clock, Package } from "lucide-react";
import { mockOrders, mockUsers, mockRiders } from "@/lib/mockData";

const Dashboard = () => {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = mockOrders.filter(
    (order) => order.status === "preparing" || order.status === "out-for-delivery"
  ).length;
  const pendingDeliveries = mockOrders.filter(
    (order) => order.status === "out-for-delivery"
  ).length;

  const stats = [
    {
      title: "Total Users",
      value: mockUsers.length,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Orders",
      value: mockOrders.length,
      icon: ShoppingBag,
      color: "text-green-500",
    },
    {
      title: "Total Riders",
      value: mockRiders.length,
      icon: Bike,
      color: "text-purple-500",
    },
    {
      title: "Total Revenue",
      value: `Rs. ${totalRevenue}`,
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: "Active Orders",
      value: activeOrders,
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Pending Deliveries",
      value: pendingDeliveries,
      icon: Package,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your restaurant's performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Rs. {order.total}</p>
                  <span
                    className={`inline-block rounded-full px-2 py-1 text-xs ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "out-for-delivery"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
