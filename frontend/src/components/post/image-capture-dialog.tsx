"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Camera,
  ArrowRight,
  ArrowLeft,
  Save,
  MapPin,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react";

// Configuration
const DETECTION_API_URL = process.env.NEXT_PUBLIC_DETECTION_API_URL || "";
const DETECTION_INTERVAL = 300; // Milliseconds between detection calls (adjust for performance)
const CONFIDENCE_THRESHOLD = 0.6; // Default confidence threshold
const USE_NEXTJS_API = !DETECTION_API_URL; // Use NextJS API if no Modal API URL is provided

interface ApiResponse {
  title: string;
  description: string;
  category: string;
  tags: string;
  severity: string;
  environmental_task?: string;
  image?: string;
  detections?: {
    env: Array<{
      class: string;
      confidence: number;
      box: number[];
    }>;
    coco: Array<{
      class: string;
      confidence: number;
      box: number[];
    }>;
  };
}

// Initialize Supabase client
const getSupabaseClient = () => {
  // Create a new client for each request to avoid stale authentication
  return createClient();
};

export function ImageCaptureDialog() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });

  // Real-time detection state
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [detectionImage, setDetectionImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastDetectionTime = useRef<number>(0);
  const [latestDetections, setLatestDetections] = useState(null);
  const videoReadyRef = useRef(false); // Track if video is really ready

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetState();
    }
  };

  const resetState = () => {
    setPage(1);
    setTitle("");
    setCapturedImage(null);
    setFile(null);
    stopCamera();
    setCameraActive(false);
    setLoading(false);
    setApiResponse(null);
    setLocation({ latitude: null, longitude: null });
    setDetectionImage(null);
    setIsDetecting(false);
    setLatestDetections(null);
    videoReadyRef.current = false;
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
  };

  // Get user's geolocation
  useEffect(() => {
    if (open && page === 1 && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error.message);
        }
      );
    }
  }, [open, page]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      setStream(stream);

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
          videoElement
            .play()
            .then(() => {
              console.log("Camera started successfully");
              setCameraActive(true);
              videoReadyRef.current = true;

              // Add a small delay to ensure everything is initialized
              setTimeout(() => {
                if (detectionEnabled) {
                  console.log("Starting initial detection");
                  detectObjects();
                }
              }, 500);
            })
            .catch((err) => console.error("Error playing video:", err));
        };
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    videoReadyRef.current = false;

    // Stop detection
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
  };

  const captureImage = () => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    if (!videoElement || !canvasElement) return;

    const context = canvasElement.getContext("2d");
    if (context) {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      context.drawImage(
        videoElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      const imageDataUrl = canvasElement.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);

      // Convert data URL to File without using fetch
      const base64String = imageDataUrl.split(",")[1];
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "image/jpeg" });
      const file = new File([blob], `captured-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      setFile(file);

      stopCamera();
    }
  };

  // Real-time detection functions
  const captureFrame = useCallback(() => {
    if (
      !videoReadyRef.current ||
      !cameraActive ||
      !videoRef.current ||
      !canvasRef.current
    )
      return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return null;

    // Check if video has valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log("Video dimensions not ready yet");
      return null;
    }

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the data URL
    return canvas.toDataURL("image/jpeg", 0.7); // Lower quality for better performance
  }, [cameraActive]);

  const detectObjects = useCallback(async () => {
    if (
      !videoReadyRef.current ||
      !cameraActive ||
      !detectionEnabled ||
      isDetecting
    ) {
      console.log("Skipping detection", {
        videoReady: videoReadyRef.current,
        cameraActive,
        detectionEnabled,
        isDetecting,
      });

      // Still schedule next detection if needed
      if (cameraActive && detectionEnabled && !isDetecting) {
        console.log("Rescheduling detection attempt");
        detectionTimeoutRef.current = setTimeout(
          detectObjects,
          DETECTION_INTERVAL
        );
      }

      return;
    }

    // Check if enough time has passed since last detection
    const now = Date.now();
    if (now - lastDetectionTime.current < DETECTION_INTERVAL) {
      // Schedule next detection
      detectionTimeoutRef.current = setTimeout(
        detectObjects,
        DETECTION_INTERVAL - (now - lastDetectionTime.current)
      );
      return;
    }

    const frameDataUrl = captureFrame();
    if (!frameDataUrl) {
      console.log("Failed to capture frame, rescheduling detection");
      detectionTimeoutRef.current = setTimeout(
        detectObjects,
        DETECTION_INTERVAL
      );
      return;
    }

    setIsDetecting(true);
    lastDetectionTime.current = now;
    console.log("Running detection...");

    try {
      // Use Modal API
      if (DETECTION_API_URL) {
        const response = await fetch(
          `${DETECTION_API_URL}/detect?conf_env=${CONFIDENCE_THRESHOLD}&conf_coco=${CONFIDENCE_THRESHOLD}`,
          {
            method: "POST",
            body: frameDataUrl,
          }
        );

        if (!response.ok) {
          throw new Error(`Detection API returned ${response.status}`);
        }

        const result = await response.json();
        console.log("Detection successful");

        // Update the detection image
        if (result && result.image) {
          setDetectionImage(result.image);
          setLatestDetections(result.detections);
        }
      }
      // No real-time detection in NextJS API approach (would require too many requests)
      // Just show the video stream

      // Schedule next detection if camera is still active
      if (cameraActive && detectionEnabled) {
        detectionTimeoutRef.current = setTimeout(
          detectObjects,
          DETECTION_INTERVAL
        );
      }
    } catch (error) {
      console.error("Error during real-time detection:", error);
      // Still try again after delay even if there was an error
      if (cameraActive && detectionEnabled) {
        detectionTimeoutRef.current = setTimeout(
          detectObjects,
          DETECTION_INTERVAL * 2
        ); // Longer delay after error
      }
    } finally {
      setIsDetecting(false);
    }
  }, [cameraActive, captureFrame, detectionEnabled, isDetecting]);

  const scheduleNextDetection = useCallback(() => {
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
    }

    console.log("Scheduling next detection");
    detectionTimeoutRef.current = setTimeout(detectObjects, DETECTION_INTERVAL);
  }, [detectObjects]);

  // Toggle real-time detection
  const toggleDetection = () => {
    if (detectionEnabled) {
      // Turning off detection
      setDetectionEnabled(false);
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
        detectionTimeoutRef.current = null;
      }
      setDetectionImage(null);
    } else {
      // Turning on detection
      setDetectionEnabled(true);
      scheduleNextDetection();
    }
  };

  // Fixed effect for camera state changes
  useEffect(() => {
    console.log("Camera/detection state changed", {
      cameraActive,
      detectionEnabled,
    });

    if (cameraActive && detectionEnabled && videoReadyRef.current) {
      console.log(
        "Camera active and detection enabled - starting detection cycle"
      );
      // Run detection immediately
      detectObjects();
    } else if (!detectionEnabled && detectionTimeoutRef.current) {
      console.log("Detection disabled - clearing timeout");
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
  }, [cameraActive, detectionEnabled, detectObjects]);

  // API call to analyze image using React Query
  const analyzeImage = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No image file");

      // Read the file as base64
      const fileReader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(file);
      });

      // Use Modal API for analysis
      const response = await fetch(`${DETECTION_API_URL}/analyze`, {
        method: "POST",
        body: dataUrl,
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      return (await response.json()) as ApiResponse;
    },
    onSuccess: (data) => {
      setApiResponse(data);
      // If API returns image with detections, update capturedImage
      if (data.image) {
        setCapturedImage(data.image);
      }
      setPage(2);
    },
    onError: (error) => {
      console.error("Error analyzing image:", error);
      // Fallback to mock response in case API fails
      const mockResponse: ApiResponse = {
        title: title || "Captured Image",
        description: "This appears to be an object that requires attention.",
        category: "General",
        tags: "object,attention,review",
        severity: "Medium",
        environmental_task: "Review and address any issues in the image.",
      };
      setApiResponse(mockResponse);
      setPage(2);
    },
  });

  const handleNext = async () => {
    if (!file || !title.trim()) return;
    setLoading(true);

    try {
      await analyzeImage.mutateAsync();
    } finally {
      setLoading(false);
    }
  };

  // Supabase mutations to save data
  const insertPost = useMutation({
    mutationFn: async () => {
      if (!apiResponse) throw new Error("No API response data");

      const supabase = getSupabaseClient();

      // Get current user if authenticated
      const { data: userData } = await supabase.auth.getUser();

      const postData = {
        title: apiResponse.title,
        description: apiResponse.description,
        category: apiResponse.category ? [apiResponse.category] : [],
        tags: apiResponse.tags ? apiResponse.tags.split(",") : [],
        severity: apiResponse.severity,
        environmental_task: apiResponse.environmental_task || "",
        author: userData?.user?.id || "anonymous",
        latitude: location.latitude,
        longitude: location.longitude,
        created_at: new Date().toISOString(), // Add timestamp explicitly
      };

      console.log("Inserting post data:", postData);

      try {
        const { data, error } = await supabase
          .from("posts")
          .insert([postData])
          .select("id")
          .single();

        if (error) {
          console.error("Database insert error:", error);
          throw error;
        }

        console.log("Post inserted with ID:", data.id);
        return data.id;
      } catch (dbError) {
        console.error("Database operation failed:", dbError);
        throw dbError;
      }
    },
  });

  const uploadImage = useMutation({
    mutationFn: async (postId: string) => {
      if (!file) throw new Error("No image file");

      const supabase = getSupabaseClient();

      // Try alternative approach for upload
      const fileName = `${postId}.jpg`;
      console.log("Uploading image:", fileName);

      // First try: Use fetch API to upload to Supabase storage directly
      try {
        // If we're in a browser environment, we'll use fetch directly
        // This is an alternative approach that might work better in some environments
        const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/images/${fileName}`;
        const { data: authData } = await supabase.auth.getSession();
        const token = authData?.session?.access_token;

        if (token) {
          console.log("Uploading via direct fetch API");
          const uploadResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "image/jpeg",
              "x-upsert": "true",
            },
            body: file,
          });

          if (uploadResponse.ok) {
            const { data } = supabase.storage
              .from("images")
              .getPublicUrl(fileName);

            console.log(
              "Image uploaded successfully via fetch API:",
              data.publicUrl
            );
            return data.publicUrl;
          } else {
            console.log("Fetch API upload failed, trying Supabase client...");
          }
        }
      } catch (fetchError) {
        console.error("Fetch API upload attempt failed:", fetchError);
        // Continue to next approach
      }

      // Second try: Use Supabase JS client with binary data
      try {
        console.log("Trying upload with Supabase client and binary data");
        // Convert file to ArrayBuffer for more reliable upload
        const arrayBuffer = await file.arrayBuffer();
        const fileData = new Uint8Array(arrayBuffer);

        const { error } = await supabase.storage
          .from("images")
          .upload(fileName, fileData, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: true,
          });

        if (error) {
          console.error("Supabase storage upload error:", error);
          throw error;
        }

        // Get the public URL
        const { data } = supabase.storage.from("images").getPublicUrl(fileName);

        console.log("Image uploaded successfully:", data.publicUrl);
        return data.publicUrl;
      } catch (error) {
        console.error("Binary upload failed:", error);

        // Third try: Use base64 URL as fallback
        if (capturedImage) {
          console.log("Using base64 image as fallback");
          return capturedImage;
        }

        throw error;
      }
    },
  });

  const updatePostImage = useMutation({
    mutationFn: async ({
      postId,
      imageUrl,
    }: {
      postId: string;
      imageUrl: string;
    }) => {
      const supabase = getSupabaseClient();

      console.log("Updating post with image URL:", { postId, imageUrl });

      try {
        const { error } = await supabase
          .from("posts")
          .update({ image_url: imageUrl })
          .eq("id", postId);

        if (error) {
          console.error("Error updating post with image URL:", error);
          throw error;
        }

        console.log("Post updated successfully with image URL");
      } catch (updateError) {
        console.error("Update operation failed:", updateError);
        throw updateError;
      }
    },
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Insert post to get an ID
      console.log("Creating post in database...");
      const postId = await insertPost.mutateAsync();
      console.log("Post created with ID:", postId);

      try {
        // Upload image using post ID
        console.log("Uploading image...");
        const imageUrl = await uploadImage.mutateAsync(postId);

        // Update post with image URL
        console.log("Updating post with image URL...");
        await updatePostImage.mutateAsync({ postId, imageUrl });
      } catch (imageError) {
        console.error("Image processing error:", imageError);
        // Don't throw the error - we still created the post successfully
        alert(
          "Post created, but there was an issue with the image upload. You may need to upload the image again later."
        );
      }

      // Close dialog after successful submission
      setOpen(false);

      // Show success message
      alert("Post created successfully!");
    } catch (error) {
      console.error("Post creation error:", error);
      if (error instanceof Error) {
        alert(`Failed to create post: ${error.message}`);
      } else if (typeof error === "object" && error !== null) {
        alert(`Failed to create post: ${JSON.stringify(error)}`);
      } else {
        alert("Failed to create post due to an unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-full">Report Issue</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-4 overflow-scroll h-[70%]">
        <DialogHeader>
          <DialogTitle>
            {page === 1 ? "Capture Image" : "Review Details"}
          </DialogTitle>
        </DialogHeader>

        {page === 1 ? (
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title"
              />
            </div>

            <div className="flex flex-col items-center space-y-3">
              {!capturedImage ? (
                <>
                  <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                    {/* Main video element */}
                    <video
                      ref={videoRef}
                      id="video"
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    />

                    {/* Overlay for detection results */}
                    {detectionEnabled && detectionImage && (
                      <img
                        src={detectionImage}
                        className="absolute inset-0 w-full h-full object-cover z-10"
                        alt="Detection overlay"
                      />
                    )}

                    {!cameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Hidden canvas for frame capture */}
                    <canvas ref={canvasRef} id="canvas" className="hidden" />
                  </div>

                  <div className="flex space-x-2 w-full">
                    {!cameraActive ? (
                      <Button onClick={startCamera} className="w-full">
                        Start Camera
                      </Button>
                    ) : (
                      <>
                        <Button onClick={captureImage} className="flex-1">
                          Capture Image
                        </Button>
                        {DETECTION_API_URL && (
                          <Button
                            variant="outline"
                            onClick={toggleDetection}
                            className="flex items-center"
                            title={
                              detectionEnabled
                                ? "Turn off object detection"
                                : "Turn on object detection"
                            }
                          >
                            {detectionEnabled ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={capturedImage || "/placeholder.svg"}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex space-x-2 w-full">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCapturedImage(null);
                        setFile(null);
                      }}
                      className="flex-1"
                    >
                      Retake
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={loading || !title.trim()}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            {location.latitude && location.longitude && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  Location: {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {capturedImage && (
              <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={apiResponse?.title || ""}
                onChange={(e) =>
                  setApiResponse((prev) =>
                    prev ? { ...prev, title: e.target.value } : prev
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={apiResponse?.description || ""}
                onChange={(e) =>
                  setApiResponse((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                rows={3}
              />
            </div>

            {apiResponse?.environmental_task && (
              <div className="space-y-2">
                <Label htmlFor="environmental-task">Environmental Task</Label>
                <div className="flex p-3 bg-gray-50 rounded-md items-start">
                  <Lightbulb className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                  <Textarea
                    id="environmental-task"
                    value={apiResponse?.environmental_task || ""}
                    onChange={(e) =>
                      setApiResponse((prev) =>
                        prev
                          ? { ...prev, environmental_task: e.target.value }
                          : prev
                      )
                    }
                    rows={2}
                    className="bg-transparent border-none focus-visible:ring-0 p-0 shadow-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={apiResponse?.category || ""}
                onChange={(e) =>
                  setApiResponse((prev) =>
                    prev ? { ...prev, category: e.target.value } : prev
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="flex items-center">
                <Badge
                  className={`${getSeverityColor(apiResponse?.severity || "")}`}
                >
                  {apiResponse?.severity || "Unknown"}
                </Badge>
                <span className="ml-2 text-sm text-gray-500">
                  (Automatically determined)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={apiResponse?.tags || ""}
                onChange={(e) =>
                  setApiResponse((prev) =>
                    prev ? { ...prev, tags: e.target.value } : prev
                  )
                }
                placeholder="Comma-separated tags"
              />
              <p className="text-xs text-gray-500">Separate tags with commas</p>
            </div>

            {location.latitude && location.longitude && (
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  Location: {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between sm:justify-between">
          {page === 2 && (
            <Button type="button" variant="outline" onClick={() => setPage(1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          {page === 2 && (
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
