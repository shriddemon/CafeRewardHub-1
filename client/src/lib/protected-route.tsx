import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if owner is trying to access customer routes
  if (user.role === "owner" && path.startsWith("/customer")) {
    return (
      <Route path={path}>
        <Redirect to="/owner/dashboard" />
      </Route>
    );
  }

  // Check if customer is trying to access owner routes
  if (user.role === "customer" && path.startsWith("/owner")) {
    return (
      <Route path={path}>
        <Redirect to="/customer/dashboard" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
