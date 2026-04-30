// Supabase Edge Function for Razorpay Payment Verification
// Deploy with: npx supabase functions deploy verify-payment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { payment_id, order_id, signature } = await req.json();

    if (!payment_id || !order_id || !signature) {
      return new Response(
        JSON.stringify({ error: "Missing payment details" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpaySecret) {
      // Development mode - accept all payments
      console.log("[Mock] Verifying payment without secret");
      return new Response(
        JSON.stringify({ verified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const body = `${order_id}|${payment_id}`;
    const expectedSignature = createHmac("sha256", razorpaySecret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === signature;

    if (!isValid) {
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payment verified - save to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    await supabase.from("payments").insert({
      payment_id,
      order_id,
      signature,
      status: "completed",
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ verified: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Verify Payment] Error:", error);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
