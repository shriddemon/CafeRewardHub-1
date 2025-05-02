import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import CustomerSidebar from "@/components/customer/sidebar";
import RewardCard from "@/components/customer/reward-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Gift } from "lucide-react";
import { CustomerReward } from "@/types";
import { Link } from "wouter";

export default function CustomerRewards() {
  const { user } = useAuth();
  
  const { data: rewards, isLoading } = useQuery<CustomerReward[]>({
    queryKey: ["/api/customer/rewards"],
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
  
  // Filter rewards based on active/redeemed status
  const activeRewards = rewards?.filter(reward => !reward.isRedeemed) || [];
  const redeemedRewards = rewards?.filter(reward => reward.isRedeemed) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Rewards</h1>
            <p className="text-gray-600">View and redeem your cafe rewards</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" asChild>
            <Link href="/customer/games">Earn More Rewards</Link>
          </Button>
        </div>
        
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Rewards ({activeRewards.length})</TabsTrigger>
            <TabsTrigger value="redeemed">Redeemed History ({redeemedRewards.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {activeRewards.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You don't have any active rewards yet.</p>
                  <p className="text-gray-500">Play games or make purchases to earn rewards!</p>
                  <Button className="mt-4 bg-primary hover:bg-primary/90" asChild>
                    <Link href="/customer/games">Play Games to Earn</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} showRedeem={true} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="redeemed">
            {redeemedRewards.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">You haven't redeemed any rewards yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {redeemedRewards.map((reward) => (
                  <RewardCard key={reward.id} reward={reward} showRedeem={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Rewards Work</CardTitle>
            <CardDescription>Learn how to earn and redeem rewards at our cafe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <span className="font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium">Earn Points</h3>
                <p className="text-sm text-gray-600">
                  Earn points with every purchase. Each ₹100 spent gives you 10 points.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <span className="font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium">Play Games</h3>
                <p className="text-sm text-gray-600">
                  Boost your points faster by playing our daily games like Spin Wheel and Scratch Cards.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <span className="font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium">Redeem Rewards</h3>
                <p className="text-sm text-gray-600">
                  Unlock exciting rewards with your points. Just show the QR code in-store to redeem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
