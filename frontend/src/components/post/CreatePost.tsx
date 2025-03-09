"use client";

import { useState } from "react";
import CameraCapture from "@/components/post/CameraCapture";
import SendToAPI from "@/components/post/SendToAPI";
import PostForm from "@/components/post/PostForm";

export default function AddPost() {
  const [image, setImage] = useState<File | null>(null);
  const [apiData, setApiData] = useState<any | null>(null);

  return !image ? <CameraCapture onCapture={setImage} /> : !apiData ? <SendToAPI image={image} onComplete={setApiData} /> : <PostForm image={image} apiData={apiData} />;
}
