// route.ts
import { NextRequest, NextResponse } from "next/server";
import { Review } from "@/models/reviewSchema";
import { connectToDatabase } from "@/lib/mongoose";
import { currentUser } from "@clerk/nextjs/server";

// Helper function to build comment tree
function buildCommentTree(
  comments: any[],
  parentId: string | null = null,
  depth: number = 0,
): any[] {
  const threadedComments: any[] = [];
  const children = comments.filter(
    (comment) => comment.parentCommentId === parentId,
  );

  // Sort children by createdAt (oldest first within a thread for better readability)
  children.sort(
    (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  for (const child of children) {
    const commentWithDepth = { ...child, depth }; // Convert Mongoose document to plain object
    commentWithDepth.replies = buildCommentTree(
      comments,
      commentWithDepth._id.toString(),
      depth + 1,
    );
    threadedComments.push(commentWithDepth);
  }

  return threadedComments;
}

// GET comments for a specific review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = await params; // No await needed for params
  try {
    await connectToDatabase();

    const review = await Review.findById(id).select("comments");

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Convert Mongoose documents to plain objects for manipulation
    const allComments = review.comments.map((comment: any) =>
      comment.toObject(),
    );

    // Build the threaded comment tree starting with top-level comments
    const threadedComments = buildCommentTree(allComments, null, 0);

    // Sort top-level comments (depth 0) by newest first, then sort their children by oldest first
    threadedComments.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );


    return NextResponse.json({ comments: threadedComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

// POST new comment to a specific review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    await connectToDatabase();

    const body = await request.json();
    const { comment, userId, imageUrl, videoUrl, parentCommentId } = body; // ADD parentCommentId

    if (!comment || !userId) {
      return NextResponse.json(
        { error: "Comment and userId are required" },
        { status: 400 },
      );
    }

    let commentDepth = 0;
    if (parentCommentId) {
      // Find the parent comment to determine the depth
      const review = await Review.findById(params.id).select("comments");
      if (review) {
        const parentComment = review.comments.id(parentCommentId);
        if (parentComment) {
          commentDepth = (parentComment.depth || 0) + 1;
        }
      }
    }

    const newComment = {
      comment,
      userId,
      imageUrl: imageUrl || "",
      videoUrl: videoUrl || "",
      createdAt: new Date(),
      likes: 0, // This seems to be unused in your frontend, `upvote` is used instead
      username: user.username,
      avatar: user.imageUrl,
      upvote: 0, // Initialize to 0 for new comments
      downvote: 0, // Initialize to 0 for new comments
      upvoteBy: [],
      downvoteBy: [],
      parentCommentId: parentCommentId || null, // Set parentCommentId
      depth: commentDepth, // Set calculated depth
    };

    const review = await Review.findByIdAndUpdate(
      params.id,
      { $push: { comments: newComment } },
      { new: true },
    ).select("comments");

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Find the newly added comment using its ID (Mongoose generates it automatically)
    // To ensure we get the full, updated comment object for the frontend,
    // we need to retrieve it carefully or rebuild the tree.
    // For simplicity, we'll return the last added comment and let the frontend refetch comments
    // or handle the insertion into its state correctly by fetching it from the DB.
    // A more robust solution might rebuild the *entire* tree here and return it,
    // or fetch the single added comment from the DB after the push.
    // For now, let's just return the pushed comment as it will be at the end of the array.
    const addedComment = review.comments[review.comments.length - 1];


    // If you want to return the added comment with the `replies` field for immediate use on frontend
    // you would have to re-build the entire tree here, or handle it on the client.
    // For this example, we'll rely on the frontend fetching updated comments after posting.
    // Or just return the basic new comment and let the frontend add it to its structure.

    return NextResponse.json({ comment: addedComment }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}