"use client";
import React, { useState } from 'react';
import { Map, MapPin } from 'lucide-react';
import Navbar from '@/components/navbar';
import PostCard from '@/components/ui/postcard';

export default function MapPage() {
  const [activePage, setActivePage] = useState('map');
  
  const posts = [
    { 
      id: 1, 
      title: 'Forest Deforestation Alert', 
      description: 'Satellite imagery shows significant tree loss in protected area.',
      image: '/api/placeholder/600/400',
      severity: 'high',
      category: 'Deforestation',
      location: 'Amazon Rainforest, Brazil',
      upvotes: 24,
      downvotes: 3,
      postedTime: '2 days ago',
      tags: ['#Deforestation', '#Conservation']
    },
    { 
      id: 2, 
      title: 'Water Pollution Report', 
      description: 'Industrial waste detected in local river system affecting wildlife.',
      image: '/api/placeholder/600/400',
      severity: 'medium',
      category: 'Water',
      location: 'Mississippi River, USA',
      upvotes: 18,
      downvotes: 2,
      postedTime: '4 days ago',
      tags: ['#WaterPollution', '#Industry']
    },
    { 
      id: 3, 
      title: 'Air Quality Improvement', 
      description: 'Local initiatives have reduced emissions in the downtown area.',
      image: '/api/placeholder/600/400',
      severity: 'low',
      category: 'Air',
      location: 'Paris, France',
      upvotes: 32,
      downvotes: 1,
      postedTime: '1 week ago',
      tags: ['#CleanAir', '#UrbanPlanning']
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar - Always on top */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      {/* Main Content - Different layouts for mobile and desktop */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block md:w-[420px] lg:w-[480px] xl:w-[520px] bg-white dark:bg-gray-800 overflow-y-auto border-r border-t border-gray-200 dark:border-gray-700">
          <PostsContainer posts={posts} />
        </div>
        
        {/* Map View - Full width on mobile, partial on desktop */}
        <div className="flex-1 overflow-hidden md:order-2 p-4">
          <div className="h-[40vh] md:h-full bg-white dark:bg-gray-800 shadow-sm rounded-lg flex items-center justify-center text-xl text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2">
              <Map size={24} />
              Map View
            </span>
          </div>
        </div>
        
        {/* Mobile Posts Container (hidden on desktop) */}
        <div className="md:hidden flex-1 overflow-auto bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <PostsContainer posts={posts} />
        </div>
      </div>
    </div>
  );
};

// Posts Container Component
const PostsContainer = ({ posts }: { posts: any[] }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-full text-sm
              dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
              focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Search reports"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};