"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = e.currentTarget;
      const email = form.email.value;
      const password = form.password.value;
      const firstName = form.firstname.value;
      const lastName = form.lastname.value;

      // Register the user with Supabase Auth
      const { error: signUpError, data } = await signUp(email, password);
      
      if (signUpError) {
        setError(signUpError.message || "An error occurred during signup");
        return;
      }

      // If user was created successfully, create their profile
      if (data) {
        // Add user profile information
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            user: data.id,
            first_name: firstName,
            last_name: lastName
          }]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError("Account created but there was an issue with your profile. Please update your profile later.");
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError("An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex justify-center items-center relative">
      <div className="max-w-md w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
        <TextHoverEffect text="Join Envolve" />
        <form className="my-6" onSubmit={handleSubmit}>
          <div className="flex w-full gap-2">
            <LabelInputContainer className="mb-4 flex-1">
              <Label htmlFor="firstname">First Name</Label>
              <Input required name="firstname" id="firstname" placeholder="First Name" />
            </LabelInputContainer>
            <LabelInputContainer className="mb-4 flex-1">
              <Label htmlFor="lastname">Last Name</Label>
              <Input required name="lastname" id="lastname" placeholder="Last Name" />
            </LabelInputContainer>
          </div>
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        
        <div className="flex flex-col space-y-4">
          <span className="text-sm text-center">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-500 hover:text-blue-700 font-semibold"
            >
              Sign in
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