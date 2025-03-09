"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [activePage, setActivePage] = useState("settings");
  
  // dummy for now
  const user = {
    firstName: "Joe",
    lastName: "Schmoe",
    email: "joe@schmoe.com",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-8">
              <div 
                className="w-16 h-16 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-2xl mr-4"
              >
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              
              <div className="flex flex-col">
                <h2 className="font-semibold text-xl">{user.firstName} {user.lastName}</h2>
                <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
              </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  defaultValue={user.firstName} 
                  placeholder="First Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  defaultValue={user.lastName} 
                  placeholder="Last Name"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue={user.email} 
                  placeholder="Email"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 