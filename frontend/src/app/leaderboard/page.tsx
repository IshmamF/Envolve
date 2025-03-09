"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Ticket, Star, Medal } from "lucide-react";
import { motion } from "framer-motion";

// Fake user data for the leaderboard
const leaderboardUsers = [
  { id: 1, firstName: "Emma", lastName: "Johnson", points: 1250, badges: ["Top Contributor", "Environmental Hero"] },
  { id: 2, firstName: "Liam", lastName: "Smith", points: 980, badges: ["Clean-up Champion"] },
  { id: 3, firstName: "Olivia", lastName: "Williams", points: 875, badges: ["Tree Planter"] },
  { id: 4, firstName: "Noah", lastName: "Brown", points: 750, badges: ["Water Guardian"] },
  { id: 5, firstName: "Ava", lastName: "Jones", points: 720, badges: ["Recycling Expert"] },
  { id: 6, firstName: "William", lastName: "Miller", points: 690, badges: ["Wildlife Protector"] },
  { id: 7, firstName: "Sophia", lastName: "Davis", points: 650, badges: [] },
  { id: 8, firstName: "James", lastName: "Garcia", points: 580, badges: ["Green Innovator"] },
  { id: 9, firstName: "Isabella", lastName: "Rodriguez", points: 560, badges: [] },
  { id: 10, firstName: "Benjamin", lastName: "Wilson", points: 490, badges: ["Community Organizer"] },
];

// Raffle prizes data
const rafflePrizes = [
  { id: 1, name: "Eco-friendly Water Bottle", tickets: 50, remaining: 5, tier: "bronze" },
  { id: 2, name: "Reusable Shopping Bag Set", tickets: 100, remaining: 10, tier: "bronze" },
  { id: 3, name: "Solar-Powered Phone Charger", tickets: 250, remaining: 3, tier: "silver" },
  { id: 4, name: "Tree Planting Kit", tickets: 300, remaining: 7, tier: "silver" },
  { id: 5, name: "Smart Home Energy Monitor", tickets: 500, remaining: 2, tier: "gold" },
  { id: 6, name: "Electric Scooter", tickets: 1000, remaining: 1, tier: "platinum" },
];

export default function LeaderboardPage() {
  // Function to determine trophy icon color based on position
  const getTrophyColor = (position: number) => {
    switch (position) {
      case 0: return "text-yellow-500"; // Gold
      case 1: return "text-gray-400";   // Silver
      case 2: return "text-amber-700";  // Bronze
      default: return "text-gray-500";  // Others
    }
  };
  
  // Function to determine prize tier styling
  const getPrizeTierStyle = (tier: string) => {
    switch (tier) {
      case "platinum": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "gold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "silver": return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "bronze": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Environmental Heroes Leaderboard</h1>
      <p className="text-muted-foreground mb-8">
        Recognizing our top contributors in making the world a better place.
      </p>

      {/* Leaderboard Section */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
            Top Contributors
          </CardTitle>
          <CardDescription>
            Users with the most environmental impact points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboardUsers.map((user, index) => (
              <motion.div 
                key={user.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors"
                whileHover={{ 
                  scale: 1.03,
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center gap-3">
                  <motion.div 
                    className={`flex items-center justify-center h-8 w-8 rounded-full bg-muted ${index < 3 ? getTrophyColor(index) : "text-muted-foreground"}`}
                    whileHover={{ scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    {index < 3 ? (
                      <Trophy className="h-4 w-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </motion.div>
                  <div>
                    <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                    <div className="flex gap-1 mt-1">
                      {user.badges.map((badge, i) => (
                        <Badge key={i} variant="outline" className="text-xs px-1 py-0">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">{user.points.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Raffle Prizes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="mr-2 h-6 w-6 text-pink-500" />
            Raffle Ticket Prizes
          </CardTitle>
          <CardDescription>
            Redeem your points for raffle tickets to win these amazing eco-friendly prizes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rafflePrizes.map((prize) => (
              <motion.div 
                key={prize.id} 
                className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{prize.name}</h3>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 500, damping: 10 }}
                  >
                    <Badge className={getPrizeTierStyle(prize.tier)}>
                      {prize.tier.charAt(0).toUpperCase() + prize.tier.slice(1)}
                    </Badge>
                  </motion.div>
                </div>
                <motion.div 
                  className="flex items-center gap-1 mt-4"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Ticket className="h-4 w-4 text-blue-500" />
                  <span className="font-bold">{prize.tickets}</span>
                  <span className="text-xs text-muted-foreground">tickets required</span>
                </motion.div>
                <Separator className="my-2" />
                <div className="text-sm text-muted-foreground">
                  Only {prize.remaining} prize{prize.remaining !== 1 ? 's' : ''} remaining!
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 