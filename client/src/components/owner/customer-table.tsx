import { useState } from "react";
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
import { Customer } from "@/types";
import { MoreHorizontal, Eye, Edit, MessageSquare, Trophy } from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
}

export default function CustomerTable({ customers }: CustomerTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Last Visit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
                      {customer.name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <div className="font-medium">{customer.name || "Unknown"}</div>
                      <div className="text-xs text-gray-500">
                        {customer.phone || "No phone"}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{customer.points}</div>
                </TableCell>
                <TableCell>{customer.totalOrders}</TableCell>
                <TableCell>₹{customer.totalSpent?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  {customer.lastVisit
                    ? new Date(customer.lastVisit).toLocaleDateString()
                    : "Never"}
                </TableCell>
                <TableCell>
                  {customer.lastVisit && new Date(customer.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? (
                    <Badge variant="outline" className="text-green-600 bg-green-50">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600 bg-gray-50">
                      Inactive
                    </Badge>
                  )}
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
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit Customer</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Send Message</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer">
                        <Trophy className="mr-2 h-4 w-4" />
                        <span>Send Reward</span>
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
