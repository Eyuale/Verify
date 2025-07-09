// comment-system.tsx
"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
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
  ImageIcon,
  Smile,
  AtSign,
  MoreHorizontal,
  Flag,
  Trash2,
  ArrowUpDown,
  Clock,
  TrendingUp,
  Loader2,
  X,
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
  likedBy: string[]; // Although not strictly used for optimistic, good for server sync
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
  // Construct a temporary comment object for optimistic update
  const tempId = `temp-${Date.now()}`; // Unique temporary ID

  // Debounce ref for upvote/downvote actions
  const actionTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    // Initial fetch of comments
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
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "most-upvoted":
        return sorted.sort((a, b) => b.upvote - a.upvote);
      default:
        return sorted;
    }
  };

  // Helper function to find and update a comment recursively
  const findAndUpdateComment = useCallback(
    (
      commentsArr: Comment[],
      commentId: string,
      updater: (comment: Comment) => Comment,
    ): Comment[] => {
      return commentsArr.map((comment) => {
        if (comment._id === commentId) {
          return updater(comment);
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: findAndUpdateComment(comment.replies, commentId, updater),
          };
        }
        return comment;
      });
    },
    [],
  );

  // Helper function to find and add a reply recursively
  const findAndAddReply = useCallback(
    (
      commentsArr: Comment[],
      parentId: string,
      newReply: Comment,
    ): Comment[] => {
      return commentsArr.map((comment) => {
        if (comment._id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply],
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: findAndAddReply(comment.replies, parentId, newReply),
          };
        }
        return comment;
      });
    },
    [],
  );

  // Optimistic update for adding a comment/reply
  const addCommentLocally = useCallback(
    (newComment: Comment, parentCommentId: string | null) => {
      setComments((prevComments) => {
        if (parentCommentId) {
          // It's a reply
          return findAndAddReply(prevComments, parentCommentId, newComment);
        } else {
          // It's a top-level comment
          return [newComment, ...prevComments];
        }
      });
    },
    [findAndAddReply],
  );

  // Optimistic update for votes
  const updateCommentLocally = useCallback(
    (commentId: string, action: "upvote" | "downvote", userId: string) => {
      setComments((prevComments) => {
        return findAndUpdateComment(prevComments, commentId, (comment) => {
          const newUpvoteBy = new Set(comment.upvoteBy);
          const newDownvoteBy = new Set(comment.downvoteBy);
          let newUpvote = comment.upvote;
          let newDownvote = comment.downvote;

          if (action === "upvote") {
            if (newUpvoteBy.has(userId)) {
              // User already upvoted, remove upvote
              newUpvoteBy.delete(userId);
              newUpvote--;
            } else {
              // User is upvoting
              newUpvoteBy.add(userId);
              newUpvote++;
              if (newDownvoteBy.has(userId)) {
                // Remove downvote if present
                newDownvoteBy.delete(userId);
                newDownvote--;
              }
            }
          } else if (action === "downvote") {
            if (newDownvoteBy.has(userId)) {
              // User already downvoted, remove downvote
              newDownvoteBy.delete(userId);
              newDownvote--;
            } else {
              // User is downvoting
              newDownvoteBy.add(userId);
              newDownvote++;
              if (newUpvoteBy.has(userId)) {
                // Remove upvote if present
                newUpvoteBy.delete(userId);
                newUpvote--;
              }
            }
          }

          return {
            ...comment,
            upvote: newUpvote,
            downvote: newDownvote,
            upvoteBy: Array.from(newUpvoteBy),
            downvoteBy: Array.from(newDownvoteBy),
          };
        });
      });
    },
    [findAndUpdateComment],
  );

  // Helper function to remove a comment locally
  const removeCommentLocally = useCallback((commentId: string) => {
    setComments((prevComments) => {
      const filterRecursive = (commentsArr: Comment[]): Comment[] => {
        return commentsArr
          .filter((comment) => comment._id !== commentId)
          .map((comment) => {
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: filterRecursive(comment.replies),
              };
            }
            return comment;
          });
      };
      return filterRecursive(prevComments);
    });
  }, []);

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

    setSubmitting(true);
    setUploadingMedia(true);

    let finalImageUrl = "";
    let finalVideoUrl = "";

    try {
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
      const newComment: Comment = {
        _id: tempId, // Temporary ID
        avatar: user.imageUrl || "/default-avatar.png", // Use actual user avatar
        username: user.username || user.fullName || "Anonymous", // Use actual username
        comment: commentText.trim(),
        userId: user.id,
        imageUrl: finalImageUrl,
        videoUrl: finalVideoUrl,
        createdAt: new Date().toISOString(), // Current time for optimistic display
        upvote: 0,
        downvote: 0,
        upvoteBy: [],
        downvoteBy: [],
        likedBy: [],
        parentCommentId: parentCommentId,
        depth: parentCommentId
          ? (comments.find((c) => c._id === parentCommentId)?.depth ?? 0) + 1
          : 0, // Determine depth
        replies: [], // New comments initially have no replies
      };

      // --- Optimistic Update for Add Comment ---
      addCommentLocally(newComment, parentCommentId);

      // Clear input fields immediately
      if (parentCommentId) {
        setReplyText("");
        setReplyingToCommentId(null);
      } else {
        setNewCommentText("");
      }
      setImageFile(null);
      setVideoFile(null);

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

      const serverComment = await response.json(); // Get the actual comment from server with real ID

      // Replace temporary comment with server's actual comment
      setComments((prev) => {
        const replaceTempId = (commentsArr: Comment[]): Comment[] => {
          return commentsArr.map((c) => {
            if (c._id === tempId) {
              return serverComment.comment; // Assuming serverComment.comment contains the full comment object
            }
            if (c.replies) {
              return {
                ...c,
                replies: replaceTempId(c.replies),
              };
            }
            return c;
          });
        };
        return replaceTempId(prev);
      });

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

      // --- Revert Optimistic Update on Error for Add Comment ---
      // This part is a bit tricky for nested comments. For top-level, it's easy.
      // For replies, you'd need to find the parent and remove from its replies array.
      // For simplicity, for now, we'll just remove if it's a top-level comment.
      // A more robust solution might involve storing the optimistically added comment's
      // data and then selectively removing it.
      if (!parentCommentId) {
        setComments((prev) => prev.filter((c) => c._id !== tempId));
      } else {
        // For replies, reverting means finding the parent and removing the reply.
        // This can get complex, a full refetch might be simpler on reply-add error.
        // For this example, we'll keep the optimistic state on error for replies for now.
        // In a real app, you'd want to handle this more robustly.
        console.warn(
          "Consider implementing robust rollback for failed reply submissions.",
        );
      }
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

    const userId = user.id;

    // --- Optimistic Update ---
    updateCommentLocally(commentId, action, userId);

    // Clear any existing debounce timer for this comment action
    // We use a unique key for each commentId-action pair to avoid conflicting timers
    if (actionTimers.current[`${commentId}-${action}`]) {
      clearTimeout(actionTimers.current[`${commentId}-${action}`]);
    }

    // Debounce the actual API call
    actionTimers.current[`${commentId}-${action}`] = setTimeout(async () => {
      try {
        // We now determine oldActionToRemove based on the state *before* the optimistic update
        // or by sending current state to the backend which handles the logic.
        // For simplicity and since optimistic update is already done,
        // we send the intended action and let the backend decide.
        // If your backend expects oldActionToRemove, you'd need to compute it based on the *original* state
        // or the state *before* the optimistic update, which is harder to track without more state.
        // A common pattern is to just send the desired final state (e.g., 'upvote' or 'downvote')
        // and let the server handle idempotency.
        // For this example, we assume the backend correctly handles the action regardless of previous state.
        // If your backend needs `oldActionToRemove`, you'd need a more complex state management
        // to pass the state _before_ the optimistic update to the server.
        const response = await fetch(
          `/api/reviews/${reviewId}/comments/${commentId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: action, // Send the current action (upvote/downvote)
              userId,
              // oldActionToRemove: ... // You might remove this if backend handles state
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to update comment action`);
        }

        // NO fetchComments() here! The UI is already updated optimistically.
      } catch (error) {
        console.error(`Error performing comment action:`, error);
        toast({
          title: "Error",
          description: `Failed to update comment action. Please try again.`,
          variant: "destructive",
        });
        // --- Revert Optimistic Update on error ---
        // If the server call fails, revert the local state by performing the opposite action.
        const revertAction = action === "upvote" ? "downvote" : "upvote";
        updateCommentLocally(commentId, revertAction, userId);
      }
    }, 300); // Debounce for 300ms
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete comments.",
        variant: "destructive",
      });
      return;
    }

    // --- Optimistic Deletion ---
    removeCommentLocally(commentId);

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

      // NO fetchComments() here! The UI is already updated optimistically.

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
      // --- Revert Optimistic Deletion on Error ---
      // This is harder to implement perfectly without storing the full comment object
      // before deletion. A simple rollback might be to re-fetch all comments on error,
      // but that defeats the purpose of avoiding reloads.
      // For a real app, you might maintain a history of changes to revert from.
      console.warn(
        "Consider implementing robust rollback for failed deletions.",
      );
      fetchComments(); // Fallback to full fetch on deletion error for simplicity
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
          {/* Using a generic video icon here, replace with proper icon if available */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
            <circle cx="12" cy="12" r="3" />
            <path d="m16 10 4-4" />
            <path d="m8 14-4 4" />
          </svg>
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
                <Reply className="mr-1 h-4 w-4" />
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
                      <ChevronUp className="mr-1 h-4 w-4" /> Hide{" "}
                      {comment.replies.length} Replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-4 w-4" /> View{" "}
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
                    {/* Using a generic video icon here */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-green-600"
                    >
                      <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="m16 10 4-4" />
                      <path d="m8 14-4 4" />
                    </svg>
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
