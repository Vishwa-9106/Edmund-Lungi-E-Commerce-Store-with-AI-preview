import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/InputField";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await signup(name, email, password);

    if (success) {
      toast({
        title: "Account created!",
        description: "Welcome to Edmund Lungi's.",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Signup failed",
        description: "Please try again.",
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
            <p className="text-muted-foreground mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              id="name"
              label="Full Name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full btn-primary"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
