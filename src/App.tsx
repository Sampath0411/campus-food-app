import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AppShell } from "@/components/AppShell";
import { Preloader } from "@/components/Preloader";
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
import Chat from "./pages/Chat.tsx";

const queryClient = new QueryClient();

const withShell = (el: React.ReactNode) => <AppShell>{el}</AppShell>;

const AppRoutes = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <Preloader onLoad={() => setLoaded(true)} />}
      <BrowserRouter>
        <CartProvider>
          <Routes>
            <Route path="/" element={withShell(<Index />)} />
            <Route path="/chat" element={withShell(<Chat />)} />
            <Route path="/r/:id" element={withShell(<Restaurant />)} />
            <Route path="/cart" element={withShell(<Cart />)} />
            <Route path="/orders" element={withShell(<OrderTracking />)} />
            <Route path="/recent-orders" element={withShell(<RecentOrders />)} />
            <Route path="/group" element={withShell(<GroupOrder />)} />
            <Route path="/g/:code" element={withShell(<GroupOrder />)} />
            <Route path="/search" element={withShell(<Search />)} />
            <Route path="/profile" element={withShell(<Profile />)} />
            <Route path="/scheduled" element={withShell(<Scheduled />)} />
            <Route path="/checkout" element={withShell(<Checkout />)} />
            <Route path="/meal-planner" element={withShell(<MealPlanner />)} />
            <Route path="/polls" element={withShell(<Polls />)} />
            <Route path="/fridge" element={withShell(<Fridge />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
