"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  // Update active page based on pathname
  useEffect(() => {
    const path = pathname.split("/")[1] || "home";
    
    // Map path to navbar item
    if (path === "") {
      setActivePage("home");
    } else if (path === "map") {
      setActivePage("map");
    } else if (path === "settings") {
      setActivePage("settings");
    } else if (path === "help") {
      setActivePage("help");
    }
  }, [pathname]);

  return (
    <NavbarContext.Provider value={{ activePage, setActivePage }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <div>
        {children}
      </div>
    </NavbarContext.Provider>
  );
} 