"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Map, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "@/components/ui/postcard";
import { getPosts } from "@/lib/supabase/post";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/types/Post";
import MapBox from "@/app/private/_components/mapbox";
import CreatePost from "@/components/post/CreatePost";
import { ImageCaptureDialog } from "@/components/post/image-capture-dialog";

export default function MapPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: getPosts,
  });
  useEffect(() => console.log(data), [data]);
  //const [posts, setPosts] = useState<Post[]>([]);
  //const [loading, setLoading] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content - Different layouts for mobile and desktop */}
      <div className="flex flex-col md:flex-row md:flex-1 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:block md:w-[420px] lg:w-[480px] xl:w-[520px] bg-white dark:bg-gray-800 overflow-y-auto overflow-x-hidden border-r border-t border-gray-200 dark:border-gray-700">
          <PostsContainer posts={data!} isLoading={isLoading} />
        </div>

        {/* Map View - Full width on mobile, partial on desktop */}
        <div className="md:flex-1 overflow-hidden md:order-2 p-4">
          {isLoading ? (
            <div className="h-[40vh] md:h-full bg-white dark:bg-gray-800 shadow-sm rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="h-[40vh] md:h-full bg-white dark:bg-gray-800 shadow-sm rounded-lg flex items-center justify-center text-xl text-gray-500 dark:text-gray-400">
              <MapBox data={data!} />
            </div>
          )}
        </div>

        {/* Mobile Posts Container (hidden on desktop) */}
        <div className="md:hidden h-[calc(60vh-64px)] overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <PostsContainer posts={data!} isLoading={isLoading} />
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
      delayChildren: 0.3, // delay before starting the staggered animations
    },
  },
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
      damping: 24,
    },
  },
};

// Posts Container Component
const PostsContainer = ({
  posts,
  isLoading,
}: {
  posts: Post[];
  isLoading: boolean;
}) => {
  return (
    <div className="h-full flex flex-col">
      <motion.div
        className="p-4 border-b w-full gap-2 flex flex-row border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex-1 relative">
          <input
            type="text"
            className="flex-1 w-full  pl-10 pr-4 py-2 border dark:border-gray-700 rounded-full text-sm
              dark:bg-gray-800 dark:text-white dark:placeholder-gray-400
              focus:outline-none focus:ring-1 focus:ring-green-500"
            placeholder="Search reports"
          />

          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <ImageCaptureDialog />
      </motion.div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : posts.length > 0 ? (
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {posts.map((post, index) => (
                <motion.div key={post.id} variants={postVariants} layout>
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
