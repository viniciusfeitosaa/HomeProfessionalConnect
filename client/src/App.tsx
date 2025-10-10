import { useState } from "react";
import { Switch, Route } from "wouter";
import { safeQueryClient as queryClient } from "./lib/safe-query-client";
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
import ProviderOrders from "@/pages/provider-orders";

import ProviderProfile from "@/pages/provider-profile";
import ProviderProposals from "@/pages/provider-proposals";
import ServiceOffer from "@/pages/service-offer";
import Servico from "@/pages/servico";
import MyRequests from "@/pages/my-requests";
import Services from "@/pages/services";
import MyServiceRequests from "@/pages/my-service-requests";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import AgendaProfissional from "@/pages/agenda-profissional";
import MessagesClient from "@/pages/messages-client";
import MessagesProvider from "@/pages/messages-provider";
import AuthCallback from "@/pages/auth-callback";
import PaymentSuccess from "@/pages/payment-success";
import PaymentFailure from "@/pages/payment-failure";
import PaymentPending from "@/pages/payment-pending";
import StripeOnboardingRequired from "@/pages/stripe-onboarding-required";

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
    return (
      <Switch>
        <Route path="/auth-callback" component={AuthCallback} />
        <Route path="*">
          <Login onLogin={() => {
            // Force reload to ensure auth state is properly updated
            window.location.reload();
          }} />
        </Route>
      </Switch>
    );
  }

  // Provider routes
  if (user?.userType === "provider") {
    return (
      <Switch>
        {/* Rota de onboarding Stripe - SEMPRE acessível */}
        <Route path="/stripe-setup" component={StripeOnboardingRequired} />
        
        <Route path="/" component={ProviderDashboard} />
        <Route path="/provider-dashboard" component={ProviderDashboard} />
        <Route path="/provider-registration">
          <ProviderRegistration onComplete={() => window.location.reload()} />
        </Route>
        <Route path="/provider-orders" component={ProviderOrders} />
        <Route path="/provider-proposals" component={ProviderProposals} />
        <Route path="/service-offer/:id" component={ServiceOffer} />
        <Route path="/messages/:conversationId" component={MessagesProvider} />
        <Route path="/messages" component={MessagesProvider} />
        <Route path="/messages-provider/:conversationId" component={MessagesProvider} />
        <Route path="/messages-provider" component={MessagesProvider} />
        <Route path="/agenda" component={Agenda} />
        <Route path="/agenda-profissional" component={AgendaProfissional} />
        <Route path="/profile" component={Profile} />
        <Route path="/provider-profile" component={ProviderProfile} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  // Client routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/my-service-requests" component={MyServiceRequests} />
      <Route path="/agenda" component={Agenda} />
      <Route path="/messages/:conversationId" component={MessagesClient} />
      <Route path="/messages" component={MessagesClient} />
      <Route path="/profile" component={Profile} />
      <Route path="/settings" component={Settings} />
      <Route path="/payment" component={Payment} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/failure" component={PaymentFailure} />
      <Route path="/payment/pending" component={PaymentPending} />
      <Route path="/professional/:id" component={ProfessionalDetail} />
      <Route path="/servico" component={Servico} />
      <Route path="/my-requests" component={MyRequests} />
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