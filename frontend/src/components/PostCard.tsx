import { HardCodedPost } from "@/types/Post";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import {
  MapPin,
  Calendar,
  AlertTriangle,
  AlertCircle,
  AlertOctagon
} from "lucide-react";

interface PostCardProps {
  post: HardCodedPost;
  className?: string;
  showDescription?: boolean;
  compact?: boolean;
}

const PostCard = ({ post, className, showDescription = true, compact = false }: PostCardProps) => {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const getSeverityIcon = () => {
    // Convert to lowercase and handle null/undefined
    const severity = post.severity ? post.severity.toLowerCase() : 'unknown';
    
    switch(severity) {
      case 'low':
        return <AlertCircle size={16} className="text-green-500" />;
      case 'medium':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'high':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'critical':
        return <AlertOctagon size={16} className="text-red-500" />;
      default:
        console.warn(`Unknown severity value: ${post.severity} for post with title: ${post.title}`);
        return <AlertCircle size={16} className="text-gray-500" />;  // Default icon for unknown severity
    }
  };

  return (
    <div className={cn(
      "bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border animate-scale-in",
      post.status === 'resolved' && "bg-muted/50",
      className
    )}>
      {!compact && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {post.tags.map(tag => (
              <Badge key={tag.id} variant="secondary" className="bg-black/60 backdrop-blur-sm text-white">
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn("font-medium line-clamp-2", compact ? "text-base" : "text-lg")}>
            <div className="hover:text-primary transition-colors">
              {post.title}
            </div>
          </h3>
          
          {compact && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {getSeverityIcon()}
              <span className="capitalize">{post.severity}</span>
            </div>
          )}
        </div>

        <div className="flex items-center text-sm text-muted-foreground mt-2 gap-3">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span className="line-clamp-1">{post.location.address || "Unknown location"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>

        {showDescription && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {post.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostCard;