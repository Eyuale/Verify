import { type NextRequest, NextResponse } from "next/server"
import { Review } from "@/models/reviewSchema"
import { connectToDatabase } from "@/lib/mongoose";

// UPDATE comment (like, accurate, inaccurate)
export async function PATCH(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    await connectToDatabase()

    const body = await request.json()
    const { action } = body // 'like', 'accurate', 'inaccurate'

    if (!action || !["like", "accurate", "inaccurate"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updateField = `comments.$.${action}`

    const review = await Review.findOneAndUpdate(
      {
        _id: params.id,
        "comments._id": params.commentId,
      },
      { $inc: { [updateField]: 1 } },
      { new: true },
    ).select("comments")

    if (!review) {
      return NextResponse.json({ error: "Review or comment not found" }, { status: 404 })
    }

    const updatedComment = review.comments.find((c: any) => c._id.toString() === params.commentId)

    return NextResponse.json({ comment: updatedComment })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

// DELETE comment
export async function DELETE(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    await connectToDatabase()

    const review = await Review.findByIdAndUpdate(
      params.id,
      { $pull: { comments: { _id: params.commentId } } },
      { new: true },
    ).select("comments")

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
