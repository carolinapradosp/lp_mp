export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_cpf: string;
  total_amount: string;
  payment_method: string;
  status: string;
  created_at: string;
  mercadopago_payment_id: string;
  mercadopago_external_id: string;
}
