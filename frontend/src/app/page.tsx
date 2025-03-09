"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import PostCard from "@/components/PostCard"
import { ChevronRight, MapPin, Camera, Users, AlertTriangle, ArrowUpRight, Sparkles, Phone } from "lucide-react"

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

// Hardcoded statistics
const stats = [
  { label: "Issues Reported", value: 243 },
  { label: "Issues Resolved", value: 178 },
  { label: "Active Users", value: 1247 },
  { label: "Communities", value: 52 },
]

export default function HomePage() {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const parallaxOffset = scrollPosition * 0.4

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
            transform: `translateY(${parallaxOffset}px)`,
            backgroundPosition: `center ${50 + parallaxOffset * 0.1}%`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-background"></div>

        <div className="relative container mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white z-10">
          <Badge className="bg-emerald-600/90 backdrop-blur-sm hover:bg-emerald-600 mb-8 py-1.5 px-5 text-sm">
            Community-Driven Environmental Action
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 max-w-4xl animate-fade-in tracking-tight leading-tight">
            Report Environmental Issues.
            <br />
            Inspire Local Action.
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mb-10 text-white/90 animate-fade-in leading-relaxed">
            Join our AI-powered platform to identify, track, and resolve environmental concerns in your neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 animate-fade-in">
            <Link href="/posts">
              <Button size="lg" className="font-medium bg-emerald-600 hover:bg-emerald-700 text-base px-6 py-6">
                View Reported Issues
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg" variant="secondary" className="font-medium text-base px-6 py-6">
                Report an Issue
                <Camera className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <Badge className="mb-5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Simple Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">How It Works</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Our AI-enhanced platform makes it easy to report environmental issues and connect with your community to
            drive positive change.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 animate-fade-in rounded-xl">
            <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <Camera className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Report</h3>
            <p className="text-muted-foreground mb-5 leading-relaxed">
              Take a photo of an environmental issue and upload it with a title. Our AI will help generate tags and
              descriptions.
            </p>
            <Link href="/create" className="text-emerald-600 font-medium inline-flex items-center hover:underline">
              Report an issue
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 animate-fade-in [animation-delay:100ms] rounded-xl">
            <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <Sparkles className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Enhancement</h3>
            <p className="text-muted-foreground mb-5 leading-relaxed">
              Our AI automatically determines severity, generates tags, and writes detailed descriptions from your photo
              and title.
            </p>
            <Link href="/posts" className="text-emerald-600 font-medium inline-flex items-center hover:underline">
              See examples
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 animate-fade-in [animation-delay:200ms] rounded-xl">
            <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <Phone className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Auto-Connect</h3>
            <p className="text-muted-foreground mb-5 leading-relaxed">
              For severe issues, our system automatically notifies relevant organizations and authorities on your
              behalf.
            </p>
            <Link href="/map" className="text-emerald-600 font-medium inline-flex items-center hover:underline">
              View organizations
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>

          <Card className="p-8 hover:shadow-lg transition-all duration-300 border border-emerald-100/50 animate-fade-in [animation-delay:300ms] rounded-xl">
            <div className="bg-emerald-50 rounded-full w-14 h-14 flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Take Action</h3>
            <p className="text-muted-foreground mb-5 leading-relaxed">
              Organize cleanup events, track progress, and collaborate with neighbors to resolve issues in your
              community.
            </p>
            <Link href="/map" className="text-emerald-600 font-medium inline-flex items-center hover:underline">
              Join community
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in [animation-delay:200ms]">
                <p className="text-5xl font-bold text-emerald-600 mb-3">{stat.value}</p>
                <p className="text-sm font-medium text-emerald-800/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Section (NEW) */}
      <section className="py-24 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="mb-5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Powered by AI</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">Smart Environmental Reporting</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our advanced AI helps streamline the reporting process and ensures critical issues are addressed quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-emerald-100/50 hover:shadow-md transition-all">
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
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-emerald-100/50 hover:shadow-md transition-all">
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
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-emerald-100/50 hover:shadow-md transition-all">
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
            </div>
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-24 container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <Badge className="mb-3 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">Recent Reports</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Latest Environmental Issues</h2>
          </div>
          <Link href="/posts" className="mt-4 md:mt-0">
            <Button
              variant="outline"
              className="font-medium border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              View All Issues
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} className="animate-fade-in [animation-delay:200ms]" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-emerald-50/50 rounded-xl">
            <AlertTriangle className="mx-auto h-12 w-12 text-emerald-600/70 mb-4" />
            <h3 className="text-xl font-medium mb-3">No issues reported yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Be the first to report an environmental issue in your community
            </p>
            <Link href="/create">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Report an Issue</Button>
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 max-w-2xl mx-auto leading-tight">
            Ready to make a difference in your community?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
            Join our AI-powered platform today and help create a cleaner, healthier environment for everyone.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Link href="/auth?mode=register">
              <Button
                size="lg"
                variant="secondary"
                className="font-medium text-base px-8 py-6 bg-white text-emerald-700 hover:bg-white/90"
              >
                Sign Up Now
              </Button>
            </Link>
            <Link href="/create">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10 font-medium text-base px-8 py-6"
              >
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>
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
                <span className="font-medium text-xl">EcoCallout</span>
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
                    <Link href="/posts" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Browse Issues
                    </Link>
                  </li>
                  <li>
                    <Link href="/map" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Map View
                    </Link>
                  </li>
                  <li>
                    <Link href="/create" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Report Issue
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-base">Account</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/auth" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auth?mode=register"
                      className="text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                      Create Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-base">Connect</h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/" className="text-slate-500 hover:text-emerald-600 transition-colors">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-10 bg-slate-200" />

          <div className="text-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} EcoCallout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

