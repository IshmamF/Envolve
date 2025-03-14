"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

// Create a context for the navbar state
type NavbarContextType = {
  activePage: string;
  setActivePage: (page: string) => void;
};

const NavbarContext = createContext<NavbarContextType>({
  activePage: "home",
  setActivePage: () => {},
});

// Custom hook to use the navbar context
export const useNavbar = () => useContext(NavbarContext);

export default function NavbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePage, setActivePage] = useState("home");
  const router = useRouter();

  // Preload the common routes for faster navigation
  useEffect(() => {
    // Preload the most common routes for faster navigation
    const routesToPreload = ["/", "/map", "/leaderboard", "/settings"];
    
    // Use setTimeout to ensure this happens after initial render
    const timer = setTimeout(() => {
      routesToPreload.forEach(route => {
        // This will prefetch the route data without navigating
        router.prefetch(route);
      });
    }, 1000); // Wait 1 second after initial load
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <NavbarContext.Provider value={{ activePage, setActivePage }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div>
        {children}
      </div>
    </NavbarContext.Provider>
  );
} 