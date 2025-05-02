import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  Clock, 
  CreditCard,
  Coffee,
  MapPin
} from "lucide-react";
import { Order, OrderItem } from "@/types";

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sample items for demonstration
  const orderItems: OrderItem[] = order.items || [
    {
      id: 1,
      orderId: order.id,
      name: "Cappuccino",
      price: 120,
      quantity: 2
    },
    {
      id: 2,
      orderId: order.id,
      name: "Chocolate Croissant",
      price: 150,
      quantity: 1
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-orange-100 text-orange-800";
    }
  };

  const getOrderTypeIcon = (type: string) => {
    return type === "dine_in" ? (
      <MapPin className="h-4 w-4 text-blue-600" />
    ) : (
      <ShoppingBag className="h-4 w-4 text-green-600" />
    );
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-0">
        {/* Order Header */}
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="font-bold">Order #{order.id}</h3>
                  <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="font-bold text-lg">₹{order.amount}</span>
            <span className="text-xs text-primary">+{order.pointsEarned} points</span>
          </div>
        </div>
        
        {/* Order Details */}
        <div className="px-4 py-2 bg-gray-50 flex items-center justify-between border-t">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {getOrderTypeIcon(order.type)}
              <span className="text-sm ml-1">
                {order.type === "dine_in" ? "Dine In" : "Online Order"}
              </span>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm ml-1">₹{order.amount}</span>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Expanded Items */}
        {isExpanded && (
          <div className="border-t px-4 py-3">
            <h4 className="font-medium text-sm mb-2">Order Items</h4>
            <div className="space-y-2">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                      <Coffee className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x ₹{item.price}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
              
              <div className="pt-2 mt-2 border-t border-dashed">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxes</span>
                  <span>₹{Math.round(orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05)}</span>
                </div>
                <div className="flex justify-between font-bold mt-1">
                  <span>Total</span>
                  <span>₹{order.amount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-4">
              {order.status === "pending" ? (
                <Button variant="outline" className="text-red-600">
                  Cancel Order
                </Button>
              ) : (
                <Button variant="outline">
                  Reorder
                </Button>
              )}
              <Button variant="outline">
                Get Help
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
