export interface TableSale {
  id: string;
  table_id: string;
  sale_number: number;
  operator_name?: string;
  customer_name?: string;
  customer_count: number;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_type?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'voucher' | 'misto';
  change_amount: number;
  status: 'aberta' | 'fechada' | 'cancelada';
  notes?: string;
  opened_at: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  items?: TableSaleItem[];
}

export interface TableSaleItem {
  id: string;
  sale_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  weight_kg?: number;
  unit_price?: number;
  price_per_gram?: number;
  discount_amount: number;
  subtotal: number;
  notes?: string;
  created_at: string;
}

export interface RestaurantTable {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: 'livre' | 'ocupada' | 'aguardando_conta' | 'limpeza';
  current_sale_id?: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  current_sale?: TableSale;
}

export interface TableCartItem {
  product_code: string;
  product_name: string;
  quantity: number;
  weight?: number;
  unit_price?: number;
  price_per_gram?: number;
  subtotal: number;
  notes?: string;
}