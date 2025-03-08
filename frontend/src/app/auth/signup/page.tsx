"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { signup } from "../actions";
import { ArrowLeft } from "lucide-react";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    setLoading(true);

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      await signup(formData);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex justify-center items-center relative">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home Page</span>
      </Link>

      <div className="max-w-md w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
        <TextHoverEffect text="EnvAI" />
        <h2 className="text-center text-xl font-semibold text-gray-700 dark:text-gray-200 mt-2">Create your account</h2>
        
        <form className="my-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <LabelInputContainer>
              <Label htmlFor="firstname">First Name</Label>
              <Input required name="firstname" id="firstname" placeholder="John" type="text" />
            </LabelInputContainer>
            
            <LabelInputContainer>
              <Label htmlFor="lastname">Last Name</Label>
              <Input required name="lastname" id="lastname" placeholder="Doe" type="text" />
            </LabelInputContainer>
          </div>
          
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input required name="email" id="email" placeholder="youremail@example.com" type="email" />
          </LabelInputContainer>
          
          <LabelInputContainer className="mb-6">
            <Label htmlFor="password">Password</Label>
            <Input required name="password" id="password" placeholder="••••••••" type="password" />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-green-600 dark:from-green-800 dark:to-emerald-900 to-emerald-500 block w-full text-white rounded-md h-9 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up →'}
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 h-[1px] w-full" />
        </form>
        
        <p className="text-center text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-green-500 hover:text-green-600 transition-none"
            prefetch={true}
            replace
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-green-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
    </>
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
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
}; 