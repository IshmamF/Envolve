'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/PostCard";
import Navbar from "@/components/navbar";
import { 
  ChevronRight, 
  MapPin, 
  Camera, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Phone
} from "lucide-react";

// Hardcoded featured posts
const featuredPosts = [
  {
    id: '1',
    title: 'Riverside Trash Accumulation',
    description: 'Large amount of plastic waste gathering at the river bend. This poses a significant risk to aquatic life and could contaminate the water supply if not addressed promptly.',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'River Park, San Francisco, CA'
    },
    createdAt: '2023-11-15T08:30:00Z',
    updatedAt: '2023-11-15T08:30:00Z',
    userId: 'user1',
    userDisplayName: 'Alex Johnson',
    userAvatar: 'https://i.pravatar.cc/150?u=alex',
    tags: [
      { id: '1', label: 'Litter' },
      { id: '3', label: 'Water Pollution' }
    ],
    votes: 24,
    status: 'open',
    severity: 'high'
  },
  {
    id: '2',
    title: 'Abandoned Construction Materials',
    description: 'Construction company left building materials and debris on the sidewalk. It\'s blocking pedestrian access and collecting rainwater which could become a breeding ground for mosquitoes.',
    imageUrl: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: {
      latitude: 37.7893,
      longitude: -122.4008,
      address: 'Oak Street, San Francisco, CA'
    },
    createdAt: '2023-11-10T15:45:00Z',
    updatedAt: '2023-11-11T09:20:00Z',
    userId: 'user2',
    userDisplayName: 'Maya Peterson',
    userAvatar: 'https://i.pravatar.cc/150?u=maya',
    tags: [
      { id: '2', label: 'Illegal Dumping' },
      { id: '6', label: 'Damaged Infrastructure' }
    ],
    votes: 12,
    status: 'in-progress',
    severity: 'medium'
  },
  {
    id: '3',
    title: 'Oil Spill in Community Lake',
    description: 'Noticed an oil slick forming on the surface of the community lake. The rainbow sheen is visible across approximately 20 square meters and appears to be coming from the north shore.',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: {
      latitude: 37.8044,
      longitude: -122.2711,
      address: 'Lake Park, Oakland, CA'
    },
    createdAt: '2023-11-05T11:30:00Z',
    updatedAt: '2023-11-06T16:15:00Z',
    userId: 'user3',
    userDisplayName: 'Carlos Diaz',
    userAvatar: 'https://i.pravatar.cc/150?u=carlos',
    tags: [
      { id: '3', label: 'Water Pollution' },
      { id: '9', label: 'Wildlife Concern' }
    ],
    votes: 37,
    status: 'open',
    severity: 'critical'
  }
];

// Hardcoded statistics
const stats = [
  { label: "Issues Reported", value: 243 },
  { label: "Issues Resolved", value: 178 },
  { label: "Active Users", value: 1247 },
  { label: "Communities", value: 52 },
];

export default function HomePage () {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activePage, setActivePage] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const parallaxOffset = scrollPosition * 0.4;

  return (
    <div className="min-h-screen">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
      />
      {/* Hero Section */}
      <section className="relative h-[85vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')", 
            transform: `translateY(${parallaxOffset}px)`,
            backgroundPosition: `center ${50 + parallaxOffset * 0.1}%`
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background"></div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white z-10">
          <Badge className="bg-primary/90 backdrop-blur-sm hover:bg-primary mb-6 py-1 px-4">
            Community-Driven Environmental Action
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 max-w-4xl animate-fade-in">
            Report Environmental Issues.<br />Inspire Local Action.
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mb-8 text-white/90 animate-fade-in">
            Join our AI-powered platform to identify, track, and resolve environmental concerns in your neighborhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Link href="/posts">
              <Button size="lg" className="font-medium">
                View Reported Issues
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg" variant="secondary" className="font-medium">
                Report an Issue
                <Camera className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent"></div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge className="mb-4">Simple Process</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-lg text-muted-foreground">
            Our AI-enhanced platform makes it easy to report environmental issues and connect with your community to drive positive change.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="p-6 hover:shadow-md transition-all duration-300 border animate-fade-in">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Report</h3>
            <p className="text-muted-foreground mb-4">
              Take a photo of an environmental issue and upload it with a title. Our AI will help generate tags and descriptions.
            </p>
            <Link href="/create" className="text-primary font-medium inline-flex items-center hover:underline">
              Report an issue
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-all duration-300 border animate-fade-in [animation-delay:100ms]">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">AI Enhancement</h3>
            <p className="text-muted-foreground mb-4">
              Our AI automatically determines severity, generates tags, and writes detailed descriptions from your photo and title.
            </p>
            <Link href="/posts" className="text-primary font-medium inline-flex items-center hover:underline">
              See examples
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-all duration-300 border animate-fade-in [animation-delay:200ms]">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Auto-Connect</h3>
            <p className="text-muted-foreground mb-4">
              For severe issues, our system automatically notifies relevant organizations and authorities on your behalf.
            </p>
            <Link href="/map" className="text-primary font-medium inline-flex items-center hover:underline">
              View organizations
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>
          
          <Card className="p-6 hover:shadow-md transition-all duration-300 border animate-fade-in [animation-delay:300ms]">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Take Action</h3>
            <p className="text-muted-foreground mb-4">
              Organize cleanup events, track progress, and collaborate with neighbors to resolve issues in your community.
            </p>
            <Link href="/map" className="text-primary font-medium inline-flex items-center hover:underline">
              Join community
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Card>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in [animation-delay:200ms]">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* AI Features Section (NEW) */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/20">Powered by AI</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Smart Environmental Reporting</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our advanced AI helps streamline the reporting process and ensures critical issues are addressed quickly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Smart Description Generation</h3>
              </div>
              <p className="text-muted-foreground">
                Just upload a photo and title - our AI will automatically generate a detailed, accurate description of the environmental issue.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Severity Assessment</h3>
              </div>
              <p className="text-muted-foreground">
                Our AI analyzes images and descriptions to automatically determine the severity level of reported issues for proper prioritization.
              </p>
            </div>
            
            <div className="bg-background p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 rounded-full p-3 mr-4">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Automated Organization Alerts</h3>
              </div>
              <p className="text-muted-foreground">
                For critical issues, our system automatically identifies and notifies relevant organizations, saving you time and ensuring faster responses.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Recent Issues Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
          <div>
            <Badge className="mb-2">Recent Reports</Badge>
            <h2 className="text-3xl font-bold">Latest Environmental Issues</h2>
          </div>
          <Link href="/posts" className="mt-4 md:mt-0">
            <Button variant="outline" className="font-medium">
              View All Issues
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        {featuredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPosts.map((post, index) => (
              <PostCard 
                key={post.id} 
                post={post} 
                className="animate-fade-in [animation-delay:200ms]"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No issues reported yet</h3>
            <p className="text-muted-foreground mb-6">
              Be the first to report an environmental issue in your community
            </p>
            <Link href="/create">
              <Button>Report an Issue</Button>
            </Link>
          </div>
        )}
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 max-w-2xl mx-auto">
            Ready to make a difference in your community?
          </h2>
          <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
            Join our AI-powered platform today and help create a cleaner, healthier environment for everyone.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth?mode=register">
              <Button size="lg" variant="secondary" className="font-medium">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 font-medium">
                Report an Issue
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                  <MapPin size={16} />
                </span>
                <span className="font-medium text-lg">EcoCallout</span>
              </Link>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                A community-driven platform to report and resolve environmental issues.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 text-sm">
              <div>
                <h4 className="font-medium mb-3">Platform</h4>
                <ul className="space-y-2">
                  <li><Link href="/posts" className="text-muted-foreground hover:text-foreground">Browse Issues</Link></li>
                  <li><Link href="/map" className="text-muted-foreground hover:text-foreground">Map View</Link></li>
                  <li><Link href="/create" className="text-muted-foreground hover:text-foreground">Report Issue</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Account</h4>
                <ul className="space-y-2">
                  <li><Link href="/auth" className="text-muted-foreground hover:text-foreground">Sign In</Link></li>
                  <li><Link href="/auth?mode=register" className="text-muted-foreground hover:text-foreground">Create Account</Link></li>
                  <li><Link href="/" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Connect</h4>
                <ul className="space-y-2">
                  <li><Link href="/" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
                  <li><Link href="/" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                  <li><Link href="/" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} EcoCallout. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
