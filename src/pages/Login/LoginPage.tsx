import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/InputField";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password, role);

    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      navigate(role === "admin" ? "/admin" : "/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg p-8 animate-scale-in">
          <div className="text-center mb-8">
            <Link to="/">
              <h1 className="font-display text-2xl font-bold gradient-text">
                Edmund Lungi's
              </h1>
            </Link>
            <p className="text-muted-foreground mt-2">Welcome back! Please login.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Login as</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "customer" | "admin")}
                className="input-field w-full"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
