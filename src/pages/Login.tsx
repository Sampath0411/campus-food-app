import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Lock, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface UserData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("bb:user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter email and password.",
      });
      return;
    }

    // Check if user exists in localStorage
    const storedUsers = localStorage.getItem("bb:users");
    if (!storedUsers) {
      toast({
        title: "No account",
        description: "Please create an account first.",
      });
      return;
    }

    const users: UserData[] = JSON.parse(storedUsers);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      toast({
        title: "User not found",
        description: "No account with this email.",
      });
      return;
    }

    if (user.password !== password) {
      toast({
        title: "Invalid password",
        description: "Please check your password.",
      });
      return;
    }

    // Login successful
    localStorage.setItem("bb:user", JSON.stringify({
      name: user.name,
      email: user.email,
      phone: user.phone,
    }));

    toast({
      title: "Welcome back!",
      description: `Hello, ${user.name}!`,
    });

    navigate("/");
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email address.",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) {
      toast({
        title: "Invalid phone",
        description: "Enter a valid 10-digit Indian mobile number.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters.",
      });
      return;
    }

    // Check if email already exists
    const storedUsers = localStorage.getItem("bb:users");
    const users: UserData[] = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      toast({
        title: "Email exists",
        description: "Please login instead.",
      });
      setIsSignup(false);
      return;
    }

    // Save new user
    const newUser: UserData = { name, email, phone, password };
    users.push(newUser);
    localStorage.setItem("bb:users", JSON.stringify(users));

    // Auto-login
    localStorage.setItem("bb:user", JSON.stringify({
      name,
      email,
      phone,
    }));

    toast({
      title: "Account created!",
      description: "Welcome to QuickBite!",
    });

    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-surface p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 transform rotate-12">
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
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    maxLength={13}
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
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-primary">
              {isSignup ? (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-sm text-primary hover:underline"
            >
              {isSignup ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
