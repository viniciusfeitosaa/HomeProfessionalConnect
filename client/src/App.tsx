import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Agenda from "@/pages/agenda";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Payment from "@/pages/payment";
import ProfessionalDetail from "@/pages/professional-detail";
import ProviderDashboard from "@/pages/provider-dashboard";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/provider-dashboard" component={ProviderDashboard} />
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
