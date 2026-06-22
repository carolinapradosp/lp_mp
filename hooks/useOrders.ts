// hooks/useOrders.ts

'use client';

import { Filters } from '@/interfaces/Filters';
import { Order } from '@/interfaces/Order';
import { useEffect, useMemo, useState } from 'react';

const initialFilters: Filters = {
  orderId: '',
  cpf: '',
  email: '',
  status: '',
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  const [filters, setFilters] = useState<Filters>(initialFilters);

  async function fetchAllOrders() {
    try {
      setLoading(true);

      const response = await fetch('/api/admin/orders');

      const data = await response.json();

      const normalizedOrders = Array.isArray(data.orders) ? data.orders : [];

      setOrders(normalizedOrders);

      setAllOrders(normalizedOrders);

      setTotalOrdersCount(data.totalOrders || 0);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrders() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (filters.status) {
        params.append('status', filters.status);
      }

      if (filters.orderId) {
        params.append('orderId', filters.orderId);
      }

      if (filters.cpf) {
        params.append('cpf', filters.cpf);
      }

      if (filters.email) {
        params.append('email', filters.email);
      }

      const response = await fetch(`/api/admin/orders?${params.toString()}`);

      const data = await response.json();

      setOrders(Array.isArray(data.orders) ? data.orders : []);

      setTotalOrdersCount(data.totalOrders || 0);
    } catch (error) {
      console.error('Erro ao filtrar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setFilters(initialFilters);

    fetchAllOrders();
  }

  useEffect(() => {
    fetchAllOrders();
  }, []);

  function isToday(dateString: string) {
    const today = new Date();

    const date = new Date(dateString);

    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  const approvedOrders = useMemo(() => {
    return allOrders.filter(
      (order) => order.status === 'approved' && isToday(order.created_at)
    ).length;
  }, [allOrders]);

  const dailyRevenue = useMemo(() => {
    return allOrders
      .filter(
        (order) => order.status === 'approved' && isToday(order.created_at)
      )
      .reduce((acc, order) => acc + Number(order.total_amount), 0);
  }, [allOrders]);

  return {
    orders,
    loading,
    filters,
    setFilters,
    totalOrdersCount,

    approvedOrders,
    dailyRevenue,

    fetchOrders,
    fetchAllOrders,
    clearFilters,
  };
}
