import type { Filters } from '@/interfaces/Filters';
import type { Order } from '@/interfaces/Order';

export interface OrdersResponse {
  orders: Order[];
  totalOrders: number;
}

function createOrdersQuery(filters?: Filters) {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  if (filters.status.trim()) {
    params.set('status', filters.status.trim());
  }

  if (filters.orderId.trim()) {
    params.set('orderId', filters.orderId.trim());
  }

  if (filters.cpf.trim()) {
    params.set('cpf', filters.cpf.trim());
  }

  if (filters.email.trim()) {
    params.set('email', filters.email.trim());
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

export async function getOrders(
  filters?: Filters,
  signal?: AbortSignal
): Promise<OrdersResponse> {
  const query = createOrdersQuery(filters);

  const response = await fetch(`/api/admin/orders${query}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Não foi possível buscar os pedidos (${response.status}).`);
  }

  const data: unknown = await response.json();

  if (typeof data !== 'object' || data === null || !('orders' in data)) {
    throw new Error('A API retornou uma resposta inválida.');
  }

  const result = data as {
    orders?: unknown;
    totalOrders?: unknown;
  };

  return {
    orders: Array.isArray(result.orders) ? (result.orders as Order[]) : [],
    totalOrders:
      typeof result.totalOrders === 'number' ? result.totalOrders : 0,
  };
}
