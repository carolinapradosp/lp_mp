// lib/orders/types.ts

import type { Filters } from '@/interfaces/Filters';
import type { Order } from '@/interfaces/Order';

export interface GetOrdersParams extends Partial<Filters> {
  limit?: number;
  offset?: number;
}

export interface OrdersQueryResult {
  orders: Order[];
  totalOrders: number;
}
