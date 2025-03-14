"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import PostCard from "@/components/PostCard"
import { ChevronRight, MapPin, Camera, Users, AlertTriangle, Sparkles, Phone } from "lucide-react"
import { motion } from "framer-motion"

// Hardcoded featured posts
const featuredPosts = [
  {
    id: "1",
    title: "Riverside Trash Accumulation",
    description:
      "Large amount of plastic waste gathering at the river bend. This poses a significant risk to aquatic life and could contaminate the water supply if not addressed promptly.",
    imageUrl:
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "River Park, San Francisco, CA",
    },
    createdAt: "2023-11-15T08:30:00Z",
    updatedAt: "2023-11-15T08:30:00Z",
    userId: "user1",
    userDisplayName: "Alex Johnson",
    userAvatar: "https://i.pravatar.cc/150?u=alex",
    tags: [
      { id: "1", label: "Litter" },
      { id: "3", label: "Water Pollution" },
    ],
    votes: 24,
    status: "open",
    severity: "high",
  },
  {
    id: "2",
    title: "Abandoned Construction Materials",
    description:
      "Construction company left building materials and debris on the sidewalk. It's blocking pedestrian access and collecting rainwater which could become a breeding ground for mosquitoes.",
    imageUrl:
      "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    location: {
      latitude: 37.7893,
      longitude: -122.4008,
      address: "Oak Street, San Francisco, CA",
    },
    createdAt: "2023-11-10T15:45:00Z",
    updatedAt: "2023-11-11T09:20:00Z",
    userId: "user2",
    userDisplayName: "Maya Peterson",
    userAvatar: "https://i.pravatar.cc/150?u=maya",
    tags: [
      { id: "2", label: "Illegal Dumping" },
      { id: "6", label: "Damaged Infrastructure" },
    ],
    votes: 12,
    status: "in-progress",
    severity: "medium",
  },
  {
    id: "3",
    title: "Oil Spill in Community Lake",
    description:
      "Noticed an oil slick forming on the surface of the community lake. The rainbow sheen is visible across approximately 20 square meters and appears to be coming from the north shore.",
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    location: {
      latitude: 37.8044,
      longitude: -122.2711,
      address: "Lake Park, Oakland, CA",
    },
    createdAt: "2023-11-05T11:30:00Z",
    updatedAt: "2023-11-06T16:15:00Z",
    userId: "user3",
    userDisplayName: "Carlos Diaz",
    userAvatar: "https://i.pravatar.cc/150?u=carlos",
    tags: [
      { id: "3", label: "Water Pollution" },
      { id: "9", label: "Wildlife Concern" },
    ],
    votes: 37,
    status: "open",
    severity: "critical",
  },
]

export default function HomePage() {
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    
    // mount -> do delay -> set isLoaded true -> trigger animations
    const timer = setTimeout(() => setIsLoaded(true), 100)
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timer)
    }
  }, [])

  const parallaxOffset = scrollPosition * 0.4

  // define animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  }
  
  const heroImageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 1.2,
        ease: "easeOut"
      }
    }
  }
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }
  
  const buttonHoverAnimation = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  }
  
  const buttonTapAnimation = {
    tap: { 
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={heroImageVariants}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
            transform: `translateY(${parallaxOffset}px)`,
            backgroundPosition: `center ${50 + parallaxOffset * 0.1}%`,
          }}
        ></motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-background"></div>

        <motion.div 
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={staggerContainer}
          className="relative container mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white z-10"
        >
          <motion.div variants={fadeInUp}>
            <Badge className="bg-emerald-600/90 backdrop-blur-sm hover:bg-emerald-600 mb-8 py-1.5 px-5 text-sm">
              Community-Driven Environmental Action
            </Badge>
          </motion.div>
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 max-w-4xl tracking-tight leading-tight"
          >
            Report Environmental Issues.
            <br />
            Inspire Local Action.
          </motion.h1>
          <motion.p 
            variants={fadeInUp}
            className="text-lg sm:text-xl max-w-2xl mb-10 text-white/90 leading-relaxed"
          >
            Join our AI-powered platform to identify, track, and resolve environmental concerns in your neighborhood.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-5"
          >
            <Link href="/map">
              <motion.div
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={{...buttonHoverAnimation, ...buttonTapAnimation}}
              >
                <Button size="lg" className="font-medium bg-emerald-600 hover:bg-emerald-700 text-base px-6 py-6">
                  View Reported Issues
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/map">
              <motion.div
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={{...buttonHoverAnimation, ...buttonTapAnimation}}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="font-medium border-white bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white text-base px-6 py-6"
                >
                  Report an Issue
                  <Camera className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <Badge className="mb-5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Simple Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">How It Works</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our AI-enhanced platform makes it easy to report environmental issues and connect with your community to
            drive positive change.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              className="h-full"
            >
              {index === 0 && (
                <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 rounded-xl h-full flex flex-col">
                  <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                    <Camera className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Report</h3>
                  <p className="text-muted-foreground mb-5 leading-relaxed flex-grow">
                    Take a photo of an environmental issue and upload it with a title. Our AI will help generate tags and
                    descriptions.
                  </p>
                </Card>
              )}
              {index === 1 && (
                <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 rounded-xl h-full flex flex-col">
                  <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                    <Sparkles className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">AI Enhancement</h3>
                  <p className="text-muted-foreground mb-5 leading-relaxed flex-grow">
                    Our AI automatically determines severity, generates tags, and writes detailed descriptions from your photo
                    and title.
                  </p>
                </Card>
              )}
              {index === 2 && (
                <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 rounded-xl h-full flex flex-col">
                  <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                    <Phone className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Auto-Connect</h3>
                  <p className="text-muted-foreground mb-5 leading-relaxed flex-grow">
                    For severe issues, our system automatically notifies relevant organizations and authorities on your
                    behalf.
                  </p>
                </Card>
              )}
              {index === 3 && (
                <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 rounded-xl h-full flex flex-col">
                  <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Take Action</h3>
                  <p className="text-muted-foreground mb-5 leading-relaxed flex-grow">
                    Organize cleanup events, track progress, and collaborate with neighbors to resolve issues in your
                    community.
                  </p>
                </Card>
              )}
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* AI Features Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge className="mb-5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Powered by AI</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Smart Environmental Reporting</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our advanced AI helps streamline the reporting process and ensures critical issues are addressed quickly.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.15,
                  ease: "easeOut" 
                }}
                className="bg-white p-8 rounded-xl shadow-sm border border-emerald-100/50 hover:shadow-md transition-all"
              >
                {index === 0 && (
                  <>
                    <div className="flex items-center mb-5">
                      <div className="bg-emerald-50 rounded-full p-4 mr-4">
                        <Sparkles className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Smart Description Generation</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Just upload a photo and title - our AI will automatically generate a detailed, accurate description of
                      the environmental issue.
                    </p>
                  </>
                )}
                {index === 1 && (
                  <>
                    <div className="flex items-center mb-5">
                      <div className="bg-emerald-50 rounded-full p-4 mr-4">
                        <AlertTriangle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Severity Assessment</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Our AI analyzes images and descriptions to automatically determine the severity level of reported issues
                      for proper prioritization.
                    </p>
                  </>
                )}
                {index === 2 && (
                  <>
                    <div className="flex items-center mb-5">
                      <div className="bg-emerald-50 rounded-full p-4 mr-4">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Automated Organization Alerts</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      For critical issues, our system automatically identifies and notifies relevant organizations, saving you
                      time and ensuring faster responses.
                    </p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-24 container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-12"
        >
          <div>
            <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Recent Reports</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Latest Environmental Issues</h2>
          </div>
          <Link href="/map" className="mt-4 md:mt-0">
            <Button
              variant="outline"
              className="font-medium border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              View All Issues
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: "easeOut" 
                }}
              >
                <PostCard post={post} className="" />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-emerald-50/50 rounded-xl"
          >
            <AlertTriangle className="mx-auto h-12 w-12 text-emerald-600/70 mb-4" />
            <h3 className="text-xl font-medium mb-3">No issues reported yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Be the first to report an environmental issue in your community
            </p>
            <Link href="/map">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Report an Issue</Button>
            </Link>
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-600 text-white">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-6 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 max-w-2xl mx-auto leading-tight">
            Ready to make a difference in your community?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join our AI-powered platform today and help create a cleaner, healthier environment for everyone.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link href="/auth/signup">
              <motion.button
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  rest: { scale: 1, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
                  hover: { 
                    scale: 1.05,
                    boxShadow: "0 10px 15px rgba(0, 0, 0, 0.2)",
                    transition: {
                      duration: 0.2,
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  },
                  tap: { scale: 0.98, transition: { duration: 0.1 } }
                }}
                className="font-medium inline-flex items-center justify-center gap-2 h-10 text-base px-8 py-6 rounded-md shadow bg-white text-emerald-700 hover:bg-white/90 hover:text-emerald-800 relative overflow-hidden group"
              >
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-emerald-50 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative">Sign Up Now</span>
              </motion.button>
            </Link>
            <Link href="/map">
              <motion.button
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={{
                  rest: { scale: 1 },
                  hover: { 
                    scale: 1.05,
                    transition: {
                      duration: 0.2,
                      type: "spring",
                      stiffness: 400,
                      damping: 10
                    }
                  },
                  tap: { scale: 0.98, transition: { duration: 0.1 } }
                }}
                className="font-medium inline-flex items-center justify-center gap-2 h-10 text-base px-8 py-6 rounded-md shadow bg-emerald-500 text-white hover:bg-emerald-400 border-none relative overflow-hidden group"
              >
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative flex items-center">
                  Report an Issue
                  <Camera className="ml-2 h-4 w-4" />
                </span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <MapPin size={18} />
                </span>
                <span className="font-medium text-xl">Envolve</span>
              </Link>
              <p className="text-sm text-slate-500 mt-3 max-w-xs">
                A community-driven platform to report and resolve environmental issues.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 text-sm">
              <div>
                <h4 className="font-semibold mb-4 text-base">Platform</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/map" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Browse Issues
                    </Link>
                  </li>
                  <li>
                    <Link href="/map" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Map View
                    </Link>
                  </li>
                  <li>
                    <Link href="/map" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Report Issue
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-base">Account</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/auth/signin" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth/signup"
                      className="text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      Create Account
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-10 bg-slate-200" />

          <div className="text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Envolve. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

