'use client';

import type { Filters } from '@/interfaces/Filters';
import type { Order } from '@/interfaces/Order';
import { getOrders } from '@/services/orders';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const initialFilters: Filters = {
  orderId: '',
  cpf: '',
  email: '',
  status: '',
};

interface UseOrdersOptions {
  initialOrders?: Order[];
  initialTotalOrders?: number;
}

export function useOrders({
  initialOrders = [],
  initialTotalOrders = 0,
}: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [allOrders, setAllOrders] = useState<Order[]>(initialOrders);

  const [filters, setFilters] = useState<Filters>(initialFilters);

  const [totalOrdersCount, setTotalOrdersCount] = useState(initialTotalOrders);

  const [loading, setLoading] = useState(initialOrders.length === 0);

  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (
      selectedFilters?: Filters,
      options?: {
        updateAllOrders?: boolean;
        signal?: AbortSignal;
      }
    ) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getOrders(selectedFilters, options?.signal);

        setOrders(data.orders);
        setTotalOrdersCount(data.totalOrders);

        if (options?.updateAllOrders) {
          setAllOrders(data.orders);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        console.error('Erro ao buscar pedidos:', error);

        setOrders([]);

        setError(
          error instanceof Error
            ? error.message
            : 'Não foi possível buscar os pedidos.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchAllOrders = useCallback(
    async (signal?: AbortSignal) => {
      await loadOrders(undefined, {
        updateAllOrders: true,
        signal,
      });
    },
    [loadOrders]
  );

  const fetchOrders = useCallback(async () => {
    await loadOrders(filters);
  }, [filters, loadOrders]);

  const clearFilters = useCallback(async () => {
    setFilters(initialFilters);

    await loadOrders(undefined, {
      updateAllOrders: true,
    });
  }, [loadOrders]);

  useEffect(() => {
    if (initialOrders.length > 0) {
      return;
    }

    const controller = new AbortController();

    void fetchAllOrders(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchAllOrders, initialOrders.length]);

  const todayStats = useMemo(() => {
    const today = new Date();

    return allOrders.reduce(
      (stats, order) => {
        const orderDate = new Date(order.created_at);

        const isToday =
          orderDate.getDate() === today.getDate() &&
          orderDate.getMonth() === today.getMonth() &&
          orderDate.getFullYear() === today.getFullYear();

        if (order.status !== 'approved' || !isToday) {
          return stats;
        }

        return {
          approvedOrders: stats.approvedOrders + 1,
          dailyRevenue: stats.dailyRevenue + Number(order.total_amount),
        };
      },
      {
        approvedOrders: 0,
        dailyRevenue: 0,
      }
    );
  }, [allOrders]);

  return {
    orders,
    loading,
    error,
    filters,
    setFilters,
    totalOrdersCount,
    approvedOrders: todayStats.approvedOrders,
    dailyRevenue: todayStats.dailyRevenue,
    fetchOrders,
    fetchAllOrders,
    clearFilters,
  };
}
