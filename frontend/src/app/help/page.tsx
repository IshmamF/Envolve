"use client";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
  const [activePage, setActivePage] = useState("help");
 {/* just gptd shit to fill this up, edit if needed*/}
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Help Center</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Find answers to common questions about using Envolve</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I report an environmental issue?</AccordionTrigger>
                <AccordionContent>
                  To report an environmental issue, navigate to the home page and click the "Report an Issue" button. 
                  Fill out the form with details about the issue, including location, description, and photos if available.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>How can I view issues on the map?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the Map page using the navigation bar at the top of the screen. 
                  The map displays all reported issues with markers. Click on a marker to view more details about that issue.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>How do I update my account information?</AccordionTrigger>
                <AccordionContent>
                  Go to the Settings page by clicking on the Settings icon in the navigation bar. 
                  From there, you can update your name, email, and other account details.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Can I track the status of issues I've reported?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can view all issues you've reported in your profile. Each issue has a status 
                  that indicates whether it's open, in progress, or resolved.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        

      </div>
    </div>
  );
} 