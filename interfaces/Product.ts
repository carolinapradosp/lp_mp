export type PricingRule = {
  min_quantity: number;
  unit_price: number;
};

export type Product = {
  id: string;
  title: string;
  description?: string;
  base_price: number;
  price: number;
  quantity: number;
  image_url: string;
  stock?: number;
  pricing_rules: PricingRule[];
};

export type ProductsProps = {
  products: Product[];
};

// export type CartProduct = {
//   id: number;
//   title: string;
//   price: number;
//   base_price: number;
//   quantity: number;
//   image: string;
//   pricing_rules: PricingRule[];
// };

export type CartStore = {
  products: Product[];
  addToCart: (product: Product) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};
