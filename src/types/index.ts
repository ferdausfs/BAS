export interface Product {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  price: number;
  image: string; // আপনার অরিজিনাল কোডে 'image' ব্যবহার করা হয়েছে
  image_url?: string;
  rating?: number;
  reviews?: number;
  occasion?: string;
  flavors?: string[];
  weights?: { size: string; price: number }[];
  bestseller?: boolean;
  newArrival?: boolean;
  category: string;
  stock_status: boolean;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  items: any[];
  total: number;
  status: 'placed' | 'confirmed' | 'baking' | 'ready' | 'out' | 'delivered' | 'pending' | 'completed';
  createdAt: string;
  created_at?: string;
}
