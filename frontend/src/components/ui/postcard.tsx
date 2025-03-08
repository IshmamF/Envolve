import { MapPin, ChevronUp, ChevronDown } from 'lucide-react';

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
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

export default function PostCard({ post }: { post: any }): JSX.Element {
    // Define severity styles
    const severityStyles = {
      high: { color: 'destructive', label: 'High Severity', bgColor: 'bg-red-100 dark:bg-red-900', textColor: 'text-red-800 dark:text-red-200' },
      medium: { color: 'warning', label: 'Medium Severity', bgColor: 'bg-yellow-100 dark:bg-yellow-900', textColor: 'text-yellow-800 dark:text-yellow-200' },
      low: { color: 'success', label: 'Low Severity', bgColor: 'bg-green-100 dark:bg-green-900', textColor: 'text-green-800 dark:text-green-200' }
    };
  
    const severity = severityStyles[post.severity as keyof typeof severityStyles];
    
    return (
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition">
        {/* Vertical layout for mobile/narrow views */}
        <div className="block lg:hidden">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
            
            {/* Content */}
            <div className="p-4">
              {/* Title and Location */}
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{post.title}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <MapPin size={12} className="mr-1" />
                  {post.location}
                </div>
              </div>
              
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {post.description}
              </p>
              
              {/* Tags and Category */}
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-none">
                  {post.category}
                </Badge>
                {post.tags.map((tag: string, idx: number) => (
                  <Badge key={idx} className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Votes and Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-4">
                  {/* Upvotes */}
                  <div className="flex items-center space-x-1">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                      <ChevronUp size={20} />
                    </button>
                    <span className="text-sm font-medium">{post.upvotes}</span>
                  </div>
                  
                  {/* Downvotes */}
                  <div className="flex items-center space-x-1">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                      <ChevronDown size={20} />
                    </button>
                    <span className="text-sm font-medium">{post.downvotes}</span>
                  </div>
                </div>
                
                {/* Date Posted */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Posted {post.postedTime}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Horizontal layout for wider views */}
        <div className="hidden lg:flex gap-4">
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
          
          {/* Content */}
          <div className="flex-1">
            {/* Title and Location */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <MapPin size={12} className="mr-1" />
                {post.location}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {post.description}
            </p>
            
            {/* Tags and Category */}
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-none">
                {post.category}
              </Badge>
              {post.tags.slice(0, 1).map((tag: string, idx: number) => (
                <Badge key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none">
                  {tag}
                </Badge>
              ))}
            </div>
            
            {/* Votes and Actions */}
            <div className="flex items-center justify-between pt-1 text-xs border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                {/* Upvotes */}
                <div className="flex items-center">
                  <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-xs ml-1">{post.upvotes}</span>
                </div>
                
                {/* Downvotes */}
                <div className="flex items-center">
                  <button className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                    <ChevronDown size={16} />
                  </button>
                  <span className="text-xs ml-1">{post.downvotes}</span>
                </div>
              </div>
              
              {/* Date Posted */}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {post.postedTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };