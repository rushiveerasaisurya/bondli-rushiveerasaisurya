import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/main-layout";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Bonds from "@/pages/bonds";
import Trading from "@/pages/trading";
import Portfolio from "@/pages/portfolio";
import MarketMaker from "@/pages/market-maker";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <MainLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/bonds" component={Bonds} />
          <Route path="/trading" component={Trading} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/market-maker" component={MarketMaker} />
          <Route path="/admin" component={Admin} />
        </MainLayout>
      )}
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
