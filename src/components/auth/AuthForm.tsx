import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GradientButton } from "@/components/ui/gradient-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client"; // Added missing import

type FormMode = "login" | "register" | "forgot" | "resetPassword";

const AuthForm = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<FormMode>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get("mode") as FormMode) || "login";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
          toast.error("Login failed: " + error.message);
        } else {
          toast.success("Login successful");
          navigate("/dashboard");
        }
      } else if (mode === "register") {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
          toast.error("Registration failed: " + error.message);
        } else {
          toast.success("Registration successful! Check your email for verification.");
          setMode("login");
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth?mode=resetPassword',
        });
        
        if (error) {
          setError(error.message);
          toast.error("Password reset failed: " + error.message);
        } else {
          toast.success("Password reset link sent to your email");
          setMode("login");
        }
      } else if (mode === "resetPassword") {
        // Complete password reset
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setError(error.message);
          toast.error("Password reset failed: " + error.message);
        } else {
          setResetSuccess(true);
          toast.success("Password reset successful! You can now sign in.");
          setTimeout(() => {
            setMode("login");
            setResetSuccess(false);
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
      toast.error(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-lodge-card-bg border border-white/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          {mode === "login"
            ? "Sign In"
            : mode === "register"
            ? "Create Account"
            : mode === "forgot"
            ? "Reset Password"
            : "Set New Password"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Enter your credentials to access your account"
            : mode === "register"
            ? "Enter your details to create an account"
            : mode === "forgot"
            ? "Enter your email to receive a reset link"
            : "Enter your new password to complete the reset"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-sm text-white">
            {error}
          </div>
        )}
        {resetSuccess && mode === "resetPassword" && (
          <div className="mb-4 p-2 bg-green-500/20 border border-green-500/50 rounded text-sm text-white">
            Password reset successful! Redirecting to sign in...
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "resetPassword" ? (
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-lodge-dark-bg border-white/10 text-white"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-lodge-dark-bg border-white/10 text-white"
              />
            </div>
          )}

          {mode !== "forgot" && mode !== "resetPassword" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <GradientButton
                    asChild
                    className="text-lodge-purple px-0"
                    onClick={() => setMode("forgot")}
                  >
                    <span>Forgot?</span>
                  </GradientButton>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-lodge-dark-bg border-white/10 text-white"
              />
            </div>
          )}

          <GradientButton
            type="submit"
            className="w-full bg-lodge-purple hover:bg-lodge-dark-purple text-white button-glow"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : mode === "login"
              ? "Sign In"
              : mode === "register"
              ? "Create Account"
              : mode === "forgot"
              ? "Send Reset Link"
              : "Set New Password"}
          </GradientButton>

          <div className="mt-4 text-center text-sm">
            {mode === "login" ? (
              <div>
                Don't have an account?{" "}
                <GradientButton
                  type="button"
                  className="text-lodge-purple p-0"
                  onClick={() => setMode("register")}
                >
                  Create one
                </GradientButton>
              </div>
            ) : mode === "resetPassword" ? null : (
              <div>
                Already have an account?{" "}
                <GradientButton
                  type="button"
                  className="text-lodge-purple p-0"
                  onClick={() => setMode("login")}
                >
                  Sign in
                </GradientButton>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
