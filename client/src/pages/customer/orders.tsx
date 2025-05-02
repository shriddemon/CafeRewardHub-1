import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import CustomerSidebar from "@/components/customer/sidebar";
import OrderCard from "@/components/customer/order-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ShoppingBag } from "lucide-react";
import { Order } from "@/types";

export default function CustomerOrders() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders"],
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <CustomerSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  // Filter orders based on search term and status
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm);
    
    if (activeTab === "all") return matchesSearch;
    return order.status === activeTab && matchesSearch;
  }) || [];
  
  // Filter orders based on date
  const getFilteredOrdersByDate = () => {
    if (dateFilter === "all") return filteredOrders;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    return filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      if (dateFilter === "today") {
        return orderDate >= today;
      }
      if (dateFilter === "yesterday") {
        return orderDate >= yesterday && orderDate < today;
      }
      if (dateFilter === "last7days") {
        return orderDate >= lastWeek;
      }
      if (dateFilter === "last30days") {
        return orderDate >= lastMonth;
      }
      return true;
    });
  };
  
  const displayOrders = getFilteredOrdersByDate();
  
  // Count orders by status
  const pendingCount = orders?.filter(o => o.status === "pending").length || 0;
  const completedCount = orders?.filter(o => o.status === "completed").length || 0;
  const cancelledCount = orders?.filter(o => o.status === "cancelled").length || 0;
  
  // Calculate total spent
  const totalSpent = orders
    ?.filter(o => o.status === "completed")
    .reduce((sum, order) => sum + order.amount, 0) || 0;
  
  // Calculate total points earned
  const totalPoints = orders
    ?.filter(o => o.status === "completed")
    .reduce((sum, order) => sum + order.pointsEarned, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar />
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-gray-600">View and track your order history</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by order ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              New Order
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <h3 className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <h3 className="text-2xl font-bold">{orders?.length || 0}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Points Earned</p>
                  <h3 className="text-2xl font-bold">{totalPoints}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Order History</CardTitle>
                <CardDescription>
                  View details of all your past and current orders
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="yesterday">Yesterday</SelectItem>
                    <SelectItem value="last7days">Last 7 days</SelectItem>
                    <SelectItem value="last30days">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
                
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled ({cancelledCount})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {displayOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found.</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90">
                  Place New Order
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {displayOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
