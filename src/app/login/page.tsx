"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
        <div className="relative flex items-center justify-center h-screen overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=2070&auto=format&fit=crop"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 w-full max-w-md p-8 space-y-8 bg-background/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10">
                <h2 className="text-3xl font-bold text-center font-serif text-white">Welcome Back</h2>
        <p className="text-center text-gray-300">Sign in to continue your journey.</p>
                <Button onClick={handleGoogleSignIn} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold">
          Login with Google
        </Button>
      </div>
    </div>
  );
}
