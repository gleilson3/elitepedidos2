export interface DeliveryOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_neighborhood: string;
  customer_complement?: string;
  payment_method: 'money' | 'pix' | 'card';
  change_for?: number;
  items: DeliveryOrderItem[];
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DeliveryOrderItem {
  id: string;
  product_name: string;
  product_image: string;
  selected_size?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  observations?: string;
  complements: DeliveryOrderComplement[];
}

export interface DeliveryOrderComplement {
  name: string;
  price: number;
}

export interface DeliveryUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
}