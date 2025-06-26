type T_PRODUCT = {
  id: string; // MongoDB _id as string
  product_name: string;
  description: string;
  imageUrl: string;
  price: number;
  company_name?: string;
};

type T_PRODUCT_DOCUMENT = {
  product_name: string;
  description: string;
  rating: number;
  imageUrl: string;
  videoUrl?: string;
  price: number;
  company_name?: string;
  userId: string;
};

export type { T_PRODUCT, T_PRODUCT_DOCUMENT };
