import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, Home, Building, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

type AddressType = "home" | "work";

interface Address {
  doorNo: string;
  flatNo?: string;
  street?: string;
  area?: string;
  city?: string;
  type: AddressType;
}

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Redirect if already logged in
  useEffect(() => {
    const user = localStorage.getItem("bb:user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState<Address>({
    doorNo: "",
    flatNo: "",
    street: "",
    area: "",
    city: "",
    type: "home",
  });

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Missing info",
        description: "Please enter both name and phone number.",
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
    // Save user info
    localStorage.setItem(
      "bb:user",
      JSON.stringify({ name, phone, createdAt: Date.now() })
    );
    setStep(2);
  }

  function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.doorNo.trim()) {
      toast({
        title: "Missing address",
        description: "Please enter at least door/house number.",
      });
      return;
    }
    // Save address
    localStorage.setItem("bb:address", JSON.stringify(address));
    toast({
      title: "Profile complete",
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
              {step === 1 ? "Enter your details to get started" : "Add your delivery address"}
            </p>
          </div>

          {/* Step 1: Name & Phone */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
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
                <p className="text-xs text-muted-foreground">
                  We'll send an OTP for verification (demo - no actual OTP)
                </p>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-primary">
                Continue
              </Button>
            </form>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="doorNo">Door/House No *</Label>
                  <Input
                    id="doorNo"
                    placeholder="12-3-45"
                    value={address.doorNo}
                    onChange={(e) => setAddress({ ...address, doorNo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatNo">Flat No (optional)</Label>
                  <Input
                    id="flatNo"
                    placeholder="A-101"
                    value={address.flatNo}
                    onChange={(e) => setAddress({ ...address, flatNo: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street/Colony</Label>
                <Input
                  id="street"
                  placeholder="Gandhi Nagar"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Area/Locality</Label>
                <Input
                  id="area"
                  placeholder="Dwaraka Nagar"
                  value={address.area}
                  onChange={(e) => setAddress({ ...address, area: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Visakhapatnam"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Address Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddress({ ...address, type: "home" })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-colors ${
                      address.type === "home"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Home className="h-4 w-4" />
                    <span className="font-semibold">Home</span>
                    {address.type === "home" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddress({ ...address, type: "work" })}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 transition-colors ${
                      address.type === "work"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span className="font-semibold">Work</span>
                    {address.type === "work" && <Check className="h-4 w-4 text-primary" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-primary">
                <MapPin className="mr-2 h-4 w-4" />
                Save Address & Continue
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep(1);
                }}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
