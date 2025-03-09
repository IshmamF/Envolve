"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = e.currentTarget;
      const email = form.email.value;
      const password = form.password.value;

      const result = await signIn(email, password);
      
      if (result.error) {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex justify-center items-center relative">

      <div className="max-w-md w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
        <TextHoverEffect text="Envolve" />
        <form className="my-6" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input required name="email" id="email" placeholder="youremail@example.com" type="email" />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input required name="password" id="password" placeholder="••••••••" type="password" />
          </LabelInputContainer>

          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}

          <button
            disabled={loading}
            className={`relative group/btn w-full text-white rounded-md h-10 font-medium shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="flex flex-col space-y-4">
          <span className="text-sm text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Sign up
            </Link>
          </span>
        </div>

        <BottomGradient />
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <div className="absolute inset-x-0 bottom-0 h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent" />
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {children}
    </div>
  );
}; 