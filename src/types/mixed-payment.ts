export interface PaymentPartial {
  id: string;
  payment_type: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'voucher';
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface MixedPaymentData {
  order_id: string;
  order_total: number;
  payments: PaymentPartial[];
  total_paid: number;
  remaining_amount: number;
  is_fully_paid: boolean;
}

export interface PaymentFormData {
  payment_type: PaymentPartial['payment_type'];
  amount: number;
  notes?: string;
}

export interface PaymentSummary {
  dinheiro: number;
  pix: number;
  cartao_credito: number;
  cartao_debito: number;
  voucher: number;
  total: number;
}