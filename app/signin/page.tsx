import { getProviders } from "next-auth/react";
import { SignInClient } from "./SignInClient";

export default async function SignIn() {
  const providers = await getProviders();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <SignInClient providers={providers} />
      </div>
    </div>
  );
} 