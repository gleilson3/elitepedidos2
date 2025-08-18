// PDV Types
export interface PDVProduct {
  id: string;
  code: string;
  name: string;
  category: 'acai' | 'bebidas' | 'complementos' | 'sobremesas' | 'outros' | 'sorvetes';
  is_weighable: boolean;
  unit_price?: number;
  price_per_gram?: number;
  image_url?: string;
  stock_quantity: number;
  min_stock: number;
  is_active: boolean;
  barcode?: string;
  description?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PDVCartItem {
  id: string;
  product: PDVProduct;
  quantity: number;
  weight?: number;
  subtotal: number;
  discount?: number;
}

export interface PDVSale {
  id: string;
  sale_number: number;
  operator_id?: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  total_amount: number;
  payment_type: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'voucher' | 'misto';
  payment_details?: any;
  change_amount: number;
  notes?: string;
  is_cancelled: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
  channel: string;
  cash_register_id?: string;
}

export interface PDVSaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  product_code: string;
  product_name: string;
  quantity: number;
  weight_kg?: number;
  unit_price?: number;
  price_per_gram?: number;
  discount_amount: number;
  subtotal: number;
  created_at: string;
}

export interface PDVOperator {
  id: string;
  name: string;
  code: string;
  password_hash: string;
  is_active: boolean;
  permissions: {
    can_cancel: boolean;
    can_discount: boolean;
    can_use_scale: boolean;
    can_view_sales: boolean;
    can_view_orders: boolean;
    can_view_reports: boolean;
    can_view_products: boolean;
    can_view_operators: boolean;
    can_manage_products: boolean;
    can_manage_settings: boolean;
    can_view_attendance: boolean;
    can_view_cash_report: boolean;
    can_view_sales_report: boolean;
    can_view_cash_register: boolean;
    can_view_expected_balance: boolean;
  };
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface PDVCashRegister {
  id: string;
  opening_amount: number;
  closing_amount?: number;
  difference?: number;
  opened_at: string;
  closed_at?: string;
  operator_id?: string;
  store_id?: string;
}

export interface PDVCashRegisterEntry {
  id: string;
  register_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  payment_method: string;
  created_at: string;
}

export interface PDVCashRegisterSummary {
  opening_amount: number;
  sales_total: number;
  delivery_total: number;
  other_income_total: number;
  total_expense: number;
  expected_balance: number;
  entries: PDVCashRegisterEntry[];
}

// Store2 Types
export interface Store2User {
  id: string;
  username: string;
  password_hash: string;
  name: string;
  role: string;
  is_active: boolean;
  permissions: {
    can_view_cash: boolean;
    can_view_sales: boolean;
    can_view_reports: boolean;
    can_view_products: boolean;
    can_manage_settings: boolean;
    can_view_expected_balance: boolean;
  };
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Store2Product {
  id: string;
  code: string;
  name: string;
  category: string;
  is_weighable: boolean;
  unit_price?: number;
  price_per_gram?: number;
  image_url?: string;
  stock_quantity: number;
  min_stock: number;
  is_active: boolean;
  barcode?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Store2Sale {
  id: string;
  sale_number: number;
  operator_id?: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  total_amount: number;
  payment_type: string;
  payment_details?: any;
  change_amount: number;
  notes?: string;
  is_cancelled: boolean;
  cancelled_at?: string;
  cancelled_by?: string;
  cancel_reason?: string;
  created_at: string;
  updated_at: string;
  channel?: string;
  cash_register_id?: string;
}

export interface Store2SaleItem {
  id: string;
  sale_id: string;
  product_id?: string;
  product_code: string;
  product_name: string;
  quantity: number;
  weight_kg?: number;
  unit_price?: number;
  price_per_gram?: number;
  discount_amount: number;
  subtotal: number;
  created_at: string;
}

export interface Store2CashRegister {
  id: string;
  opening_amount: number;
  closing_amount?: number;
  difference?: number;
  opened_at: string;
  closed_at?: string;
  operator_id?: string;
  store_id?: string;
}

export interface Store2CashEntry {
  id: string;
  register_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  payment_method: string;
  created_at: string;
}