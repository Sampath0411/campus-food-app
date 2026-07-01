import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, LogIn, UserPlus, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(-10);
}

function passwordChecks(password: string) {
  return [
    { label: "10+ characters", ok: password.length >= 10 },
    { label: "Upper & lower case", ok: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: "Number", ok: /\d/.test(password) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const checks = passwordChecks(password);
  const passwordStrong = checks.every((c) => c.ok);

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast({ title: "Missing details", description: "Enter email and password to continue." });
      return;
    }
    setLoading(true);

    try {
      await signIn(email.trim(), password);
      toast({
        title: "Welcome back!",
        description: "Successfully signed in.",
      });
      // Navigation is handled by the useEffect above
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const cleanPhone = normalizePhone(phone);
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter your full name.",
      });
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email address.",
      });
      setLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast({
        title: "Invalid phone",
        description: "Enter a valid 10-digit Indian mobile number.",
      });
      setLoading(false);
      return;
    }

    if (!passwordStrong) {
      toast({
        title: "Make password stronger",
        description: "Use 10+ characters with uppercase, lowercase, number and symbol.",
      });
      setLoading(false);
      return;
    }

    try {
      const data = await signUp(name.trim(), cleanEmail, cleanPhone, password);
      toast({
        title: data.session ? "Account ready" : "Check your email",
        description: data.session
          ? "You're signed in and ready to order."
          : "Confirm your account, then sign in to QuickBite.",
      });
      if (data.session) navigate("/", { replace: true });
      else setIsSignup(false);
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (authLoading && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground animate-fade-up">
          <Loader2 className="h-4 w-4 animate-spin text-primary" /> Checking secure session...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-surface p-4">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-accent/15 blur-3xl animate-float-delayed" />
      <Card className="relative w-full max-w-md border-border/80 bg-card/90 shadow-2xl backdrop-blur animate-scale-in">
        <CardContent className="p-6 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 transform rotate-12 animate-pulse-soft">
              <img
                src="/quickbite-logo.png"
                alt="QuickBite"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">
              <span className="text-foreground">Quick</span>
              <span className="text-primary">Bite</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignup ? "Create your account" : "Sign in to continue"}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure university ordering
            </div>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Sampath Satya Saran"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="sampath@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9291493225"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhone(e.target.value))}
                    disabled={loading}
                    className="pl-10"
                    maxLength={10}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pl-10"
                />
              </div>
              {isSignup && (
                <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
                  {checks.map((c) => (
                    <span key={c.label} className={c.ok ? "text-accent" : ""}>
                      <CheckCircle2 className="mr-1 inline h-3 w-3" /> {c.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-primary" disabled={loading}>
              {isSignup ? (
                <>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {loading ? "Creating..." : "Create Account"}
                </>
              ) : (
                <>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  {loading ? "Signing in..." : "Sign In"}
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-primary hover:underline"
              disabled={loading}
            >
              {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
