import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import OwnerSidebar from "@/components/owner/sidebar";
import RewardForm from "@/components/owner/reward-form";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Reward } from "@/types";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OwnerRewards() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  
  const { data: rewards, isLoading } = useQuery<Reward[]>({
    queryKey: ["/api/owner/rewards"],
  });
  
  const toggleRewardMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const res = await apiRequest("PATCH", `/api/owner/rewards/${id}/toggle`, { isActive });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/rewards"] });
      toast({
        title: "Reward updated",
        description: "Reward status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteRewardMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/owner/rewards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/rewards"] });
      toast({
        title: "Reward deleted",
        description: "Reward has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleToggleReward = (id: number, currentStatus: boolean) => {
    toggleRewardMutation.mutate({ id, isActive: !currentStatus });
  };
  
  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward);
    setIsDialogOpen(true);
  };
  
  const handleDeleteReward = (id: number) => {
    if (window.confirm("Are you sure you want to delete this reward?")) {
      deleteRewardMutation.mutate(id);
    }
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingReward(null);
  };

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
  
  const activeRewards = rewards?.filter(reward => reward.isActive) || [];
  const inactiveRewards = rewards?.filter(reward => !reward.isActive) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <OwnerSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Reward Programs</h1>
            <p className="text-gray-600">Create and manage your cafe's reward programs</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Add New Reward
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <RewardForm 
                initialData={editingReward} 
                onClose={handleCloseDialog} 
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Rewards ({activeRewards.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Rewards ({inactiveRewards.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRewards.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No active rewards found. Create a new reward to get started.</p>
                </div>
              ) : (
                activeRewards.map((reward) => (
                  <RewardCard 
                    key={reward.id} 
                    reward={reward} 
                    onToggle={handleToggleReward}
                    onEdit={handleEditReward}
                    onDelete={handleDeleteReward}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="inactive">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveRewards.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No inactive rewards found.</p>
                </div>
              ) : (
                inactiveRewards.map((reward) => (
                  <RewardCard 
                    key={reward.id} 
                    reward={reward} 
                    onToggle={handleToggleReward}
                    onEdit={handleEditReward}
                    onDelete={handleDeleteReward}
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface RewardCardProps {
  reward: Reward;
  onToggle: (id: number, currentStatus: boolean) => void;
  onEdit: (reward: Reward) => void;
  onDelete: (id: number) => void;
}

function RewardCard({ reward, onToggle, onEdit, onDelete }: RewardCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{reward.name}</CardTitle>
            <CardDescription>{reward.points} points required</CardDescription>
          </div>
          <Badge variant={reward.isActive ? "default" : "outline"}>
            {reward.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-gray-600 mb-4">{reward.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type</span>
            <span className="font-medium">
              {reward.type === "discount" ? "Discount" : 
               reward.type === "free_item" ? "Free Item" : "Coupon"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Value</span>
            <span className="font-medium">
              {reward.type === "discount" ? `${reward.value}% Off` : `₹${reward.value}`}
            </span>
          </div>
          {reward.expiryDays && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Expiry</span>
              <span className="font-medium">{reward.expiryDays} days after issue</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t flex justify-between pt-4">
        <div className="flex items-center">
          <Switch 
            checked={reward.isActive} 
            onCheckedChange={() => onToggle(reward.id, reward.isActive)} 
            id={`toggle-${reward.id}`}
          />
          <label htmlFor={`toggle-${reward.id}`} className="ml-2 text-sm text-gray-500">
            {reward.isActive ? "Active" : "Inactive"}
          </label>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => onEdit(reward)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => onDelete(reward.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
