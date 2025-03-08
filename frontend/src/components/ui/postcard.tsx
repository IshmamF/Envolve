import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { VoteType } from '@/types/Vote';

// helper function to format timestamptz to a relative time string
function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return 'recently';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

// Custom Badge component
const Badge = ({ 
  children, 
  variant, 
  className 
}: { 
  children: React.ReactNode; 
  variant?: string; 
  className?: string 
}) => (
  <motion.span 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.2 }}
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
  >
    {children}
  </motion.span>
);

export default function PostCard({ post }: { post: any }): JSX.Element {
    // Define severity styles
    const severityStyles = {
      high: { color: 'destructive', label: 'High Severity', bgColor: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200' },
      medium: { color: 'warning', label: 'Medium Severity', bgColor: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200' },
      low: { color: 'success', label: 'Low Severity', bgColor: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-800 dark:text-green-200' }
    };
  
    // Default to 'medium' if severity is not set
    const severity = post.severity && severityStyles[post.severity as keyof typeof severityStyles] 
      ? severityStyles[post.severity as keyof typeof severityStyles]
      : severityStyles.medium;
    
    // Format the created_at timestamp
    const relativeTime = formatRelativeTime(post.created_at);
    
    // State for tracking votes
    const initialUpvotes = post.upvotes || 0;
    const initialDownvotes = post.downvotes || 0;
    const [activeVote, setActiveVote] = useState<VoteType>(null);
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);
    
    // Handle vote clicks
    const handleUpvote = () => {
      if (activeVote === 'upvote') {
        // Clicking upvote again resets it
        setUpvotes(initialUpvotes);
        setActiveVote(null);
      } else {
        // If downvote was active, reset it
        if (activeVote === 'downvote') {
          setDownvotes(initialDownvotes);
        }
        // Activate upvote
        setUpvotes(initialUpvotes + 1);
        setActiveVote('upvote');
      }
    };
    
    const handleDownvote = () => {
      if (activeVote === 'downvote') {
        // Clicking downvote again resets it
        setDownvotes(initialDownvotes);
        setActiveVote(null);
      } else {
        // If upvote was active, reset it
        if (activeVote === 'upvote') {
          setUpvotes(initialUpvotes);
        }
        // Activate downvote
        setDownvotes(initialDownvotes + 1);
        setActiveVote('downvote');
      }
    };
    
    return (
      <motion.div 
        className="p-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ 
          scale: 1.01,
          transition: { 
            duration: 0.1, 
            ease: "easeIn" 
          }
        }}
        
        style={{ 
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)" // Slightly bouncy easeOut for hover-off
        }}
      >
        {/* mobile */}
        <div className="block lg:hidden">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            whileHover={{ 
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transition: { duration: 0.15 }
            }}
            style={{ 
              transition: "box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)" // Smooth shadow transition
            }}
          >
            {/* Image container with severity badge */}
            <div className="relative">
              {/* Gray placeholder instead of image */}
              <div className="w-full h-48 bg-gray-300 dark:bg-gray-600"></div>
              <div className="absolute top-3 right-3">
                <Badge className={`${severity.bgColor} ${severity.textColor}`}>
                  {severity.label}
                </Badge>
              </div>
            </div>
            
            {/* Content section */}
            <div className="p-4">
              {/* Title */}
              <motion.h3 
                className="text-lg font-semibold mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {post.title || 'Untitled Post'}
              </motion.h3>
              
              {/* Location */}
              <motion.div 
                className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <MapPin size={12} className="mr-1" />
                {post.location || 'Unknown Location'}
              </motion.div>
              
              <motion.p 
                className="text-sm text-gray-600 dark:text-gray-300 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                {post.description || 'No description available'}
              </motion.p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {post.category && (
                  <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-none">
                    {post.category}
                  </Badge>
                )}
                {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <motion.div 
                className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.2 }}
              >
                <div className="flex space-x-4">
                  {/* mobile upvote and downvote */}
                  <div className="flex items-center">
                    <motion.button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvote();
                      }}
                      className={`flex items-center justify-center w-9 h-9 rounded-full ${
                        activeVote === 'upvote'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ 
                        scale: 1.1, 
                        transition: { 
                          duration: 0.1,
                          ease: "easeIn"
                        } 
                      }}
                      style={{ 
                        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      }}
                    >
                      <ChevronUp size={24} />
                    </motion.button>
                    <span className={`ml-1 font-bold ${
                      activeVote === 'upvote' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {upvotes}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <motion.button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownvote();
                      }}
                      className={`flex items-center justify-center w-9 h-9 rounded-full ${
                        activeVote === 'downvote'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-500'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ 
                        scale: 1.1, 
                        transition: { 
                          duration: 0.1,
                          ease: "easeIn"
                        } 
                      }}
                      style={{ 
                        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      }}
                    >
                      <ChevronDown size={24} />
                    </motion.button>
                    <span className={`ml-1 font-bold ${
                      activeVote === 'downvote' ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {downvotes}
                    </span>
                  </div>
                </div>
                
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {relativeTime}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* desktop*/}
        <div className="hidden lg:flex gap-4">
          <motion.div 
            className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full"
            whileHover={{ 
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
              transition: { duration: 0.15 }
            }}
            style={{ 
              transition: "box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)" // Smooth shadow transition
            }}
          >
            {/* Image container with severity badge */}
            <div className="relative h-36 w-48 flex-shrink-0">
              {/* Gray placeholder instead of image */}
              <div className="h-full w-full bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              <div className="absolute top-2 right-2">
                <Badge className={`${severity.bgColor} ${severity.textColor}`}>
                  {severity.label}
                </Badge>
              </div>
            </div>
            
            {/* Content section */}
            <div className="flex-1">
              {/* Title */}
              <motion.h3 
                className="text-lg font-semibold mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {post.title || 'Untitled Post'}
              </motion.h3>
              
              {/* Location */}
              <motion.div 
                className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <MapPin size={12} className="mr-1" />
                {post.location || 'Unknown Location'}
              </motion.div>
              
              <motion.p 
                className="text-sm text-gray-600 dark:text-gray-300 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              >
                {post.description || 'No description available'}
              </motion.p>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {post.category && (
                  <Badge className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-none">
                    {post.category}
                  </Badge>
                )}
                {post.tags && Array.isArray(post.tags) && post.tags.slice(0, 1).map((tag: string, idx: number) => (
                  <Badge key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <motion.div 
                className="flex items-center justify-between pt-1 text-xs border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.2 }}
              >
                <div className="flex space-x-3">
                  {/* Upvote button - Desktop */}
                  <div className="flex items-center">
                    <motion.button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpvote();
                      }}
                      className={`flex items-center justify-center rounded-full p-1 ${
                        activeVote === 'upvote'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ 
                        scale: 1.2, 
                        transition: {
                          duration: 0.1,
                          ease: "easeIn"
                        }
                      }}
                      style={{ 
                        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      }}
                    >
                      <ChevronUp size={16} />
                    </motion.button>
                    <span className={`text-xs ml-1 ${
                      activeVote === 'upvote' ? 'text-blue-600 dark:text-blue-400 font-medium' : ''
                    }`}>
                      {upvotes}
                    </span>
                  </div>
                  
                  {/* Downvote button - Desktop */}
                  <div className="flex items-center">
                    <motion.button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownvote();
                      }}
                      className={`flex items-center justify-center rounded-full p-1 ${
                        activeVote === 'downvote'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'
                      }`}
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ 
                        scale: 1.2, 
                        transition: {
                          duration: 0.1,
                          ease: "easeIn"
                        }
                      }}
                      style={{ 
                        transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                      }}
                    >
                      <ChevronDown size={16} />
                    </motion.button>
                    <span className={`text-xs ml-1 ${
                      activeVote === 'downvote' ? 'text-red-600 dark:text-red-400 font-medium' : ''
                    }`}>
                      {downvotes}
                    </span>
                  </div>
                </div>
                
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {relativeTime}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
};