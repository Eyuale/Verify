// route.ts
import { NextRequest, NextResponse } from "next/server";
import { Review, IComment, IReview, IPlainComment } from "@/models/reviewSchema";
import { connectToDatabase } from "@/lib/mongoose";
import { currentUser } from "@clerk/nextjs/server";

interface IThreadedComment extends IPlainComment {
  replies?: IThreadedComment[];
}

function buildCommentTree(
  comments: IComment[],
  parentId: string | null = null,
  depth: number = 0,
): IThreadedComment[] {
  const threadedComments: IThreadedComment[] = [];
  const children = comments.filter(
    (comment) => (comment.parentCommentId === parentId || (comment.parentCommentId === null && parentId === null)),
  );

  children.sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );

  for (const child of children) {
    const commentAsObject: IPlainComment = child.toObject() as IPlainComment;

    const commentWithDepth: IThreadedComment = { ...commentAsObject, depth };
    commentWithDepth.replies = buildCommentTree(
      comments,
      commentWithDepth._id.toString(),
      depth + 1,
    );
    threadedComments.push(commentWithDepth);
  }

  return threadedComments;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  try {
    await connectToDatabase();

    const review: IReview | null = await Review.findById(id).select("comments");

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const allComments: IComment[] = review.comments;

    const threadedComments: IThreadedComment[] = buildCommentTree(allComments, null, 0);

    threadedComments.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
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
    const { comment, userId, imageUrl = "", videoUrl = "", parentCommentId = null } = body;

    if (!comment || !userId) {
      return NextResponse.json(
        { error: "Comment and userId are required" },
        { status: 400 },
      );
    }

    let commentDepth = 0;
    if (parentCommentId) {
      const review: IReview | null = await Review.findById(params.id).select("comments");
      if (review) {
        // CORRECTED LINE: Allow parentComment to be null
        const parentComment: IComment | undefined | null = review.comments.id(parentCommentId);
        if (parentComment) { // This check properly handles both undefined and null
          commentDepth = parentComment.depth + 1;
        }
      }
    }

    const newComment: Partial<IComment> = {
      comment,
      userId,
      imageUrl,
      videoUrl,
      createdAt: new Date(),
      username: user.username ?? undefined,
      avatar: user.imageUrl,
      upvote: 0,
      downvote: 0,
      upvoteBy: [],
      downvoteBy: [],
      parentCommentId,
      depth: commentDepth,
    };

    const updatedReview: IReview | null = await Review.findByIdAndUpdate(
      params.id,
      { $push: { comments: newComment } },
      { new: true },
    ).select("comments");

    if (!updatedReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const addedComment: IComment = updatedReview.comments[updatedReview.comments.length - 1];

    return NextResponse.json({ comment: addedComment.toObject() }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}