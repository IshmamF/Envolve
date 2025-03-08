"use client";
import React, { useState, useEffect } from 'react';
import { Map, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/navbar';
import PostCard from '@/components/ui/postcard';
import { getPosts } from '@/lib/supabase/post';
import { Post } from '@/types/Post';

export default function MapPage() {
  const [activePage, setActivePage] = useState('map');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPosts();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar - Always on top */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      
      {/* Main Content - Different layouts for mobile and desktop */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block md:w-[420px] lg:w-[480px] xl:w-[520px] bg-white dark:bg-gray-800 overflow-y-auto overflow-x-hidden border-r border-t border-gray-200 dark:border-gray-700">
          <PostsContainer posts={posts} isLoading={loading} />
        </div>
        
        {/* Map View - Full width on mobile, partial on desktop */}
        <div className="flex-1 overflow-hidden md:order-2 p-4">
          <div className="h-[40vh] md:h-full bg-white dark:bg-gray-800 shadow-sm rounded-lg flex items-center justify-center text-xl text-gray-500 dark:text-gray-400">
            {loading ? (
              <span>Loading map...</span>
            ) : (
              <span className="flex items-center gap-2">
                <Map size={24} />
                Map View
              </span>
            )}
          </div>
        </div>
        
        {/* Mobile Posts Container (hidden on desktop) */}
        <div className="md:hidden flex-1 overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <PostsContainer posts={posts} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}

// Container animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // delay between each child animation
      delayChildren: 0.3,   // delay before starting the staggered animations
    }
  }
};

// Individual post animation variants
const postVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Posts Container Component
const PostsContainer = ({ posts, isLoading }: { posts: Post[], isLoading: boolean }) => {
  return (
    <div className="h-full flex flex-col">
      <motion.div 
        className="p-4 border-b border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
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
      </motion.div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="p-4 text-center">Loading posts...</div>
        ) : posts.length > 0 ? (
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={postVariants}
                  layout
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="p-4 text-center text-gray-500">No posts found</div>
        )}
      </div>
    </div>
  );
};