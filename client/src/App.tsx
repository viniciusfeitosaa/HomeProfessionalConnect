import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingScreen } from "@/components/loading-screen";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"client" | "provider" | null>(null);

  // Always show login as main screen (as requested)
  if (!isAuthenticated) {
    return <Login onLogin={(type) => { setIsAuthenticated(true); setUserType(type); }} />;
  }

  // Provider routes
  if (userType === "provider") {
    return (
      <Switch>
        <Route path="/" component={ProviderDashboard} />
        <Route path="/provider-dashboard" component={ProviderDashboard} />
        <Route path="/provider-registration">
          <ProviderRegistration onComplete={() => setUserType("provider")} />
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
  const [isLoading, setIsLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isLoading ? (
          <LoadingScreen onComplete={() => setIsLoading(false)} />
        ) : (
          <Router />
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
