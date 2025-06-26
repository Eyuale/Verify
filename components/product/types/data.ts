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
  userId: string;
};

export type { T_PRODUCT, T_PRODUCT_DOCUMENT };
// const products: T_PRODUCT[] = [
//   {
//     id: 1,
//     product_name: "iPhone 16 Pro Max",
//     description:
//       "The most advanced iPhone ever with titanium design, A17 Pro chip, and revolutionary camera system.",
//     imageUrl: "iphone.webp",
//     price: 999,
//     company_name: "Apple",
//   },
//   {
//     id: 2,
//     product_name: "Samsung Galaxy S23 Ultra",
//     description:
//       "Experience the power of the Galaxy S23 Ultra with its stunning display, advanced camera, and long-lasting battery.",
//     imageUrl: "samsung_s23_ultra.jpg",
//     price: 1199,
//     company_name: "Samsung",
//   },
//   {
//     id: 3,
//     product_name: "Mac book Air M3 Chip",
//     description:
//       "Experience the power of the Galaxy S23 Ultra with its stunning display, advanced camera, and long-lasting battery.",
//     imageUrl: "macbook_air_13.webp",
//     price: 3999,
//     company_name: "Apple",
//   },
// ];
// export { products };
