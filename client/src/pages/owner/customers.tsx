import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import OwnerSidebar from "@/components/owner/sidebar";
import CustomerTable from "@/components/owner/customer-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types";
import { Loader2, Search, Download, UserPlus } from "lucide-react";

export default function OwnerCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/owner/customers"],
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
  
  // Filter customers based on search term
  const filteredCustomers = customers?.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Filter customers based on active tab
  const getFilteredCustomers = () => {
    if (activeTab === "all") return filteredCustomers;
    if (activeTab === "active") return filteredCustomers.filter(c => c.lastVisit && new Date(c.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    if (activeTab === "inactive") return filteredCustomers.filter(c => !c.lastVisit || new Date(c.lastVisit) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    return filteredCustomers;
  };
  
  const activeCustomers = filteredCustomers.filter(c => c.lastVisit && new Date(c.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
  const inactiveCustomers = filteredCustomers.length - activeCustomers;
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <OwnerSidebar />
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-gray-600">Manage and analyze your cafe's customers</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              <span>Add Customer</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <h3 className="text-2xl font-bold">{filteredCustomers.length}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Customers</p>
                  <h3 className="text-2xl font-bold">{activeCustomers}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inactive Customers</p>
                  <h3 className="text-2xl font-bold">{inactiveCustomers}</h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <div className="flex justify-between items-center">
                <CardTitle>Customer List</CardTitle>
                <TabsList>
                  <TabsTrigger value="all">All ({filteredCustomers.length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({activeCustomers})</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive ({inactiveCustomers})</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                View and manage all your cafe's customers
              </CardDescription>
            </Tabs>
          </CardHeader>
          <CardContent>
            <CustomerTable customers={getFilteredCustomers()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
