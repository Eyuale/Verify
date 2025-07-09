// comment-system.tsx
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
  Reply,
  ChevronDown, // New: for collapse/expand
  ChevronUp, // New: for collapse/expand
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
  likedBy: string[];
  upvoteBy: string[];
  downvoteBy: string[];
  parentCommentId: string | null;
  depth: number;
  replies?: Comment[];
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
  const [newCommentText, setNewCommentText] = useState("");
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

  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null,
  );
  const [replyText, setReplyText] = useState("");
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  useEffect(() => {
    if (replyingToCommentId && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingToCommentId]);

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
    const sorted = [...comments];

    switch (sortOption) {
      case "newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "most-upvoted":
        return sorted.sort((a, b) => b.upvote - a.upvote);
      default:
        return sorted;
    }
  };

  const handleAddComment = async (
    commentText: string,
    parentCommentId: string | null = null,
  ) => {
    if (!commentText.trim()) {
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

      if (imageFile) {
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

        const s3Res = await fetch(uploadData.url, {
          method: "PUT",
          body: imageFile,
          headers: { "Content-Type": imageFile.type },
        });
        if (!s3Res.ok) throw new Error("Image upload to S3 failed");

        finalImageUrl = uploadData.key;
      }

      if (videoFile) {
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

        const s3Res = await fetch(uploadData.url, {
          method: "PUT",
          body: videoFile,
          headers: { "Content-Type": videoFile.type },
        });
        if (!s3Res.ok) throw new Error("Video upload to S3 failed");

        finalVideoUrl = uploadData.key;
      }

      setUploadingMedia(false);

      const response = await fetch(`/api/reviews/${reviewId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comment: commentText.trim(),
          userId: user?.id,
          imageUrl: finalImageUrl,
          videoUrl: finalVideoUrl,
          parentCommentId: parentCommentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }

      await fetchComments();

      if (parentCommentId) {
        setReplyText("");
        setReplyingToCommentId(null);
      } else {
        setNewCommentText("");
      }

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
      let commentToUpdate: Comment | undefined;
      const findComment = (
        commentsArr: Comment[],
        id: string,
      ): Comment | undefined => {
        for (const c of commentsArr) {
          if (c._id === id) return c;
          if (c.replies) {
            const foundInReplies = findComment(c.replies, id);
            if (foundInReplies) return foundInReplies;
          }
        }
        return undefined;
      };
      commentToUpdate = findComment(comments, commentId);

      if (!commentToUpdate) return;

      const userId = user.id;
      const newAction: string = action;
      let oldActionToRemove: string | null = null;

      const hasUpvote = commentToUpdate.upvoteBy.includes(userId);
      const hasDownvote = commentToUpdate.downvoteBy.includes(userId);

      if (action === "upvote") {
        // if (hasUpvote) {
        //   newAction = "remove-upvote";
        // } else {
          if (hasDownvote) oldActionToRemove = "downvote";
        // }
      } else if (action === "downvote") {
        // if (hasDownvote) {
        //   newAction = "remove-downvote";
        // } else {
          if (hasUpvote) oldActionToRemove = "upvote";
        // }
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
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update comment action`);
      }

      await fetchComments();
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

      await fetchComments();

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
        <div className="bg-border mx-1 h-4 w-px" />
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

  // Recursive CommentItem component
  const CommentItem = ({ comment }: { comment: Comment }) => {
    const userId = user?.id;
    // NEW STATE: To control replies visibility
    const [showReplies, setShowReplies] = useState(false);

    const hasUpvote = comment.upvoteBy.includes(userId || "");
    const hasDownvote = comment.downvoteBy.includes(userId || "");

    const handleReplyClick = () => {
      setReplyingToCommentId(comment._id);
      setReplyText("");
      // Optionally, expand replies when user clicks reply button
      setShowReplies(true); 
    };

    const toggleReplies = () => {
      setShowReplies(!showReplies);
    };

    return (
      <div
        className="space-y-2 py-4"
        style={{ marginLeft: `${comment.depth * 20}px` }}
      >
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.avatar} alt="User" />
            <AvatarFallback>
              {comment.username.charAt(0).toUpperCase()}
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
                  <span className="ml-1 text-sm">
                    Upvote . {comment.upvote}
                  </span>
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

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyClick}
                className="h-8 px-2"
              >
                <Reply className="h-4 w-4 mr-1" />
                Reply
              </Button>

              {/* NEW: Toggle Replies Button */}
              {comment.replies && comment.replies.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleReplies}
                  className="h-8 px-2"
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" /> Hide{" "}
                      {comment.replies.length} Replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" /> View{" "}
                      {comment.replies.length} Replies
                    </>
                  )}
                </Button>
              )}

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

            {/* Reply Input Section for this comment */}
            {replyingToCommentId === comment._id && (
              <div className="mt-4">
                <Textarea
                  ref={replyInputRef}
                  placeholder={`Replying to ${comment.username}...`}
                  className="resize-none focus-visible:ring-0"
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={!user?.id}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingToCommentId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(replyText, comment._id)}
                    disabled={submitting || !user?.id || !replyText.trim()}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Submit Reply"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conditionally render replies based on showReplies state */}
        {comment.replies && comment.replies.length > 0 && showReplies && (
          <div className="border-l pl-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const displayComments = sortComments(comments, sortBy);

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
      <Card>
        <CardContent className="p-0">
          <Textarea
            placeholder="Add comment..."
            className="resize-none border-0 focus-visible:ring-0"
            rows={4}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            disabled={!user?.id}
          />
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
              onClick={() => handleAddComment(newCommentText)}
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

      <div className="space-y-0 divide-y">
        {displayComments.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          displayComments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>

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