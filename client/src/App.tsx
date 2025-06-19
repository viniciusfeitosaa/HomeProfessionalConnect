import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { LoadingScreen } from "@/components/loading-screen";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/home";
import Agenda from "@/pages/agenda";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Payment from "@/pages/payment";
import ProfessionalDetail from "@/pages/professional-detail";
import ProviderDashboard from "@/pages/provider-dashboard";
import ProviderRegistration from "@/pages/provider-registration";
import ServiceOffer from "@/pages/service-offer";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show login as main screen when not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={(userType) => {
      // Force reload to ensure auth state is properly updated
      window.location.reload();
    }} />;
  }

  // Provider routes
  if (user?.userType === "provider") {
    return (
      <Switch>
        <Route path="/" component={ProviderDashboard} />
        <Route path="/provider-dashboard" component={ProviderDashboard} />
        <Route path="/provider-registration">
          <ProviderRegistration onComplete={() => window.location.reload()} />
        </Route>
        <Route path="/service-offer/:id" component={ServiceOffer} />
        <Route path="/messages" component={Messages} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Client routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/agenda" component={Agenda} />
      <Route path="/messages" component={Messages} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/payment" component={Payment} />
      <Route path="/professional/:id" component={ProfessionalDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showLoading, setShowLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="lifebee-theme">
        <TooltipProvider>
          {showLoading ? (
            <LoadingScreen onComplete={() => setShowLoading(false)} />
          ) : (
            <Router />
          )}
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;