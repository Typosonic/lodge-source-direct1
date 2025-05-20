import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GradientButton } from "@/components/ui/gradient-button";
import { cn } from "@/lib/utils";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: "unfulfilled" | "fulfilled" | "processing" | "cancelled";
  items: OrderItem[];
  totalPrice: number;
  date: string;
  trackingNumber?: string;
  shippingProvider?: string;
  shippingName?: string;
  shippingStreet?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;
  shippingPhone?: string;
}

interface OrderCardProps {
  order: Order;
  className?: string;
}

const OrderCard = ({ order, className }: OrderCardProps) => {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "fulfilled":
        return "bg-green-600/20 text-green-400 border-green-600/30";
      case "processing":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30";
      case "cancelled":
        return "bg-red-600/20 text-red-400 border-red-600/30";
      default:
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
    }
  };

  return (
    <div className={cn("bg-lodge-card-bg border border-white/10 rounded-lg overflow-hidden", className)}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60">Order #{order.id.slice(0, 8)}</p>
          <p className="text-xs text-white/40">{order.date}</p>
        </div>
        <Badge className={cn("font-medium", getStatusColor(order.status))}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium mb-2">Order Items</h3>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between text-sm">
              <span className="text-white/80">
                {item.quantity}x {item.name}
              </span>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        {/* Shipping Details */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <h4 className="text-xs font-semibold mb-1 text-white/70">Shipping Details</h4>
          <div className="text-xs text-white/60 space-y-1">
            {order.shippingProvider && <div><b>Provider:</b> {order.shippingProvider.toUpperCase()}</div>}
            {order.shippingName && <div><b>Name:</b> {order.shippingName}</div>}
            {order.shippingStreet && <div><b>Address:</b> {order.shippingStreet}</div>}
            {order.shippingCity && <span>{order.shippingCity}, </span>}
            {order.shippingState && <span>{order.shippingState} </span>}
            {order.shippingZip && <span>{order.shippingZip}</span>}
            {order.shippingCountry && <div><b>Country:</b> {order.shippingCountry}</div>}
            {order.shippingPhone && <div><b>Phone:</b> {order.shippingPhone}</div>}
          </div>
        </div>
        <div className="border-t border-white/10 mt-4 pt-4 flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lodge-purple">${order.totalPrice.toFixed(2)}</span>
        </div>
        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm font-medium mb-1">Tracking Number:</p>
            <div className="flex items-center justify-between">
              <code className="bg-lodge-dark-bg px-3 py-1 rounded text-sm flex-grow">{order.trackingNumber}</code>
              <GradientButton className="ml-2 text-xs px-3 py-1 h-8">Track</GradientButton>
            </div>
          </div>
        )}
        {order.status === "unfulfilled" && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
            <GradientButton className="text-xs px-3 py-1 h-8">Contact Support</GradientButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
