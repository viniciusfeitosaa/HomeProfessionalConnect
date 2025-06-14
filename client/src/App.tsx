import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Agenda from "@/pages/agenda";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import ProfessionalDetail from "@/pages/professional-detail";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Home} />
      <Route path="/agenda" component={Agenda} />
      <Route path="/messages" component={Messages} />
      <Route path="/profile" component={Profile} />
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
