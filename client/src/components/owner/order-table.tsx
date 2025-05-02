import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Order } from "@/types";
import { MoreHorizontal, Eye, CheckCircle, XCircle, Printer } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
}

export default function OrderTable({ orders }: OrderTableProps) {
  const { toast } = useToast();
  
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/owner/orders/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/orders"] });
      toast({
        title: "Order status updated",
        description: "The order status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleUpdateStatus = (id: number, status: "completed" | "cancelled") => {
    updateOrderStatusMutation.mutate({ id, status });
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Points</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No orders found.
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      {order.customerName?.charAt(0) || "C"}
                    </div>
                    <span>{order.customerName || "Unknown"}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">₹{order.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={order.type === "dine_in" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                    {order.type === "dine_in" ? "Dine In" : "Online"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    }
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-primary font-medium">+{order.pointsEarned}</span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      
                      {order.status === "pending" && (
                        <>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            <span>Mark as Completed</span>
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleUpdateStatus(order.id, "cancelled")}
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-600" />
                            <span>Cancel Order</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuItem className="cursor-pointer">
                        <Printer className="mr-2 h-4 w-4" />
                        <span>Print Receipt</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
