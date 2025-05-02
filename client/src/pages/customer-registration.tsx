import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, Check, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone must be at least 10 characters").optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function CustomerRegistration() {
  const { cafeId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/customer/dashboard");
    }
  }, [user, navigate]);
  
  // Fetch cafe details
  const { data: cafe, isLoading: cafeLoading, error: cafeError } = useQuery({
    queryKey: [`/api/cafes/${cafeId}`],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!cafeId,
  });
  
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
        title: "Registration successful!",
        description: "Welcome to our loyalty program. You can now log in.",
        variant: "default",
      });
      navigate("/auth");
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
  
  if (cafeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (cafeError || !cafe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Error</CardTitle>
            <CardDescription>
              The registration link you used is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Please ask the cafe owner for a new registration link.</p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Form Section */}
      <div className="flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center mb-3">
              {cafe.logo ? (
                <img src={cafe.logo} alt={cafe.name} className="h-8 w-8 mr-2 rounded-full" />
              ) : (
                <Coffee className="h-6 w-6 mr-2 text-primary" />
              )}
              <span className="text-sm font-medium">{cafe.name}</span>
            </div>
            <CardTitle className="text-2xl">Join Our Loyalty Program</CardTitle>
            <CardDescription>
              Create an account to earn rewards and participate in our loyalty program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Separator className="my-4" />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
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
                        <Input placeholder="Create a secure password" type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 6 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Join Now
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-xs text-gray-500">
              Already have an account?
            </p>
            <Button variant="link" className="p-0" onClick={() => navigate("/auth")}>
              Log in instead
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Hero Section */}
      <div className="hidden md:flex flex-col bg-primary text-primary-foreground">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <h1 className="text-3xl font-bold mb-4">Welcome to {cafe.name}'s Loyalty Program</h1>
            <p className="mb-8">Join our rewards program and start earning points with every visit!</p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary-foreground text-primary rounded-full p-2 mr-4">
                  <Check className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Earn Points</h3>
                  <p className="text-sm opacity-90">Collect points with every purchase you make</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-foreground text-primary rounded-full p-2 mr-4">
                  <Check className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Redeem Rewards</h3>
                  <p className="text-sm opacity-90">Exchange your points for free items, discounts and more</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary-foreground text-primary rounded-full p-2 mr-4">
                  <Check className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Play Games</h3>
                  <p className="text-sm opacity-90">Win additional rewards through fun games and activities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 text-center bg-primary-foreground/10">
          <p className="text-sm">
            By creating an account, you agree to {cafe.name}'s Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
}