"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, Camera, ArrowRight, ArrowLeft, Save } from "lucide-react"

interface ApiResponse {
  title: string
  description: string
  category: string
  tags: string
  severity: string
}

export function ImageCaptureDialog() {
  const [open, setOpen] = useState(false)
  const [page, setPage] = useState<1 | 2>(1)
  const [title, setTitle] = useState("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null)

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      resetState()
    }
  }

  const resetState = () => {
    setPage(1)
    setTitle("")
    setCapturedImage(null)
    setFile(null)
    stopCamera()
    setCameraActive(false)
    setLoading(false)
    setApiResponse(null)
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      const videoElement = document.getElementById("video") as HTMLVideoElement
      if (videoElement) {
        videoElement.srcObject = stream
      }
      setStream(stream)
      setCameraActive(true)
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  const captureImage = () => {
    const videoElement = document.getElementById("video") as HTMLVideoElement
    const canvasElement = document.getElementById("canvas") as HTMLCanvasElement

    if (!videoElement || !canvasElement) return

    const context = canvasElement.getContext("2d")
    if (context) {
      canvasElement.width = videoElement.videoWidth
      canvasElement.height = videoElement.videoHeight
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height)

      const imageDataUrl = canvasElement.toDataURL("image/jpeg")
      setCapturedImage(imageDataUrl)

      // Convert data URL to File without using fetch
      // Remove the data URL prefix to get the base64 string
      const base64String = imageDataUrl.split(",")[1]
      // Convert base64 to binary
      const binaryString = atob(base64String)
      // Create an array buffer
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      // Create a blob from the array buffer
      const blob = new Blob([bytes], { type: "image/jpeg" })
      // Create a file from the blob
      const file = new File([blob], `captured-${Date.now()}.jpg`, { type: "image/jpeg" })
      setFile(file)

      stopCamera()
    }
  }

  const handleNext = async () => {
    if (!file || !title.trim()) return

    setLoading(true)

    try {
      // Simulate API call for demo purposes
      // In a real app, you would call your ML model API here
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock API response
      const mockResponse: ApiResponse = {
        title: title,
        description: "This appears to be an object that requires attention.",
        category: "General",
        tags: "object,attention,review",
        severity: "Medium",
      }

      setApiResponse(mockResponse)
      setPage(2)
    } catch (error) {
      console.error("Error analyzing image:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    // Here you would submit the final data to your backend
    console.log("Submitting data:", {
      title: apiResponse?.title,
      description: apiResponse?.description,
      category: apiResponse?.category,
      tags: apiResponse?.tags,
      severity: apiResponse?.severity,
      image: file,
    })

    // Close the dialog after submission
    setOpen(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Report Issue</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{page === 1 ? "Capture Image" : "Review Details"}</DialogTitle>
        </DialogHeader>

        {page === 1 ? (
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title" />
            </div>

            <div className="flex flex-col items-center space-y-3">
              {!capturedImage ? (
                <>
                  <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                    <video id="video" className="w-full h-full object-cover" autoPlay playsInline />
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
                        setCapturedImage(null)
                        setFile(null)
                      }}
                      className="flex-1"
                    >
                      Retake
                    </Button>
                    <Button onClick={handleNext} disabled={loading || !title.trim()} className="flex-1">
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

            <canvas id="canvas" className="hidden" />
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            {capturedImage && (
              <div className="w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={apiResponse?.title || ""}
                onChange={(e) => setApiResponse((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={apiResponse?.description || ""}
                onChange={(e) => setApiResponse((prev) => (prev ? { ...prev, description: e.target.value } : prev))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <div className="flex items-center">
                <Badge className={`${getSeverityColor(apiResponse?.severity || "")}`}>
                  {apiResponse?.severity || "Unknown"}
                </Badge>
                <span className="ml-2 text-sm text-gray-500">(Automatically determined)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={apiResponse?.tags || ""}
                onChange={(e) => setApiResponse((prev) => (prev ? { ...prev, tags: e.target.value } : prev))}
                placeholder="Comma-separated tags"
              />
              <p className="text-xs text-gray-500">Separate tags with commas</p>
            </div>
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
            <Button type="button" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              Submit
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

