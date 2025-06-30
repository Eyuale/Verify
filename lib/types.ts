import { Types } from "mongoose"

export type TReviews = {
    _id: Types.ObjectId | string,
    productId: Types.ObjectId | string,
    comment?: string,
    userId: string,
    imageUrl?: string,
    videoUrl?: string,
    createdAt: string,
    like?: number,
    accurate?: number,
    inaccurate?: number,
    rating: number
    reviewDescription: string,
}

export type TProduct = {
    _id: Types.ObjectId | string,
    product_name: string,
    description: string,
    imageUrl: string,
    videoUrl: string,
    price: number,
    company_name: string,
    model: string,
    category: string,
    userId: string,
    ai_summary: string,
    reviews: (Types.ObjectId | string)[],
    webLink: string
}



