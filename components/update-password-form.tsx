"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePassword } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (password.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters long" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // AI Toolkit tracing for password update operations
      console.log('🔍 [AI Toolkit Trace] Password update initiated', {
        timestamp: new Date().toISOString(),
        operation: 'password_update',
        platform: 'ABACO_Financial_Intelligence'
      });

      const result = await updatePassword(password);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      setMessage({ 
        type: "success", 
        text: "Password updated successfully. You may need to sign in again." 
      });

      console.log('✅ [AI Toolkit Trace] Password update successful', {
        timestamp: new Date().toISOString(),
        operation: 'password_update_success',
        platform: 'ABACO_Financial_Intelligence'
      });

    } catch (error) {
      console.error('❌ [AI Toolkit Trace] Password update failed', {
        timestamp: new Date().toISOString(),
        operation: 'password_update_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        platform: 'ABACO_Financial_Intelligence'
      });

      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to update password" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
        <CardDescription>
          Enter your new password for the ABACO Financial Intelligence Platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export { UpdatePasswordForm as default };
