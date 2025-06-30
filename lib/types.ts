export type TReviews = {
    comment?: string,
    userId: string,
    imageUrl?: string,
    videoUrl?: string,
    createdAt: string,
    like?: number,
    accurate?: number,
    inaccurate?: number,
    reviewDescription: string,
}

export type TProduct = {
    _id: string,
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
    reviews: [TReviews],
    webLink: string
}



