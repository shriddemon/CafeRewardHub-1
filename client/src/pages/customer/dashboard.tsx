import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import CustomerSidebar from "@/components/customer/sidebar";
import RewardCard from "@/components/customer/reward-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CoffeeIcon, Gift, Trophy, ArrowRight, Bell } from "lucide-react";
import { CustomerReward, Order } from "@/types";
import { Link } from "wouter";

export default function CustomerDashboard() {
  const { user } = useAuth();
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/customer/profile"],
  });
  
  const { data: rewards, isLoading: rewardsLoading } = useQuery<CustomerReward[]>({
    queryKey: ["/api/customer/rewards"],
  });
  
  const { data: recentOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/customer/orders/recent"],
  });
  
  if (profileLoading || rewardsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <CustomerSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  // Calculate progress to next reward
  const pointsToNextReward = profile?.nextRewardPoints || 100;
  const currentPoints = profile?.points || 0;
  const progressPercentage = Math.min(Math.round((currentPoints / pointsToNextReward) * 100), 100);
  
  // Get active rewards
  const activeRewards = rewards?.filter(reward => !reward.isRedeemed) || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-gray-600">Track your rewards and enjoy your cafe experience</p>
        </div>
        
        {/* Points and Progress */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                  <CoffeeIcon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Points</p>
                  <h2 className="text-3xl font-bold">{currentPoints}</h2>
                </div>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Progress to Next Reward</p>
                  <p className="text-sm text-gray-500">{currentPoints}/{pointsToNextReward} points</p>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              
              <Button className="bg-primary hover:bg-primary/90">
                <Link href="/customer/games">
                  <div className="flex items-center">
                    Play & Win <Trophy className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Rewards */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Rewards</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/rewards">
                <div className="flex items-center">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            </Button>
          </div>
          
          {activeRewards.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">You don't have any active rewards yet.</p>
                <p className="text-gray-500">Keep ordering and playing games to earn rewards!</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90" asChild>
                  <Link href="/customer/games">Play Games to Earn</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeRewards.slice(0, 3).map((reward) => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest purchases</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders?.length === 0 ? (
                <div className="text-center py-6">
                  <CoffeeIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders?.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">Order #{order.id}</span>
                          <Badge variant="outline" className="ml-2">
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{order.amount}</p>
                        <p className="text-xs text-primary">+{order.pointsEarned} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Updates from your cafe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Bell className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">New reward available!</p>
                    <p className="text-sm text-gray-500">You've earned a free coffee. Tap to view details.</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Bell className="h-5 w-5 text-secondary mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Daily spin is ready</p>
                    <p className="text-sm text-gray-500">Spin the wheel for a chance to win exciting rewards!</p>
                    <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Bell className="h-5 w-5 text-accent mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Special weekend offer</p>
                    <p className="text-sm text-gray-500">Get 20% off on all beverages this weekend!</p>
                    <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                  </div>
                </div>
                
                <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <Bell className="h-5 w-5 text-primary mt-0.5 mr-3" />
                  <div>
                    <p className="font-medium">Points milestone reached</p>
                    <p className="text-sm text-gray-500">You've crossed 100 points! Keep going!</p>
                    <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
