// api/reviews/[id]/comments/[commentId]
import { type NextRequest, NextResponse } from "next/server";
import { Review } from "@/models/reviewSchema"; // Assuming your schema is here
import { connectToDatabase } from "@/lib/mongoose";
import { currentUser } from "@clerk/nextjs/server";

// UPDATE comment (likes, accurate, inaccurate, and their removals)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } },
) {
  const { commentId } = params;
  try {
    await connectToDatabase();
    console.log(
      `[BACKEND PATCH] Request received for reviewId: ${params.id}, commentId: ${commentId}`,
    );

    const body = await request.json();
    const { action, userId, oldActionToRemove } = body;
    console.log(
      `[BACKEND PATCH] Payload: action=${action}, userId=${userId}, oldActionToRemove=${oldActionToRemove}`,
    );

    if (!userId) {
      console.log("[BACKEND PATCH] Error: User ID is required.");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Find the review and the specific comment
    const review = await Review.findOne({
      _id: params.id,
      "comments._id": commentId,
    });

    if (!review) {
      console.log(
        "[BACKEND PATCH] Error: Review or comment not found in initial fetch.",
      );
      return NextResponse.json(
        { error: "Review or comment not found" },
        { status: 404 },
      );
    }

    const comment = review.comments.id(commentId);
    if (!comment) {
      console.log(
        "[BACKEND PATCH] Error: Comment not found within review after initial fetch.",
      );
      return NextResponse.json(
        { error: "Comment not found within review" },
        { status: 404 },
      );
    }

    // --- Prepare update operations ---
    // We need to use $addToSet for adding (to prevent duplicates) and $pull for removing
    // And $inc for incrementing/decrementing counts

    type UpdateOperations = {
      $inc?: Record<string, number>;
      $addToSet?: Record<string, string>;
      $pull?: Record<string, string>;
    };
    const updateOperations: UpdateOperations = { $inc: {}, $addToSet: {}, $pull: {} };
    let hasChanges = false; // Flag to check if any update operation is actually needed

    // Logic for removing old action if present
    if (oldActionToRemove) {
      console.log(
        `[BACKEND PATCH] Processing oldActionToRemove: ${oldActionToRemove}`,
      );
      switch (oldActionToRemove) {
        case "upvote":
          if (comment.upvoteBy.includes(userId)) {
            updateOperations.$inc!["comments.$.upvote"] = -1;
            updateOperations.$pull!["comments.$.upvoteBy"] = userId;
            hasChanges = true;
            console.log(
              `[BACKEND PATCH] Decrementing upvote and pulling userId from upvoteBy.`,
            );
          }
          break;
        case "downvote":
          if (comment.downvoteBy.includes(userId)) {
            updateOperations.$inc!["comments.$.downvote"] = -1;
            updateOperations.$pull!["comments.$.downvoteBy"] = userId;
            hasChanges = true;
            console.log(
              `[BACKEND PATCH] Decrementing downvote and pulling userId from downvoteBy.`,
            );
          }
          break;
      }
    }

    // Logic for applying the new action or toggling off the current one
    console.log(`[BACKEND PATCH] Processing new action: ${action}`);
    switch (action) {
      case "upvote":
        if (comment.upvoteBy.includes(userId)) {
          // If already liked, toggle off
          updateOperations.$inc!["comments.$.upvote"] =
            (updateOperations.$inc!["comments.$.upvote"] || 0) - 1;
          updateOperations.$pull!["comments.$.upvoteBy"] = userId;
          hasChanges = true;
          console.log(`[BACKEND PATCH] User already upvoted, toggling off.`);
        } else {
          // If not liked, like it
          updateOperations.$inc!["comments.$.upvote"] =
            (updateOperations.$inc!["comments.$.upvote"] || 0) + 1;
          updateOperations.$addToSet!["comments.$.upvoteBy"] = userId;
          hasChanges = true;
          console.log(`[BACKEND PATCH] User upvoting comment.`);
        }
        break;
      case "downvote":
        if (comment.downvoteBy.includes(userId)) {
          // If already downvote, toggle off
          updateOperations.$inc!["comments.$.downvote"] =
            (updateOperations.$inc!["comments.$.downvote"] || 0) - 1;
          updateOperations.$pull!["comments.$.downvoteBy"] = userId;
          hasChanges = true;
          console.log(
            `[BACKEND PATCH] User already marked downvote, toggling off.`,
          );
        } else {
          // If not downvote, mark as downvote
          updateOperations.$inc!["comments.$.downvote"] =
            (updateOperations.$inc!["comments.$.downvote"] || 0) + 1;
          updateOperations.$addToSet!["comments.$.downvoteBy"] = userId;
          hasChanges = true;
          console.log(`[BACKEND PATCH] User marking downvote.`);
        }
        break;
      default:
        console.log(`[BACKEND PATCH] Invalid action received: ${action}`);
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Clean up empty operations to avoid Mongoose errors
    if (Object.keys(updateOperations.$inc!).length === 0)
      delete updateOperations.$inc;
    if (Object.keys(updateOperations.$addToSet!).length === 0)
      delete updateOperations.$addToSet;
    if (Object.keys(updateOperations.$pull!).length === 0)
      delete updateOperations.$pull;

    if (!hasChanges) {
      console.log(
        "[BACKEND PATCH] No changes detected, returning current comment state.",
      );
      return NextResponse.json({ comment: comment }); // No actual update needed
    }

    console.log(
      "[BACKEND PATCH] Performing update with operations:",
      JSON.stringify(updateOperations, null, 2),
    );

    const updatedReview = await Review.findOneAndUpdate(
      {
        _id: params.id,
        "comments._id": commentId,
      },
      updateOperations, // Use the dynamically built update operations
      { new: true }, // Return the updated document
    ).select("comments");

    if (!updatedReview) {
      console.log(
        "[BACKEND PATCH] Error: Review not found after update attempt (might have been deleted concurrently).",
      );
      return NextResponse.json(
        {
          error: "Failed to update comment - review not found after operation",
        },
        { status: 404 },
      );
    }

    // Replace 'CommentType' with the actual type of your comment if available
    interface CommentType {
      _id: { toString(): string };
      upvote: number;
      downvote: number;
      upvoteBy: string[];
      downvoteBy: string[];
      // add other fields as needed
    }

    const updatedComment = updatedReview.comments.find(
      (c: CommentType) => c._id.toString() === commentId,
    );

    if (!updatedComment) {
      console.log(
        "[BACKEND PATCH] Error: Updated comment not found in returned review.",
      );
      return NextResponse.json(
        { error: "Failed to retrieve updated comment" },
        { status: 500 },
      );
    }

    console.log(
      "[BACKEND PATCH] Comment updated successfully:",
      updatedComment,
    );
    return NextResponse.json({ comment: updatedComment });
  } catch (error) {
    console.error("[BACKEND PATCH] Caught error:", error);
    return NextResponse.json(
      { error: "Failed to update comment" },
      { status: 500 },
    );
  }
}

// DELETE comment (no changes needed here)
// ... (your existing DELETE code)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } } // This is the corrected signature
) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = params; // Destructure id and commentId from params

  if (!id || !commentId) {
    return NextResponse.json(
      { error: "Review ID and Comment ID are required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Find the comment to be deleted
    const commentToDelete = review.comments.id(commentId);

    if (!commentToDelete) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Optional: Check if the user is the author of the comment
    if (commentToDelete.userId !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }


    // Use $pull to remove the comment from the array
    const result = await Review.findByIdAndUpdate(
      id,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Comment not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
