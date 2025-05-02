import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coffee, Loader2 } from "lucide-react";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function CustomerRegistration() {
  const params = useParams<{ cafeId: string }>();
  const cafeId = params.cafeId;
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [cafeName, setCafeName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch cafe information
  useEffect(() => {
    const fetchCafeInfo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simple validation
        if (!cafeId || isNaN(parseInt(cafeId))) {
          throw new Error("Invalid cafe ID");
        }
        
        // Fetch cafe details
        const res = await fetch(`/api/cafes/${cafeId}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Cafe not found. This registration link may be invalid.");
          }
          throw new Error("Failed to fetch cafe information");
        }
        
        const cafeData = await res.json();
        setCafeName(cafeData.name);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCafeInfo();
  }, [cafeId]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const res = await apiRequest("POST", `/api/register/customer/${cafeId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "You have been registered and logged in successfully!",
      });
      // Redirect to customer dashboard
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: RegisterFormValues) {
    registerMutation.mutate(data);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-500">Loading cafe information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full text-center">
          <h2 className="text-red-800 text-lg font-bold mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <Button className="mt-4" onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex flex-col justify-center p-6 w-full lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center">
            <Coffee className="h-10 w-10 text-primary" />
            <h1 className="ml-2 text-3xl font-bold">CafeRewards</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Join {cafeName}</CardTitle>
              <CardDescription>
                Create your customer account to start earning rewards and participating in loyalty games.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional, but helpful for account recovery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 1234567890" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional, will be used for WhatsApp notifications if provided
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-2">
              <div className="text-sm text-gray-500">
                Already have an account? <a href="/auth" className="text-primary font-medium">Sign in</a>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-primary to-accent items-center justify-center text-white p-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-6">Welcome to {cafeName}</h2>
          
          <div className="space-y-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-medium text-xl mb-2">Earn Points With Every Order</h3>
              <p>Every purchase earns you points that can be redeemed for free items, discounts, and special offers.</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-medium text-xl mb-2">Play Games, Win Rewards</h3>
              <p>Participate in fun games like spin wheels and scratch cards for a chance to win bonus points and exclusive rewards.</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <h3 className="font-medium text-xl mb-2">WhatsApp Notifications</h3>
              <p>Get timely updates about your points, rewards, and special promotions directly on WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}