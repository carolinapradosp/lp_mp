// hooks/useOrderDetails.ts

'use client';

import { useEffect, useState } from 'react';

export interface Order {
  id: number;

  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_cpf: string;

  shipping_zip_code: string;
  shipping_street: string;
  shipping_number: string;
  shipping_complement: string;
  shipping_neighborhood: string;
  shipping_city: string;
  shipping_state: string;

  subtotal: string;
  shipping_cost: string;
  discount: string;
  total_amount: string;

  payment_method: string;
  status: string;

  mercadopago_payment_id: string;
  mercadopago_status: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  total_price: string;
  title: string;
  image_url: string;
}

export function useOrderDetails(id: string) {
  const [order, setOrder] = useState<Order | null>(null);

  const [items, setItems] = useState<OrderItem[]>([]);

  const [loading, setLoading] = useState(true);

  async function fetchOrder() {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${id}`);

      const data = await response.json();

      setOrder(data.order);
      setItems(data.items || []);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    fetchOrder();
  }, [id]);

  return {
    order,
    items,
    loading,
    refetch: fetchOrder,
  };
}
