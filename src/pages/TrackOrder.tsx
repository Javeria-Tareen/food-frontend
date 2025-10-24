import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Clock, Truck, CheckCircle, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useStore } from "@/lib/store";

export const TrackOrder = () => {
  const { orderId } = useParams();
  const orders = useStore((state) => state.orders);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
          <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const statuses = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "preparing", label: "Preparing", icon: Clock },
    { key: "out-for-delivery", label: "Out for Delivery", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Track Your Order</h1>
          <p className="text-muted-foreground">Order ID: {order.id}</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl p-8 shadow-sm border"
            >
              <h2 className="text-2xl font-bold mb-8">Order Status</h2>

              <div className="relative">
                {statuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={status.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-center gap-6 mb-8 last:mb-0"
                    >
                      {/* Connector Line */}
                      {index < statuses.length - 1 && (
                        <div
                          className={`absolute left-6 top-14 w-0.5 h-full -translate-x-1/2 ${
                            isCompleted ? "bg-primary" : "bg-border"
                          }`}
                        />
                      )}

                      {/* Status Icon */}
                      <div
                        className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-warm"
                            : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "scale-110" : ""}`}
                      >
                        <StatusIcon className="h-6 w-6" />
                      </div>

                      {/* Status Info */}
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-lg ${
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {status.label}
                        </h3>
                        {isCurrent && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-primary font-medium"
                          >
                            In Progress...
                          </motion.p>
                        )}
                        {isCompleted && !isCurrent && (
                          <p className="text-sm text-muted-foreground">Completed</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {order.status === "out-for-delivery" && (
                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-semibold text-primary mb-1">Your order is on the way!</p>
                      <p className="text-sm text-muted-foreground">
                        Expected delivery in 15-20 minutes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-xl p-6 shadow-sm border space-y-6"
            >
              <div>
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.menuItem.name} × {item.quantity}
                      </span>
                      <span className="font-medium">Rs. {item.menuItem.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">Rs. {order.total}</span>
                </div>
                <p className="text-xs text-muted-foreground">Payment Method: {order.paymentMethod.toUpperCase()}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Order Date</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TrackOrder;
