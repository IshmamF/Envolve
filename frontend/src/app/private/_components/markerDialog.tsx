"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, ArrowUp, ArrowDown, CheckCircle } from "lucide-react"
import { Post } from '@/types/Post';
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { upVoteUpdate, downVoteUpdate } from "../actions"

interface Props {
  issue: Post
  openDialog: boolean
  setOpenDialog: (open: boolean) => void
  onUpvote?: (id: number) => Promise<void>
  onDownvote?: (id: number) => Promise<void>
  onResolve?: (id: number) => Promise<void>
}

export default function MarkerDialog({ issue, openDialog, setOpenDialog, onUpvote, onDownvote, onResolve }: Props) {
  const initialUpvotes = issue?.upvotes || 0
  const initialDownvotes = issue?.downvotes || 0
  const initialResolved = issue?.resolved || 0

  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [hasDownvoted, setHasDownvoted] = useState(false)
  const [hasResolved, setHasResolved] = useState(false)

  const [upvoteCount, setUpvoteCount] = useState(initialUpvotes)
  const [downvoteCount, setDownvoteCount] = useState(initialDownvotes)
  const [resolvedCount, setResolvedCount] = useState(initialResolved)

  const queryClient = useQueryClient();
  const upvoteMutation = useMutation({
    mutationFn: upVoteUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['posts']});
    }
  })
  const downvoteMutation = useMutation({
    mutationFn: downVoteUpdate,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['posts']});
    }
  })

  if (!issue) {
    return null
  }

  const handleUpvote = async () => {
    if (hasDownvoted) return 

    if (!hasUpvoted) {
      setHasUpvoted(true)
      setUpvoteCount((prev) => prev + 1)
      upvoteMutation.mutate({vote: upvoteCount + 1, post_id: issue.id})
      if (onUpvote) await onUpvote(issue.id)
    } else {
      setHasUpvoted(false)
      setUpvoteCount((prev) => prev - 1)
      upvoteMutation.mutate({vote: upvoteCount - 1, post_id: issue.id})
      if (onUpvote) await onUpvote(issue.id)
    }
  }

  const handleDownvote = async () => {
    if (hasUpvoted) return

    if (!hasDownvoted) {
      setHasDownvoted(true)
      setDownvoteCount((prev) => prev + 1)
      downvoteMutation.mutate({vote: downvoteCount + 1, post_id: issue.id})
      if (onDownvote) await onDownvote(issue.id)
    } else {
      setHasDownvoted(false)
      setDownvoteCount((prev) => prev - 1)
      downvoteMutation.mutate({vote: downvoteCount - 1, post_id: issue.id})
      if (onDownvote) await onDownvote(issue.id)
    }
  }

  const handleResolve = async () => {
    if (!hasResolved) {
      setHasResolved(true)
      setResolvedCount((prev) => prev + 1)
      if (onResolve) await onResolve(issue.id)
    } else {
      setHasResolved(false)
      setResolvedCount((prev) => prev - 1)
      if (onResolve) await onResolve(issue.id)
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="max-w-md" aria-describedby="issue-description">
        <div className="relative w-full overflow-hidden rounded-t-lg">
          <img
            src={issue.image_url && issue.image_url.trim() !== '' ? issue.image_url : "/placeholder.svg?height=300&width=500"}
            alt={issue.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {issue.category && issue.category.map((cat, index) => (
              <Badge key={index} variant="secondary" className="bg-blue-100 backdrop-blur-sm text-blue-800">
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        <DialogHeader>
          <DialogTitle>{issue.title}</DialogTitle>
          <DialogDescription id="issue-description">
            Environmental issue reported at {issue.location || `coordinates: ${issue.longitude}, ${issue.latitude}`}
          </DialogDescription>
          <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1 text-xs">
              <MapPin size={14} />
              <span className="line-clamp-1">{issue.location || `${issue.longitude}, ${issue.latitude}`}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-2 px-4">
          <p className="text-sm text-muted-foreground">{issue.description}</p>

          <div className="mt-4 pb-4 flex items-center justify-between">
            {issue.isPoll ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 bg-green-600/30"
                  onClick={handleUpvote}
                >
                  <ArrowUp size={16} />
                  <span>{upvoteCount}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 bg-red-600/30"
                  onClick={handleDownvote}
                >
                  <ArrowDown size={16} />
                  <span>{downvoteCount}</span>
                </Button>
              </div>
            ) : (
              <div></div>
            )}

            <Button
              variant={hasResolved ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1"
              onClick={handleResolve}
            >
              <CheckCircle size={16} />
              <span>Mark Resolved</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

