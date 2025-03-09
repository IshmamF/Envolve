"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface ApiResponse {
  title: string;
  description: string;
  category: string;
  tags: string;
  severity: string;
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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const videoElement = document.getElementById("video") as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
      }
      setStream(stream);
      setCameraActive(true);
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
  };

  const captureImage = () => {
    const videoElement = document.getElementById("video") as HTMLVideoElement;
    const canvasElement = document.getElementById(
      "canvas"
    ) as HTMLCanvasElement;

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

  // API call to analyze image using React Query
  const analyzeImage = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No image file");

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      return (await response.json()) as ApiResponse;
    },
    onSuccess: (data) => {
      setApiResponse(data);
      setPage(2);
    },
    onError: (error) => {
      console.error("Error analyzing image:", error);
      // Fallback to mock response in case API fails
      const mockResponse: ApiResponse = {
        title: title,
        description: "This appears to be an object that requires attention.",
        category: "General",
        tags: "object,attention,review",
        severity: "Medium",
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
                    <video
                      id="video"
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    />
                    {!cameraActive && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {!cameraActive ? (
                    <Button onClick={startCamera} className="w-full">
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={captureImage} className="w-full">
                      Capture Image
                    </Button>
                  )}
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

            <canvas id="canvas" className="hidden" />
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
