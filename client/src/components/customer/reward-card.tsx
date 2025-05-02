import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CustomerReward } from "@/types";
import { Gift, Calendar, Check, AlertCircle } from "lucide-react";

interface RewardCardProps {
  reward: CustomerReward;
  showRedeem?: boolean;
}

export default function RewardCard({ reward, showRedeem = false }: RewardCardProps) {
  const { toast } = useToast();

  const redeemRewardMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      const res = await apiRequest("POST", `/api/customer/rewards/${rewardId}/redeem`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customer/profile"] });
      toast({
        title: "Reward redeemed",
        description: "Your reward has been successfully redeemed!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Redemption failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRedeem = () => {
    if (window.confirm("Are you sure you want to redeem this reward?")) {
      redeemRewardMutation.mutate(reward.id);
    }
  };

  // Get type-specific info
  let typeIcon = <Gift className="h-5 w-5 text-primary" />;
  let typeLabel = "";
  let valueLabel = "";

  if (reward.type === "discount") {
    typeLabel = "Discount";
    valueLabel = `${reward.value}% Off`;
  } else if (reward.type === "free_item") {
    typeLabel = "Free Item";
    valueLabel = `Worth ₹${reward.value}`;
  } else {
    typeLabel = "Coupon";
    valueLabel = `₹${reward.value} Value`;
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
              {typeIcon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{reward.name}</h3>
              <p className="text-sm text-gray-600">{typeLabel}</p>
            </div>
          </div>
          {reward.isRedeemed ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Redeemed
            </Badge>
          ) : reward.expiresAt ? (
            <Badge variant={
              new Date(reward.expiresAt) < new Date() 
              ? "outline" 
              : "default"
            }
            className={
              new Date(reward.expiresAt) < new Date()
              ? "bg-red-100 text-red-800"
              : ""
            }>
              {new Date(reward.expiresAt) < new Date() 
              ? "Expired" 
              : "Active"}
            </Badge>
          ) : (
            <Badge>Active</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-gray-700 mb-3">{reward.description}</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Value</span>
            <span className="font-medium">{valueLabel}</span>
          </div>

          {reward.expiresAt && (
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
              <span className={`${
                new Date(reward.expiresAt) < new Date() 
                ? "text-red-500" 
                : "text-gray-500"
              }`}>
                {new Date(reward.expiresAt) < new Date() 
                ? "Expired on " 
                : "Expires on "}
                {new Date(reward.expiresAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {reward.isRedeemed && reward.redeemedAt && (
            <div className="flex items-center text-sm">
              <Check className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-gray-500">
                Redeemed on {new Date(reward.redeemedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      {showRedeem && !reward.isRedeemed && (
        <CardFooter className="border-t p-4">
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            onClick={handleRedeem}
            disabled={redeemRewardMutation.isPending || (reward.expiresAt && new Date(reward.expiresAt) < new Date())}
          >
            {redeemRewardMutation.isPending ? "Redeeming..." : "Redeem Now"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
