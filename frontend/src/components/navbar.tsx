"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Home, Settings, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth-button"
import { Logo } from "@/components/logo"
import { motion } from "framer-motion"

type NavbarProps = {
  activePage: string
  setActivePage: (page: string) => void
}

export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  const pathname = usePathname()
  
  const navItems = [
    { id: "home", label: "Home", icon: <Home size={20} />, href: "/" },
    { id: "map", label: "Map", icon: <Map size={20} />, href: "/map" },
    { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={20} />, href: "/leaderboard" },
    { id: "settings", label: "Settings", icon: <Settings size={20} />, href: "/settings" },
  ]


  // keeps active tab in sync with curr page ( safe from back forward change or redirects)
  useEffect(() => {
    if (pathname === "/") {
      setActivePage("home");
      return;
    }
    
    // other routes
    const path = pathname.split('/')[1];
    const matchingItem = navItems.find(item => 
      item.href.includes(`/${path}`)
    );
    
    if (matchingItem) {
      setActivePage(matchingItem.id);
    }
  }, [pathname, setActivePage, navItems]);

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // handle click to update active page immediately before navigation
  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Navigation Links - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => handleNavClick(item.id)}>
                <Button
                  variant={activePage === item.id ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${activePage === item.id ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  {item.icon}
                  <span className="hidden md:inline">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>

          {/* Mobile Nav */}
          <div className="flex sm:hidden items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.id} href={item.href} onClick={() => handleNavClick(item.id)}>
                <Button
                  variant={activePage === item.id ? "default" : "ghost"}
                  size="icon"
                  className={activePage === item.id ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {item.icon}
                </Button>
              </Link>
            ))}
          </div>

          {/* Help & Auth Buttons */}
          <div className="flex items-center gap-2">
            <AuthButton />
          </div>
        </div>
      </motion.header>

      {/* Spacer element to prevent content from being hidden under the fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}

