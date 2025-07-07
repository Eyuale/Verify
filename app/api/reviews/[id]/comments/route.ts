import { NextRequest, NextResponse } from "next/server"
import { Review } from "@/models/reviewSchema"
import { connectToDatabase } from "@/lib/mongoose"
import { currentUser } from "@clerk/nextjs/server";

// GET comments for a specific review
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = await params;
    try {
    await connectToDatabase()

    const review = await Review.findById(id).select("comments")

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Sort comments by createdAt descending (newest first)
    const sortedComments = review.comments.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

    return NextResponse.json({ comments: sortedComments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

// POST new comment to a specific review
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser();

  if(!user){
    return NextResponse.json({ error: "User not found"}, { status: 404})
  }

  try {
    await connectToDatabase()

    const body = await request.json()
    const { comment, userId, imageUrl, videoUrl, upvote, downvote } = body

    if (!comment || !userId) {
      return NextResponse.json({ error: "Comment and userId are required" }, { status: 400 })
    }

    const newComment = {
      comment,
      userId,
      imageUrl: imageUrl || "",
      videoUrl: videoUrl || "",
      createdAt: new Date(),
      likes: 0,
      username: user.username,
      avatar: user.imageUrl,
      upvote,
      downvote
    }

    const review = await Review.findByIdAndUpdate(
      params.id,
      { $push: { comments: newComment } },
      { new: true },
    ).select("comments")

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Return the newly added comment
    const addedComment = review.comments[review.comments.length - 1]

    return NextResponse.json({ comment: addedComment }, { status: 201 })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}
