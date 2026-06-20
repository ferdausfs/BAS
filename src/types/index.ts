export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock_status: boolean;
}
export interface CartItem extends Product {
  quantity: number;
}
export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  items: any[];
  created_at: string;
}
