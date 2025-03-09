"use client";

import { useRef, useState } from "react";
import PostForm from "./PostForm";

interface ApiResponse {
  title: string;
  description: string;
  category: string;
  tags: string;
  severity: string;
}

const CameraCapture = ({ onCapture }: { onCapture: (image: File) => void }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStream(stream);
      setCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const imageDataUrl = canvasRef.current.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);

      // Convert Data URL to File
      fetch(imageDataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `captured-${Date.now()}.jpg`, { type: "image/jpeg" });
          setFile(file);
        });

      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const handleNext = async () => {
    if (!file) return;
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      setApiResponse(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {!apiResponse ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Take a Picture</h2>

          {!capturedImage ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-64 h-48 border rounded" />
              {!cameraActive ? (
                <button className="bg-green-500 text-white px-4 py-2 mt-2 rounded" onClick={startCamera}>
                  Start Camera
                </button>
              ) : (
                <button className="bg-blue-500 text-white px-4 py-2 mt-2 rounded" onClick={captureImage}>
                  Capture
                </button>
              )}
            </>
          ) : (
            <>
              <img src={capturedImage} alt="Captured" className="w-64 h-48 border rounded" />
              <button 
                className="bg-yellow-500 text-white px-4 py-2 mt-2 rounded" 
                onClick={() => {
                  setCapturedImage(null);
                  setFile(null);
                }}
              >
                Retake
              </button>
              <button 
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Next'}
              </button>
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </>
      ) : (
        <PostForm 
          image={file!} 
          apiData={apiResponse}
        />
      )}
    </div>
  );
};

export default CameraCapture;
