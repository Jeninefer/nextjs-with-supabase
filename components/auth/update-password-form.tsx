"use client";

<<<<<<< HEAD
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
=======
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
>>>>>>> a420387e78678797632369e28629f802ce050805
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
=======
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
>>>>>>> a420387e78678797632369e28629f802ce050805
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
<<<<<<< HEAD

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
=======
    setSuccess(null);

    // Client-side validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess("Password updated successfully! Redirecting...");
        // Redirect to dashboard after successful password update
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password update error:", err);
>>>>>>> a420387e78678797632369e28629f802ce050805
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
<<<<<<< HEAD
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
=======
      <Card className="mx-auto max-w-sm bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-sm border border-purple-500/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-white font-['Lato']">Reset Your Password</CardTitle>
          <CardDescription className="text-purple-300 font-['Poppins']">
>>>>>>> a420387e78678797632369e28629f802ce050805
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
<<<<<<< HEAD
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
=======
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-purple-200 font-['Poppins']">
                  New password
                </Label>
>>>>>>> a420387e78678797632369e28629f802ce050805
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
<<<<<<< HEAD
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
=======
                  className="bg-slate-800/50 border-purple-400/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className="text-purple-200 font-['Poppins']">
                  Confirm new password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800/50 border-purple-400/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-400/20 rounded-lg">
                  <p className="text-sm text-red-400 font-['Poppins']">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-900/20 border border-green-400/20 rounded-lg">
                  <p className="text-sm text-green-400 font-['Poppins']">{success}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-['Poppins'] font-semibold transition-all duration-200" 
                disabled={isLoading}
              >
>>>>>>> a420387e78678797632369e28629f802ce050805
                {isLoading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
