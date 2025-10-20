import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-['Lato']">
            ABACO Financial Intelligence
          </h1>
          <p className="text-purple-300 font-['Poppins']">
            Secure Password Update
          </p>
        </div>
        
        <UpdatePasswordForm />
        
        <div className="text-center mt-6">
          <p className="text-xs text-purple-400 font-['Poppins']">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}
