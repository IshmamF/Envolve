"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at?: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      try {
        setLoading(true);
        const supabase = createClient();
        
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          console.error("Error fetching authenticated user:", authError);
          setLoading(false);
          return;
        }
        
        // user col in user_profiles is auth.users id, (fkey)
        // get profile data from user_profiles where the user id we got
        // = id in user col
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user', authUser.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          // min data
          setUser({
            id: authUser.id,
            first_name: authUser.user_metadata?.first_name || "",
            last_name: authUser.user_metadata?.last_name || "",
            email: authUser.email || "",
          });
        } else {
          // populate profile data
          setUser({
            id: authUser.id,
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            email: authUser.email || "",
            created_at: authUser.created_at
          });
        }
      } catch (error) {
        console.error("Error in getUserData:", error);
      } finally {
        setLoading(false);
      }
    }

    getUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : user ? (
              <>
                <div className="flex items-center mb-8">
                  <div 
                    className="w-16 h-16 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-2xl mr-4"
                  >
                    {user.first_name?.charAt(0) || ""}{user.last_name?.charAt(0) || ""}
                  </div>
                  
                  <div className="flex flex-col">
                    <h2 className="font-semibold text-xl">{user.first_name} {user.last_name}</h2>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
                    {user.created_at && (
                      <span className="text-xs text-gray-500 mt-1">
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      {user.first_name || "Not provided"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      {user.last_name || "Not provided"}
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                      {user.email || "Not provided"}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">User information not available. Please sign in.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 