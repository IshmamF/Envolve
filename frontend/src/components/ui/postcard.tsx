import {
  MapPin,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  Phone,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { VoteType } from "@/types/Vote";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { upVoteUpdate, downVoteUpdate } from "@/app/private/actions";
import { subscribeToPostStatusChanges } from "@/lib/supabase/post";

// helper function to format timestamptz to a relative time string
function formatRelativeTime(timestamp: string): string {
  if (!timestamp) return "recently";

  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
}

// Custom Badge component
const Badge = ({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
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
  const queryClient = useQueryClient();

  // Add these new states for the API call
  const [isApiCalling, setIsApiCalling] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const upvoteMutation = useMutation({
    mutationFn: upVoteUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      checkPostStatus();
    },
  });
  const downvoteMutation = useMutation({
    mutationFn: downVoteUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  // Define severity styles
  const severityStyles = {
    high: {
      color: "destructive",
      label: "High Severity",
      bgColor: "bg-red-100 dark:bg-red-900",
      textColor: "text-red-800 dark:text-red-200",
    },
    medium: {
      color: "warning",
      label: "Medium Severity",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
      textColor: "text-yellow-800 dark:text-yellow-200",
    },
    low: {
      color: "success",
      label: "Low Severity",
      bgColor: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-800 dark:text-green-200",
    },
  };

  // Default to 'medium' if severity is not set
  const severity =
    post.severity &&
    severityStyles[post.severity as keyof typeof severityStyles]
      ? severityStyles[post.severity as keyof typeof severityStyles]
      : severityStyles.medium;

  // Format the created_at timestamp
  const relativeTime = formatRelativeTime(post.created_at);

  // State for tracking votes and status
  const initialUpvotes = post.upvotes || 0;
  const initialDownvotes = post.downvotes || 0;
  const [activeVote, setActiveVote] = useState<VoteType>(null);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [isApproved, setIsApproved] = useState(post.status || false);
  const [isProcessed, setIsProcessed] = useState(post.processed || false);

  // State for checking if we're on the client-side
  const [isDesktop, setIsDesktop] = useState(false);

  // Add this new function to call the NYC Issue Analyzer API
  const callIssueAnalyzer = async () => {
    try {
      setIsApiCalling(true);
      setApiError(null);

      // Get phone number from Supabase or use a default for testing
      const phoneNumber = "+15166691175";

      // Format tags from array to comma-separated string
      const formattedTags = Array.isArray(post.tags) ? post.tags.join(",") : "";

      // Prepare the API payload
      const apiPayload = {
        title: post.title || "Untitled Issue",
        description: post.description || "No description available",
        severity: post.severity?.toLowerCase() || "medium",
        tags: formattedTags,
        location: post.location || "Unknown Location",
        to_number: phoneNumber,
        photo_info: post.image_url
          ? `Image available at: ${post.image_url}`
          : "No image available",
      };

      console.log("Calling API with payload:", apiPayload);

      // Call the API
      const response = await fetch(
        "https://garvsl--nyc-issue-analyzer-with-hume-api.modal.run/analyze-and-call",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Error calling NYC Issue Analyzer");
      }

      console.log("API result:", result);

      // Store the result
      setApiResult(result);
      setIsProcessed(true);
    } catch (error: any) {
      console.error("API call failed:", error);
      setApiError(error.message || "Failed to analyze issue");
    } finally {
      setIsApiCalling(false);
    }
  };

  // Check if we're on the client-side and update isDesktop state
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Set initial value
    checkIfDesktop();

    // Add resize listener
    window.addEventListener("resize", checkIfDesktop);

    // Clean up
    return () => window.removeEventListener("resize", checkIfDesktop);
  }, []);

  // Add right after the resize effect
  useEffect(() => {
    if (post.id && !isApproved) {
      console.log(`Setting up status subscription for post ${post.id}`);

      const unsubscribe = subscribeToPostStatusChanges((updatedPost) => {
        // Only update if this is the post that was changed
        if (updatedPost.id === post.id) {
          console.log(`Post ${post.id} status changed to approved`);
          setIsApproved(true);
        }
      });

      return () => unsubscribe();
    }
  }, [post.id, isApproved]);

  // Load API result from Supabase if post is already processed
  useEffect(() => {
    if (post.processed && post.selected_organization && !apiResult) {
      // Create a mock result based on data from post
      setApiResult({
        analysis: {
          recommendation: {
            selectedOrganization: post.selected_organization,
            organizationId: post.organization_id || null,
            justification: post.justification || "Issue analysis complete",
          },
        },
        call: {
          status: post.call_status || "completed",
          call_sid: post.call_sid || "unknown",
          call_script: post.call_script || "Call script not available",
        },
      });
      setIsProcessed(true);
    }
  }, [post, apiResult]);

  // Handle vote clicks
  const handleUpvote = async () => {
    if (activeVote === "upvote") {
      // Clicking upvote again resets it
      setUpvotes(initialUpvotes);
      upvoteMutation.mutate({ vote: initialUpvotes, post_id: post.id });
      setActiveVote(null);
    } else {
      // If downvote was active, reset it
      if (activeVote === "downvote") {
        setDownvotes(initialDownvotes);
      }
      // Activate upvote
      setUpvotes(initialUpvotes + 1);
      upvoteMutation.mutate({ vote: initialUpvotes + 1, post_id: post.id });
      setActiveVote("upvote");
    }
  };

  const handleDownvote = () => {
    if (activeVote === "downvote") {
      // Clicking downvote again resets it
      setDownvotes(initialDownvotes);
      downvoteMutation.mutate({ vote: initialUpvotes, post_id: post.id });
      setActiveVote(null);
    } else {
      // If upvote was active, reset it
      if (activeVote === "upvote") {
        setUpvotes(initialUpvotes);
      }
      // Activate downvote
      setDownvotes(initialDownvotes + 1);
      downvoteMutation.mutate({ vote: initialUpvotes + 1, post_id: post.id });
      setActiveVote("downvote");
    }
  };

  // Add after upvote mutation
  const checkPostStatus = async () => {
    try {
      const status = await fetch(`/api/check-post-status?id=${post.id}`).then(
        (r) => r.json()
      );
      if (status) setIsApproved(true);
    } catch (err) {
      console.error("Error checking status:", err);
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
          ease: "easeIn",
        },
      }}
      style={{
        transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        whileHover={{
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          transition: { duration: 0.15 },
        }}
        style={{
          transition: "box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Card Content with Responsive Layout */}
        <div className="flex flex-col lg:flex-row lg:gap-4 lg:p-4">
          {/* Image container with severity badge */}
          <div className="relative w-full lg:w-48 lg:h-36 lg:flex-shrink-0">
            {post.image_url && post.image_url.trim() !== "" ? (
              <img
                src={post.image_url}
                alt={post.title || "Post image"}
                className="w-full h-48 lg:h-full object-cover lg:rounded-lg"
              />
            ) : (
              <div className="w-full h-48 lg:h-full bg-gray-300 dark:bg-gray-600 lg:rounded-lg"></div>
            )}
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Badge className={`${severity.bgColor} ${severity.textColor}`}>
                {severity.label}
              </Badge>

              {/* Approval Badge */}
              {isApproved && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 animate-pulse">
                  Call Approved
                </Badge>
              )}

              {/* Processed Badge */}
              {isProcessed && (
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  311 Processed
                </Badge>
              )}
            </div>
          </div>

          {/* Content section */}
          <div className="p-4 lg:p-0 lg:flex-1">
            {/* Title */}
            <motion.h3
              className="text-lg font-semibold mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              {post.title || "Untitled Post"}
            </motion.h3>

            {/* Location */}
            <motion.div
              className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              <MapPin size={12} className="mr-1" />
              {post.location || "Unknown Location"}
            </motion.div>

            <motion.p
              className="text-sm text-gray-600 dark:text-gray-300 mb-3 lg:mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              {post.description || "No description available"}
            </motion.p>

            <div className="flex flex-wrap gap-1 mb-3 lg:mb-2">
              {post.category && (
                <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-none">
                  {post.category}
                </Badge>
              )}
              {post.tags &&
                Array.isArray(post.tags) &&
                post.tags
                  .slice(0, isDesktop ? 1 : 3)
                  .map((tag: string, idx: number) => (
                    <Badge
                      key={idx}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none"
                    >
                      {tag}
                    </Badge>
                  ))}
            </div>

            <motion.div
              className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 lg:pt-1 lg:text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.2 }}
            >
              <div className="flex space-x-4 lg:space-x-3">
                {/* Voting buttons - only shown for polls */}
                {post.isPoll && (
                  <>
                    <div className="flex items-center">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote();
                        }}
                        className={`flex items-center justify-center ${
                          isDesktop
                            ? "rounded-full p-1"
                            : "w-9 h-9 rounded-full"
                        } ${
                          activeVote === "upvote"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500 lg:border-0"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 lg:bg-transparent"
                        }`}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{
                          scale: isDesktop ? 1.2 : 1.1,
                          transition: {
                            duration: 0.1,
                            ease: "easeIn",
                          },
                        }}
                        style={{
                          transition:
                            "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      >
                        <ChevronUp size={isDesktop ? 16 : 24} />
                      </motion.button>
                      <span
                        className={`ml-1 ${
                          isDesktop ? "text-xs" : "font-bold"
                        } ${
                          activeVote === "upvote"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {upvotes}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownvote();
                        }}
                        className={`flex items-center justify-center ${
                          isDesktop
                            ? "rounded-full p-1"
                            : "w-9 h-9 rounded-full"
                        } ${
                          activeVote === "downvote"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-2 border-red-500 lg:border-0"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 lg:bg-transparent"
                        }`}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{
                          scale: isDesktop ? 1.2 : 1.1,
                          transition: {
                            duration: 0.1,
                            ease: "easeIn",
                          },
                        }}
                        style={{
                          transition:
                            "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        }}
                      >
                        <ChevronDown size={isDesktop ? 16 : 24} />
                      </motion.button>
                      <span
                        className={`ml-1 ${
                          isDesktop ? "text-xs" : "font-bold"
                        } ${
                          activeVote === "downvote"
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {downvotes}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Show approved icon next to the date for approved posts */}
                {isApproved && (
                  <CheckCircle
                    size={isDesktop ? 14 : 16}
                    className="text-green-500"
                  />
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {relativeTime}
                </span>
              </div>
            </motion.div>

            {/* Add the NYC Issue Analyzer button when upvotes > 30 */}
            {(upvotes > 30 || initialUpvotes > 30) && !isProcessed && (
              <div className="mt-3 flex flex-col">
                <motion.button
                  onClick={callIssueAnalyzer}
                  disabled={isApiCalling}
                  className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium 
                      ${
                        isApiCalling
                          ? "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      }`}
                  whileHover={isApiCalling ? {} : { scale: 1.02 }}
                  whileTap={isApiCalling ? {} : { scale: 0.98 }}
                >
                  <Phone size={16} className="mr-2" />
                  {isApiCalling ? "Processing..." : "Call NYC Issue Analyzer"}
                </motion.button>

                {apiError && (
                  <div className="mt-2 text-xs text-red-500">
                    Error: {apiError}
                  </div>
                )}
              </div>
            )}

            {/* Display API results if available */}
            {apiResult && (
              <motion.div
                className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <h4 className="text-sm font-medium mb-1">Analysis Results</h4>
                <div className="text-xs">
                  <p>
                    <span className="font-medium">Organization:</span>{" "}
                    {apiResult.analysis.recommendation.selectedOrganization}
                  </p>
                  <p>
                    <span className="font-medium">Call Status:</span>{" "}
                    {apiResult.call.status}
                  </p>
                  {apiResult.call.call_sid && (
                    <p>
                      <span className="font-medium">Call ID:</span>{" "}
                      {apiResult.call.call_sid}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
