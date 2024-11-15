'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInClient({ providers }: { providers: any }) {
  return (
    <div className="space-y-4">
      {Object.values(providers).map((provider: any) => (
        <Button
          key={provider.id}
          className="w-full"
          onClick={() => signIn(provider.id, { callbackUrl: '/' })}
        >
          Sign in with {provider.name}
        </Button>
      ))}
    </div>
  );
} 