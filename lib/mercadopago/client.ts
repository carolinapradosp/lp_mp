// lib/mercadopago/client.ts

import { MercadoPagoConfig, Payment } from 'mercadopago';

const accessToken = process.env.MP_ACCESS_TOKEN;

if (!accessToken) {
  throw new Error('A variável MP_ACCESS_TOKEN não está configurada.');
}

export const mercadoPagoClient = new MercadoPagoConfig({
  accessToken,
});

export const mercadoPagoPayment = new Payment(mercadoPagoClient);
