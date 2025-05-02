import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import OwnerSidebar from "@/components/owner/sidebar";
import CustomerRegistrationQR from "@/components/owner/customer-registration-qr";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Upload, Bell, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Cafe } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  email: z.string().email("Please enter a valid email"),
  logo: z.string().optional(),
});

const whatsappSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type WhatsappFormValues = z.infer<typeof whatsappSchema>;

export default function OwnerSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: cafe, isLoading } = useQuery<Cafe>({
    queryKey: ["/api/owner/cafe"],
  });
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      email: "",
      logo: "",
    },
  });
  
  const whatsappForm = useForm<WhatsappFormValues>({
    resolver: zodResolver(whatsappSchema),
    defaultValues: {
      whatsappEnabled: false,
      whatsappNumber: "",
    },
  });
  
  // Set form values when cafe data is loaded
  useState(() => {
    if (cafe) {
      profileForm.reset({
        name: cafe.name,
        address: cafe.address,
        phone: cafe.phone,
        email: cafe.email,
        logo: cafe.logo,
      });
      
      whatsappForm.reset({
        whatsappEnabled: cafe.whatsappEnabled,
        whatsappNumber: cafe.whatsappNumber,
      });
    }
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/owner/cafe", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/cafe"] });
      toast({
        title: "Profile updated",
        description: "Your cafe profile has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateWhatsappMutation = useMutation({
    mutationFn: async (data: WhatsappFormValues) => {
      const res = await apiRequest("PATCH", "/api/owner/cafe/whatsapp", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/cafe"] });
      toast({
        title: "WhatsApp settings updated",
        description: "Your WhatsApp integration settings have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update WhatsApp settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  function onWhatsappSubmit(data: WhatsappFormValues) {
    updateWhatsappMutation.mutate(data);
  }
  
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <OwnerSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600">Manage your cafe profile and application settings</p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Cafe Profile</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp Integration</TabsTrigger>
            <TabsTrigger value="customers">Customer Registration</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Cafe Profile</CardTitle>
                <CardDescription>
                  Update your cafe's information that will be visible to customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {cafe?.logo ? (
                          <img src={cafe.logo} alt={cafe.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                            <line x1="6" y1="1" x2="6" y2="4"></line>
                            <line x1="10" y1="1" x2="10" y2="4"></line>
                            <line x1="14" y1="1" x2="14" y2="4"></line>
                          </svg>
                        )}
                      </div>
                      <div>
                        <Button type="button" variant="outline" size="sm" className="mb-1">
                          <Upload className="h-4 w-4 mr-2" /> Upload Logo
                        </Button>
                        <p className="text-xs text-gray-500">
                          Upload a square image of at least 300x300px
                        </p>
                      </div>
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cafe Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter cafe name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter cafe address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Integration</CardTitle>
                <CardDescription>
                  Configure WhatsApp notifications for your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...whatsappForm}>
                  <form onSubmit={whatsappForm.handleSubmit(onWhatsappSubmit)} className="space-y-6">
                    <FormField
                      control={whatsappForm.control}
                      name="whatsappEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable WhatsApp Notifications</FormLabel>
                            <FormDescription>
                              Send automated notifications to customers about rewards and offers
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {whatsappForm.watch("whatsappEnabled") && (
                      <FormField
                        control={whatsappForm.control}
                        name="whatsappNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Business Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter WhatsApp business number" {...field} />
                            </FormControl>
                            <FormDescription>
                              This should be your WhatsApp Business account number with country code (e.g., +91XXXXXXXXXX)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {whatsappForm.watch("whatsappEnabled") && (
                      <div className="bg-secondary/10 p-4 rounded-lg">
                        <h3 className="font-semibold flex items-center text-secondary mb-2">
                          <Bell className="h-4 w-4 mr-2" />
                          Notification Templates
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          The following templates will be used for WhatsApp notifications:
                        </p>
                        
                        <div className="space-y-4">
                          <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Reward Earned</p>
                                <p className="text-sm text-gray-600">Sent when a customer earns a new reward</p>
                              </div>
                              <Badge variant="outline" className="text-secondary">Active</Badge>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Order Confirmation</p>
                                <p className="text-sm text-gray-600">Sent when a customer places an order</p>
                              </div>
                              <Badge variant="outline" className="text-secondary">Active</Badge>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">Special Offer</p>
                                <p className="text-sm text-gray-600">Sent for special promotions and offers</p>
                              </div>
                              <Badge variant="outline" className="text-secondary">Active</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90"
                      disabled={updateWhatsappMutation.isPending}
                    >
                      {updateWhatsappMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="customers">
            <CustomerRegistrationQR />
          </TabsContent>
          
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Management</CardTitle>
                <CardDescription>
                  Manage your CafeRewards subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">Current Plan</h3>
                        <div className="flex items-center mt-1">
                          <Badge className="bg-accent text-dark font-medium mr-2">
                            {cafe?.plan ? cafe.plan.charAt(0).toUpperCase() + cafe.plan.slice(1) : "Trial"}
                          </Badge>
                          {cafe?.plan === "trial" && (
                            <span className="text-sm text-gray-600">13 days remaining</span>
                          )}
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Plan Features:</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {cafe?.plan === "starter" ? (
                              <>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Up to 200 customers</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Basic reward templates</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>2 gamification options</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Basic WhatsApp notifications</span>
                                </li>
                              </>
                            ) : cafe?.plan === "professional" ? (
                              <>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Up to 1,000 customers</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Custom reward programs</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>All gamification options</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Advanced WhatsApp integration</span>
                                </li>
                              </>
                            ) : cafe?.plan === "enterprise" ? (
                              <>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Unlimited customers</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Custom branding</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Custom game development</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Full WhatsApp Business API</span>
                                </li>
                              </>
                            ) : (
                              <>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Up to 50 customers</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Basic reward templates</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>1 gamification option</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Basic WhatsApp notifications</span>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {cafe?.plan === "trial" ? (
                          <div className="text-xl font-bold">Free</div>
                        ) : cafe?.plan === "starter" ? (
                          <div className="text-xl font-bold">₹999<span className="text-sm font-normal text-gray-500">/month</span></div>
                        ) : cafe?.plan === "professional" ? (
                          <div className="text-xl font-bold">₹2,499<span className="text-sm font-normal text-gray-500">/month</span></div>
                        ) : (
                          <div className="text-xl font-bold">₹5,999<span className="text-sm font-normal text-gray-500">/month</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-lg mb-4">Available Plans</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className={cafe?.plan === "starter" ? "border-2 border-primary" : ""}>
                        <CardHeader>
                          <CardTitle>Starter</CardTitle>
                          <CardDescription>For small cafes</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-4">₹999<span className="text-sm font-normal text-gray-500">/month</span></div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Up to 200 customers</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Basic reward templates</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>2 gamification options</span>
                            </li>
                          </ul>
                        </CardContent>
                        <div className="px-6 pb-6">
                          <Button variant={cafe?.plan === "starter" ? "secondary" : "outline"} className="w-full">
                            {cafe?.plan === "starter" ? "Current Plan" : "Choose Plan"}
                          </Button>
                        </div>
                      </Card>
                      
                      <Card className={cafe?.plan === "professional" ? "border-2 border-primary" : ""}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>Professional</CardTitle>
                              <CardDescription>For established cafes</CardDescription>
                            </div>
                            <Badge className="bg-accent text-dark">Popular</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-4">₹2,499<span className="text-sm font-normal text-gray-500">/month</span></div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Up to 1,000 customers</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Custom reward programs</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>All gamification options</span>
                            </li>
                          </ul>
                        </CardContent>
                        <div className="px-6 pb-6">
                          <Button className={cafe?.plan === "professional" ? "bg-secondary" : "bg-primary"} variant="default" className="w-full">
                            {cafe?.plan === "professional" ? "Current Plan" : "Choose Plan"}
                          </Button>
                        </div>
                      </Card>
                      
                      <Card className={cafe?.plan === "enterprise" ? "border-2 border-primary" : ""}>
                        <CardHeader>
                          <CardTitle>Enterprise</CardTitle>
                          <CardDescription>For cafe chains</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold mb-4">₹5,999<span className="text-sm font-normal text-gray-500">/month</span></div>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Unlimited customers</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Custom branding</span>
                            </li>
                            <li className="flex items-start">
                              <svg className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Custom game development</span>
                            </li>
                          </ul>
                        </CardContent>
                        <div className="px-6 pb-6">
                          <Button variant={cafe?.plan === "enterprise" ? "secondary" : "outline"} className="w-full">
                            {cafe?.plan === "enterprise" ? "Current Plan" : "Contact Sales"}
                          </Button>
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium text-lg text-destructive mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Be careful, these actions are not reversible
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium">Cancel Subscription</h4>
                          <p className="text-sm text-gray-600">This will cancel your current subscription at the end of the billing period</p>
                        </div>
                        <Button variant="outline" className="text-destructive">
                          Cancel
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-destructive rounded-lg">
                        <div>
                          <h4 className="font-medium text-destructive">Delete Account</h4>
                          <p className="text-sm text-gray-600">This will permanently delete your account and all associated data</p>
                        </div>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
