import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md space-y-6">
        {/* Enhanced security notice for financial platform */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              🔒 Secure Financial Platform
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Your password protects access to sensitive financial intelligence data and AI-powered portfolio analysis.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Main password update form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>
              Choose a strong password to secure your Abaco Financial Intelligence Platform account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordForm />
          </CardContent>
        </Card>

        {/* Security guidelines for financial platform */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-800 dark:text-blue-200">
              Password Security Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-1 text-xs text-blue-700 dark:text-blue-300">
              <li>• Minimum 12 characters with mixed case, numbers, and symbols</li>
              <li>• Avoid using personal or business information</li>
              <li>• Use a unique password for this financial platform</li>
              <li>• Consider using a password manager</li>
              <li>• Enable two-factor authentication when available</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
