import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CustomerRegistration from "@/pages/customer-registration";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

// Owner pages
import OwnerDashboard from "@/pages/owner/dashboard";
import OwnerRewards from "@/pages/owner/rewards";
import OwnerCustomers from "@/pages/owner/customers";
import OwnerOrders from "@/pages/owner/orders";
import OwnerSettings from "@/pages/owner/settings";

// Customer pages
import CustomerDashboard from "@/pages/customer/dashboard";
import CustomerRewards from "@/pages/customer/rewards";
import CustomerOrders from "@/pages/customer/orders";
import CustomerGames from "@/pages/customer/games";
import CustomerProfile from "@/pages/customer/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Owner Routes */}
      <ProtectedRoute path="/owner/dashboard" component={OwnerDashboard} />
      <ProtectedRoute path="/owner/rewards" component={OwnerRewards} />
      <ProtectedRoute path="/owner/customers" component={OwnerCustomers} />
      <ProtectedRoute path="/owner/orders" component={OwnerOrders} />
      <ProtectedRoute path="/owner/settings" component={OwnerSettings} />
      
      {/* Customer Routes */}
      <ProtectedRoute path="/customer/dashboard" component={CustomerDashboard} />
      <ProtectedRoute path="/customer/rewards" component={CustomerRewards} />
      <ProtectedRoute path="/customer/orders" component={CustomerOrders} />
      <ProtectedRoute path="/customer/games" component={CustomerGames} />
      <ProtectedRoute path="/customer/profile" component={CustomerProfile} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
