type T_PRODUCT = {
  id: string; // MongoDB _id as string
  product_name: string;
  description: string;
  imageUrl: string;
  price: number;
  company_name?: string;
};

type T_PRODUCT_DOCUMENT = {
  _id: string; // MongoDB _id as string for lean queries
  product_name: string;
  description: string;
  imageUrl: string;
  price: number;
  company_name?: string;
  __v?: number; // Mongoose version key
};

export type { T_PRODUCT, T_PRODUCT_DOCUMENT };
