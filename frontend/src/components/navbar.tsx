"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Map, Home, Settings, HelpCircle, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthButton } from "@/components/auth-button"

type NavbarProps = {
  activePage: string
  setActivePage: (page: string) => void
}

export default function Navbar({ activePage, setActivePage }: NavbarProps) {
  const pathname = usePathname()
  
  const navItems = [
    { id: "home", label: "Home", icon: <Home size={20} />, href: "/" },
    { id: "map", label: "Map", icon: <Map size={20} />, href: "/map" },
    { id: "settings", label: "Settings", icon: <Settings size={20} />, href: "/settings" },
  ]

  // Update activePage based on current path
  useEffect(() => {
    const path = pathname.split('/')[1] || 'home'
    const matchingPage = navItems.find(item => 
      (path === '' && item.id === 'home') || item.href.includes(path)
    )
    if (matchingPage) {
      setActivePage(matchingPage.id)
    }
  }, [pathname, setActivePage])

  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo/Title */}
          <Link href="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="text-xl font-bold">Envolve</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={activePage === item.id ? "default" : "ghost"}
                  className={`flex items-center gap-2 ${activePage === item.id ? "bg-green-600 hover:bg-green-700" : ""}`}
                  onClick={() => setActivePage(item.id)}
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
              <Link key={item.id} href={item.href}>
                <Button
                  variant={activePage === item.id ? "default" : "ghost"}
                  size="icon"
                  className={activePage === item.id ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setActivePage(item.id)}
                >
                  {item.icon}
                </Button>
              </Link>
            ))}
          </div>

          {/* Help & Auth Buttons */}
          <div className="flex items-center gap-2">
            <Link href="/help">
              <Button variant="ghost" size="icon">
                <HelpCircle size={20} />
              </Button>
            </Link>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Spacer element to prevent content from being hidden under the fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}

