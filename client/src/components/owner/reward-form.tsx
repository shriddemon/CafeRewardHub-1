import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Reward } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const rewardSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  points: z.coerce.number().min(1, "Points must be at least 1"),
  type: z.enum(["discount", "free_item", "coupon"]),
  value: z.coerce.number().min(1, "Value must be at least 1"),
  expiryDays: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

type RewardFormValues = z.infer<typeof rewardSchema>;

interface RewardFormProps {
  initialData: Reward | null;
  onClose: () => void;
}

export default function RewardForm({ initialData, onClose }: RewardFormProps) {
  const { toast } = useToast();
  const isEditing = !!initialData;
  
  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      points: initialData?.points || 100,
      type: initialData?.type || "discount",
      value: initialData?.value || 10,
      expiryDays: initialData?.expiryDays || 30,
      isActive: initialData?.isActive ?? true,
    },
  });
  
  const createRewardMutation = useMutation({
    mutationFn: async (data: RewardFormValues) => {
      const res = await apiRequest("POST", "/api/owner/rewards", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/rewards"] });
      toast({
        title: "Reward created",
        description: "New reward has been created successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateRewardMutation = useMutation({
    mutationFn: async (data: RewardFormValues) => {
      const res = await apiRequest("PATCH", `/api/owner/rewards/${initialData?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/rewards"] });
      toast({
        title: "Reward updated",
        description: "Reward has been updated successfully",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: RewardFormValues) {
    if (isEditing) {
      updateRewardMutation.mutate(data);
    } else {
      createRewardMutation.mutate(data);
    }
  }
  
  const isSubmitting = createRewardMutation.isPending || updateRewardMutation.isPending;
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Reward" : "Create New Reward"}</h2>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reward Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Free Coffee, 20% Discount" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what this reward offers to the customer"
                    className="min-h-[80px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Points Required</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    How many points a customer needs to redeem this reward
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reward Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reward type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="discount">Discount</SelectItem>
                      <SelectItem value="free_item">Free Item</SelectItem>
                      <SelectItem value="coupon">Coupon</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === "discount" ? "Percentage off total bill" : 
                     field.value === "free_item" ? "A free product from the menu" : 
                     "A coupon with a specific value"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("type") === "discount" ? "Discount Percentage" : 
                     form.watch("type") === "free_item" ? "Item Value (₹)" : 
                     "Coupon Value (₹)"}
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    {form.watch("type") === "discount" ? "Percentage discount (e.g., 20 for 20% off)" : 
                     "The value in Indian Rupees"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Period (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Days until reward expires after being issued (0 or empty for no expiry)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Active Reward
                  </FormLabel>
                  <FormDescription>
                    When active, this reward can be earned and redeemed by customers
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{isEditing ? "Update" : "Create"} Reward</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
