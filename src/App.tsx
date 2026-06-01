import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AppShell } from "@/components/AppShell";
import { Preloader } from "@/components/Preloader";
import Login from "./pages/Login.tsx";
import EditProfile from "./pages/EditProfile.tsx";
import Index from "./pages/Index.tsx";
import Restaurant from "./pages/Restaurant.tsx";
import Cart from "./pages/Cart.tsx";
import OrderTracking from "./pages/OrderTracking.tsx";
import GroupOrder from "./pages/GroupOrder.tsx";
import Search from "./pages/Search.tsx";
import Profile from "./pages/Profile.tsx";
import Scheduled from "./pages/Scheduled.tsx";
import RecentOrders from "./pages/RecentOrders.tsx";
import Checkout from "./pages/Checkout.tsx";
import MealPlanner from "./pages/MealPlanner.tsx";
import Polls from "./pages/Polls.tsx";
import Fridge from "./pages/Fridge.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const withShell = (el: React.ReactNode) => <AppShell>{el}</AppShell>;

// Protected route wrapper - checks Supabase session
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = (ok: boolean) => {
      if (done) return;
      done = true;
      setAuthenticated(ok);
      setChecking(false);
    };

    // Fail-open after 3s if Supabase is unreachable so we don't hang forever
    const timeout = setTimeout(() => finish(false), 3000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        finish(!!session);
      })
      .catch(() => {
        clearTimeout(timeout);
        // Clear stale tokens so the SDK stops looping on refresh
        try {
          Object.keys(localStorage)
            .filter((k) => k.startsWith("sb-"))
            .forEach((k) => localStorage.removeItem(k));
        } catch {}
        finish(false);
      });

    return () => clearTimeout(timeout);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return authenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {!loaded && <Preloader onLoad={() => setLoaded(true)} />}
        <BrowserRouter>
          <CartProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/r/:id" element={withShell(<ProtectedRoute><Restaurant /></ProtectedRoute>)} />
              <Route path="/cart" element={withShell(<ProtectedRoute><Cart /></ProtectedRoute>)} />
              <Route path="/orders" element={withShell(<ProtectedRoute><OrderTracking /></ProtectedRoute>)} />
              <Route path="/recent-orders" element={withShell(<ProtectedRoute><RecentOrders /></ProtectedRoute>)} />
              <Route path="/group" element={withShell(<ProtectedRoute><GroupOrder /></ProtectedRoute>)} />
              <Route path="/g/:code" element={withShell(<ProtectedRoute><GroupOrder /></ProtectedRoute>)} />
              <Route path="/search" element={withShell(<ProtectedRoute><Search /></ProtectedRoute>)} />
              <Route path="/profile" element={withShell(<ProtectedRoute><Profile /></ProtectedRoute>)} />
              <Route path="/scheduled" element={withShell(<ProtectedRoute><Scheduled /></ProtectedRoute>)} />
              <Route path="/checkout" element={withShell(<ProtectedRoute><Checkout /></ProtectedRoute>)} />
              <Route path="/meal-planner" element={withShell(<ProtectedRoute><MealPlanner /></ProtectedRoute>)} />
              <Route path="/polls" element={withShell(<ProtectedRoute><Polls /></ProtectedRoute>)} />
              <Route path="/fridge" element={withShell(<ProtectedRoute><Fridge /></ProtectedRoute>)} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
