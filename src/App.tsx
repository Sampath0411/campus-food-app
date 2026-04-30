import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AppShell } from "@/components/AppShell";
import { Preloader } from "@/components/Preloader";
import Login from "./pages/Login.tsx";
import Index from "./pages/Index.tsx";
import Restaurant from "./pages/Restaurant.tsx";
import Cart from "./pages/Cart.tsx";
import OrderTracking from "./pages/OrderTracking.tsx";
import GroupOrder from "./pages/GroupOrder.tsx";
import Search from "./pages/Search.tsx";
import Profile from "./pages/Profile.tsx";
import Scheduled from "./pages/Scheduled.tsx";
import RecentOrders from "./pages/RecentOrders.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const withShell = (el: React.ReactNode) => <AppShell>{el}</AppShell>;

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem("bb:user");
}

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
