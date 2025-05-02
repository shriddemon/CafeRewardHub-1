import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import OwnerSidebar from "@/components/owner/sidebar";
import OrderTable from "@/components/owner/order-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order } from "@/types";
import { Loader2, Search, Download, Filter } from "lucide-react";

export default function OwnerOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/owner/orders"],
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <OwnerSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  // Filter orders based on status and search term
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) || 
                       order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const completedOrders = orders?.filter(o => o.status === "completed").length || 0;
  const cancelledOrders = orders?.filter(o => o.status === "cancelled").length || 0;
  
  const totalRevenue = orders
    ?.filter(o => o.status === "completed")
    .reduce((sum, order) => sum + order.amount, 0) || 0;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <OwnerSidebar />
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Orders</h1>
            <p className="text-gray-600">Manage and track all orders from your customers</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <h3 className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                    <line x1="2" y1="20" x2="2" y2="20"></line>
                  </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <h3 className="text-2xl font-bold">{pendingOrders}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Order List</CardTitle>
                <CardDescription>
                  View and manage all your cafe's orders
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
                    <TabsTrigger value="pending">Pending ({pendingOrders})</TabsTrigger>
                    <TabsTrigger value="completed">Completed ({completedOrders})</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled ({cancelledOrders})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OrderTable orders={displayOrders} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
