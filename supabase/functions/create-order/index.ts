// Supabase Edge Function for Razorpay Order Creation
// Deploy with: npx supabase functions deploy create-order

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();

    if (!amount || amount < 100) {
      return new Response(
        JSON.stringify({ error: "Minimum order amount is ₹1" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Razorpay order using their API
    const razorpayKey = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKey || !razorpaySecret) {
      // Development mode - return mock order
      console.log("[Mock] Razorpay credentials not set");
      return new Response(
        JSON.stringify({
          order_id: `mock_order_${Date.now()}`,
          amount,
          currency: "INR",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create order with Razorpay API
    const auth = btoa(`${razorpayKey}:${razorpaySecret}`);
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: "INR",
        receipt: `order_${Date.now()}`,
      }),
    });

    if (!razorpayRes.ok) {
      throw new Error("Razorpay API failed");
    }

    const orderData = await razorpayRes.json();

    return new Response(
      JSON.stringify({
        order_id: orderData.id,
        amount: orderData.amount / 100,
        currency: "INR",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Create Order] Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create payment order" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
