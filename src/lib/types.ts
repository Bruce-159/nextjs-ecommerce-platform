export type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  stock: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
