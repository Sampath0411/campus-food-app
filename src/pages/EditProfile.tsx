import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Phone, Mail, MapPin, Home, Building, Check, ArrowLeft } from "lucide-react";
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

export default function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState<Address>({
    doorNo: "",
    flatNo: "",
    street: "",
    area: "",
    city: "",
    type: "home",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("bb:user");
    const savedAddress = localStorage.getItem("bb:address");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Missing info",
        description: "Please enter name and phone number.",
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
    if (!address.doorNo.trim()) {
      toast({
        title: "Missing address",
        description: "Please enter at least door/house number.",
      });
      return;
    }

    // Get current email to find user in bb:users
    const currentUser = localStorage.getItem("bb:user");
    const currentEmail = currentUser ? JSON.parse(currentUser).email : "";

    // Update user in bb:users array
    const storedUsers = localStorage.getItem("bb:users");
    if (storedUsers) {
      const users: any[] = JSON.parse(storedUsers);
      const userIndex = users.findIndex(u => u.email === currentEmail);
      if (userIndex !== -1) {
        users[userIndex] = {
          ...users[userIndex],
          name,
          phone,
          ...(password ? { password } : {}),
        };
        localStorage.setItem("bb:users", JSON.stringify(users));
      }
    }

    // Update current session user
    localStorage.setItem("bb:user", JSON.stringify({ name, email, phone }));
    localStorage.setItem("bb:address", JSON.stringify(address));

    toast({
      title: "Profile updated",
      description: "Your details have been saved.",
    });

    navigate("/profile");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-surface p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display text-xl font-bold">Edit Profile</h1>
              <p className="text-sm text-muted-foreground">Update your details</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Name */}
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

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="pl-10 bg-muted cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Phone */}
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

            {/* Password (optional) */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Address */}
            <div className="border-t pt-4">
              <h2 className="font-display font-semibold mb-3">Address</h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="doorNo">Door/House No *</Label>
                  <Input
                    id="doorNo"
                    placeholder="12-3-45"
                    value={address.doorNo}
                    onChange={(e) => setAddress({ ...address, doorNo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flatNo">Flat No</Label>
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
            </div>

            <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-primary">
              <MapPin className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
