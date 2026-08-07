// interfaces/Product.ts

export type PricingRule = {
  min_quantity: number;
  unit_price: number;
};

export type Product = {
  id: string;
  title: string;
  description?: string;
  base_price: number;
  image_url: string;
  stock: number;
  pricing_rules: PricingRule[];
};

export type AdminProduct = Product & {
  active: boolean;
  created_at: Date;
  updated_at?: Date;
};

export type CartProduct = Product & {
  price: number;
  quantity: number;
};

export type ProductsProps = {
  products: Product[];
};

export type CartStore = {
  products: CartProduct[];
  addToCart: (product: Product) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};
