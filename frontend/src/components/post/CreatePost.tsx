"use client";

import { useState } from "react";
import CameraCapture from "@/components/post/CameraCapture";
import SendToAPI from "@/components/post/SendToAPI";
import PostForm from "@/components/post/PostForm";

interface ApiData {
  title: string;
  description: string;
  category: string;
  tags: string;
  severity: string;
}

export default function CreatePost() {
  const [image, setImage] = useState<File | null>(null);
  const [apiData, setApiData] = useState<ApiData | null>(null);

  const handleCapture = (capturedImage: File) => {
    setImage(capturedImage);
  };

  const handleApiResponse = (data: ApiData) => {
    setApiData(data);
  };

  return (
    <div className="max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white">
      {!image && (
        <CameraCapture onCapture={handleCapture} />
      )}
      
      {image && !apiData && (
        <SendToAPI 
          image={image} 
          onComplete={handleApiResponse} 
        />
      )}
      
      {image && apiData && (
        <PostForm 
          image={image} 
          apiData={apiData} 
        />
      )}
    </div>
  );
}
