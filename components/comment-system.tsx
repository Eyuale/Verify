"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import {
  Bold,
  Italic,
  Underline,
  Paperclip,
  ImageIcon,
  Smile,
  AtSign,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Flag,
  Trash2,
  CheckCircle,
  ArrowUpDown,
  Clock,
  TrendingUp,
  Loader2,
  X,
  ArrowBigUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface Comment {
  avatar: string;
  username: string;
  _id: string;
  comment: string;
  userId: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  upvote: number;
  downvote: number;
  // New fields to track user's votes
  likedBy: string[];
  upvoteBy: string[];
  downvoteBy: string[];
}

interface CommentSystemProps {
  reviewId: string;
  className?: string;
}

type SortOption = "newest" | "oldest" | "most-upvoted";

export default function CommentSystem({
  reviewId,
  className = "",
}: CommentSystemProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [reportDialog, setReportDialog] = useState<{
    open: boolean;
    commentId: string | null;
  }>({
    open: false,
    commentId: null,
  });
  const [reportReason, setReportReason] = useState("");
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews/${reviewId}/comments`);

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const sortComments = (
    comments: Comment[],
    sortOption: SortOption,
  ): Comment[] => {
    return [...comments].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "most-upvoted":
          return b.upvote - a.upvote;
        default:
          return 0;
      }
    });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to comment.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      setUploadingMedia(true);

      let finalImageUrl = "";
      let finalVideoUrl = "";

      // Step 1: Upload image to S3 if a file is selected
      if (imageFile) {
        // 1a: Get a pre-signed URL from our API
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType: "image",
            contentType: imageFile.type,
          }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadData.error || "Failed to get image upload URL");

        // 1b: Upload the file directly to S3
        const s3Res = await fetch(uploadData.url, {
          method: "PUT",
          body: imageFile,
          headers: { "Content-Type": imageFile.type },
        });
        if (!s3Res.ok) throw new Error("Image upload to S3 failed");

        finalImageUrl = uploadData.key;
      }

      // Step 2: Upload video to S3 if a file is selected
      if (videoFile) {
        // 2a: Get a pre-signed URL from our API
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType: "video",
            contentType: videoFile.type,
          }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok)
          throw new Error(uploadData.error || "Failed to get video upload URL");

        // 2b: Upload the file directly to S3
        const s3Res = await fetch(uploadData.url, {
          method: "PUT",
          body: videoFile,
          headers: { "Content-Type": videoFile.type },
        });
        if (!s3Res.ok) throw new Error("Video upload to S3 failed");

        finalVideoUrl = uploadData.key;
      }

      setUploadingMedia(false);

      // Step 3: Submit comment with media URLs
      const response = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: newComment.trim(),
          userId: user?.id,
          imageUrl: finalImageUrl,
          videoUrl: finalVideoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      const data = await response.json();
      // Ensure the new comment has empty vote arrays
      const newCommentWithVotes = {
        ...data.comment,
        upvote: [],
        downvote: [],
        upvoteBy: [],
        downvoteBy: [],
      };
      setComments((prev) => [newCommentWithVotes, ...prev]);
      setNewComment("");
      setImageFile(null);
      setVideoFile(null);

      toast({
        title: "Success",
        description: "Your comment has been posted!",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: `Failed to submit comment: ${error instanceof Error ? error.message : "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingMedia(false);
    }
  };

  const handleCommentAction = async (
    commentId: string,
    action: "upvote" | "downvote",
  ) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      const commentToUpdate = comments.find(
        (comment) => comment._id === commentId,
      );
      if (!commentToUpdate) return;

      const userId = user.id;
      let newAction: string = action; // 'like', 'accurate', 'inaccurate', 'remove-like', etc.
      let oldActionToRemove: string | null = null;

      // Determine the current state of the user's vote on this comment
      const hasUpvote = commentToUpdate.upvoteBy.includes(userId);
      const hasDownvote = commentToUpdate.downvoteBy.includes(userId);

      // Logic to determine the action to send to the backend
      if (action === "upvote") {
        if (hasUpvote) {
          // If already upvoted, toggle off
          newAction = "remove-upvote";
        } else {
          // If not upvoted, upvote it. Check for existing downvote to remove.
          if (hasDownvote) oldActionToRemove = "downvote";
        }
      } else if (action === "downvote") {
        if (hasDownvote) {
          // If already downvoted, toggle off
          newAction = "remove-downvote";
        } else {
          // If not downvoted, downvote it. Check for existing upvote to remove.
          if (hasUpvote) oldActionToRemove = "upvote";
        }
      }

      const response = await fetch(
        `/api/reviews/${reviewId}/comments/${commentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: newAction,
            userId,
            oldActionToRemove,
          }), // Send userId and oldActionToRemove
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update comment action`);
      }

      const data = await response.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? data.comment : comment,
        ),
      );
    } catch (error) {
      console.error(`Error performing comment action:`, error);
      toast({
        title: "Error",
        description: `Failed to update comment action. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/reviews/${reviewId}/comments/${commentId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setComments((prev) =>
        prev.filter((comment) => comment._id !== commentId),
      );

      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReportComment = () => {
    if (reportDialog.commentId && reportReason) {
      // In a real app, this would send the report to your backend
      console.log(
        "Reporting comment:",
        reportDialog.commentId,
        "Reason:",
        reportReason,
      );
      toast({
        title: "Report Submitted",
        description: "Thank you for your report. We'll review it shortly.",
      });
      setReportDialog({ open: false, commentId: null });
      setReportReason("");
    }
  };

  const RichTextToolbar = ({
    onAction,
  }: {
    onAction: (action: string) => void;
  }) => {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          // 10MB limit
          toast({
            title: "Error",
            description: "Image file size must be less than 10MB.",
            variant: "destructive",
          });
          return;
        }
        setImageFile(file);
        toast({
          title: "Image Selected",
          description: `${file.name} will be uploaded with your comment.`,
        });
      }
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 100 * 1024 * 1024) {
          // 100MB limit
          toast({
            title: "Error",
            description: "Video file size must be less than 100MB.",
            variant: "destructive",
          });
          return;
        }
        setVideoFile(file);
        toast({
          title: "Video Selected",
          description: `${file.name} will be uploaded with your comment.`,
        });
      }
    };

    return (
      <div className="flex items-center gap-1 border-t p-2">
        <Button variant="ghost" size="sm" onClick={() => onAction("bold")}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction("italic")}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction("underline")}>
          <Underline className="h-4 w-4" />
        </Button>
        <div className="bg-border mx-1 h-4 w-px" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("attachment")}
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        {/* Image Upload */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => imageInputRef.current?.click()}
          className={imageFile ? "text-green-600" : ""}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Video Upload */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => videoInputRef.current?.click()}
          className={videoFile ? "text-green-600" : ""}
        >
          <video className="h-4 w-4" />
        </Button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="hidden"
        />

        <Button variant="ghost" size="sm" onClick={() => onAction("emoji")}>
          <Smile className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onAction("mention")}>
          <AtSign className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const CommentItem = ({ comment }: { comment: Comment }) => {
    const userId = user?.id; // Get the current logged-in user's ID

    const hasUpvote = comment.upvoteBy.includes(userId || "");
    // const hasAccurate = comment.accurateBy.includes(userId || "");
    const hasDownvote = comment.downvoteBy.includes(userId || "");

    return (
      <div className="flex gap-3 py-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.avatar} alt="User" />
          <AvatarFallback>
            {comment.userId.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{comment.username}</span>
            <span className="text-muted-foreground text-sm">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>

          <p className="text-sm leading-relaxed">{comment.comment}</p>

          {/* Display S3 Image */}
          {comment.imageUrl && (
            <div className="mt-2">
              <img
                src={
                  comment.imageUrl.startsWith("http")
                    ? comment.imageUrl
                    : `${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${comment.imageUrl}`
                }
                alt="Comment attachment"
                className="max-w-xs rounded-lg border"
                onError={(e) => {
                  console.error("Failed to load image:", comment.imageUrl);
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Display S3 Video */}
          {comment.videoUrl && (
            <div className="mt-2">
              <video
                src={
                  comment.videoUrl.startsWith("http")
                    ? comment.videoUrl
                    : `${process.env.NEXT_PUBLIC_DISTRIBUTION_DOMAIN_NAME}/${comment.videoUrl}`
                }
                controls
                className="max-w-xs rounded-lg border"
                onError={(e) => {
                  console.error("Failed to load video:", comment.videoUrl);
                  e.currentTarget.style.display = "none";
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCommentAction(comment._id, "upvote")}
                className={`h-8 px-2 ${hasUpvote ? "text-blue-600" : ""}`}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="ml-1 text-sm">Upvote . {comment.upvote}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCommentAction(comment._id, "downvote")}
                className={`h-8 px-2 ${hasDownvote ? "text-red-600" : ""}`}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user?.id === comment.userId && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={() =>
                    setReportDialog({ open: true, commentId: comment._id })
                  }
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    );
  };

  const sortedComments = sortComments(comments, sortBy);

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading comments...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comment Input */}
      <Card>
        <CardContent className="p-0">
          <Textarea
            placeholder="Add comment..."
            className="resize-none border-0 focus-visible:ring-0"
            rows={4}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!user?.id}
          />
          {/* Media Preview Section */}
          {(imageFile || videoFile) && (
            <div className="bg-muted/50 border-t p-3">
              <div className="flex items-center gap-4">
                {imageFile && (
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-green-600" />
                    <span>{imageFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageFile(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {videoFile && (
                  <div className="flex items-center gap-2 text-sm">
                    <video className="h-4 w-4 text-green-600" />
                    <span>{videoFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVideoFile(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          <RichTextToolbar
            onAction={(action) => console.log("Rich text action:", action)}
          />
          <div className="flex justify-end p-3">
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !user?.id}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {uploadingMedia ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading media...
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Comments</h3>
          <Badge variant="secondary" className="bg-orange-500 text-white">
            {comments.length}
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 bg-transparent">
              <ArrowUpDown className="h-4 w-4" />
              {sortBy === "newest" && "Most recent"}
              {sortBy === "oldest" && "Oldest first"}
              {sortBy === "most-upvoted" && "Most upvoted"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy("newest")}>
              <Clock className="mr-2 h-4 w-4" />
              Most recent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("oldest")}>
              <Clock className="mr-2 h-4 w-4" />
              Oldest first
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("most-upvoted")}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Most Upvoted
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Comments List */}
      <div className="space-y-0 divide-y">
        {sortedComments.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          sortedComments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>

      {/* Report Dialog */}
      <Dialog
        open={reportDialog.open}
        onOpenChange={(open) => setReportDialog({ open, commentId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Please select a reason for reporting this comment. Our moderation
              team will review it.
            </DialogDescription>
          </DialogHeader>

          <RadioGroup value={reportReason} onValueChange={setReportReason}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="spam" id="spam" />
              <Label htmlFor="spam">Spam or unwanted content</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="harassment" id="harassment" />
              <Label htmlFor="harassment">Harassment or bullying</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hate-speech" id="hate-speech" />
              <Label htmlFor="hate-speech">Hate speech</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="misinformation" id="misinformation" />
              <Label htmlFor="misinformation">Misinformation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="other" id="other" />
              <Label htmlFor="other">Other</Label>
            </div>
          </RadioGroup>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReportDialog({ open: false, commentId: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleReportComment} disabled={!reportReason}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
