// app/api/webhooks/mercadopago/route.ts

import crypto from 'node:crypto';

import { NextResponse } from 'next/server';

import { syncPaymentStatus } from '@/lib/mercadopago/sync-payment-status';

type MercadoPagoWebhookBody = {
  type?: unknown;
  topic?: unknown;
  id?: unknown;
  resource?: unknown;

  data?: {
    id?: unknown;
  };
};

function getStringValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
}

function getWebhookDataId(
  body: MercadoPagoWebhookBody,
  searchParams: URLSearchParams
): string | null {
  return (
    searchParams.get('data.id') ||
    searchParams.get('id') ||
    getStringValue(body.data?.id) ||
    getStringValue(body.resource) ||
    getStringValue(body.id)
  );
}

function validateSignature(
  request: Request,
  body: MercadoPagoWebhookBody,
  searchParams: URLSearchParams
): boolean {
  try {
    const signature = request.headers.get('x-signature');

    const requestId = request.headers.get('x-request-id');

    console.log('================ VALIDATE SIGNATURE ================');

    console.log('📦 x-signature:', signature);

    console.log('📦 x-request-id:', requestId);

    if (!signature || !requestId) {
      console.error('❌ Headers de assinatura ausentes');

      return false;
    }

    let timestamp = '';
    let receivedHash = '';

    for (const part of signature.split(',')) {
      const separatorIndex = part.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = part.slice(0, separatorIndex).trim();

      const value = part.slice(separatorIndex + 1).trim();

      if (key === 'ts') {
        timestamp = value;
      }

      if (key === 'v1') {
        receivedHash = value;
      }
    }

    if (!timestamp || !receivedHash) {
      console.error('❌ Assinatura sem ts ou v1');

      return false;
    }

    const dataId = getWebhookDataId(body, searchParams);

    console.log('📦 dataId assinatura:', dataId);

    if (!dataId) {
      console.error('❌ data.id ausente');

      return false;
    }

    const secret = process.env.MP_WEBHOOK_SECRET;

    if (!secret) {
      console.error('❌ MP_WEBHOOK_SECRET não configurado');

      return false;
    }

    const manifest =
      `id:${dataId.toLowerCase()};` +
      `request-id:${requestId};` +
      `ts:${timestamp};`;

    const generatedHash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    const receivedBuffer = Buffer.from(receivedHash, 'utf8');

    const generatedBuffer = Buffer.from(generatedHash, 'utf8');

    const isValid =
      receivedBuffer.length === generatedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, generatedBuffer);

    console.log('📦 ts:', timestamp);

    console.log('📦 manifest:', manifest);

    console.log('📦 hash recebido:', receivedHash);

    console.log('📦 hash gerado:', generatedHash);

    console.log('✅ assinatura válida?', isValid);

    return isValid;
  } catch (error) {
    console.error('❌ Erro na validação da assinatura:', error);

    return false;
  }
}

export async function POST(request: Request) {
  console.log('');
  console.log('================ WEBHOOK MP ================');

  console.log('📦 URL:', request.url);

  let body: MercadoPagoWebhookBody = {};

  try {
    body = (await request.json()) as MercadoPagoWebhookBody;

    console.log('📦 BODY:', JSON.stringify(body, null, 2));
  } catch (error) {
    console.error('❌ Erro ao interpretar body:', error);

    /*
     * Um body inválido não deve ser
     * tratado como sucesso.
     */
    return NextResponse.json(
      {
        received: false,
        error: 'INVALID_BODY',
      },
      {
        status: 400,
      }
    );
  }

  const { searchParams } = new URL(request.url);

  const isValidSignature = validateSignature(request, body, searchParams);

  /*
   * Por enquanto, apenas registra a
   * assinatura inválida.
   *
   * Ative o retorno 401 somente depois
   * de corrigir MP_WEBHOOK_SECRET.
   */
  if (!isValidSignature) {
    console.warn('⚠️ Webhook recebido com assinatura inválida');

    /*
     * Depois de confirmar o secret,
     * substitua este aviso por:
     *
     * return NextResponse.json(
     *   {
     *     received: false,
     *     error: 'INVALID_SIGNATURE',
     *   },
     *   {
     *     status: 401,
     *   }
     * );
     */
  }

  const topic =
    getStringValue(body.type) ||
    getStringValue(body.topic) ||
    searchParams.get('type') ||
    searchParams.get('topic');

  const dataId = getWebhookDataId(body, searchParams);

  console.log('');
  console.log('================ EVENTO ================');

  console.log('📦 topic:', topic);

  console.log('📦 dataId:', dataId);

  if (!topic) {
    console.log('⚠️ Evento sem tópico');

    return NextResponse.json(
      {
        received: true,
        ignored: true,
        reason: 'MISSING_TOPIC',
      },
      {
        status: 200,
      }
    );
  }

  if (topic !== 'payment') {
    console.log('⚠️ Evento ignorado:', topic);

    return NextResponse.json(
      {
        received: true,
        ignored: true,
        reason: 'UNSUPPORTED_TOPIC',
      },
      {
        status: 200,
      }
    );
  }

  if (!dataId) {
    console.error('❌ dataId ausente');

    return NextResponse.json(
      {
        received: false,
        error: 'MISSING_DATA_ID',
      },
      {
        status: 400,
      }
    );
  }

  console.log('');
  console.log('================ SYNC PAYMENT ================');

  console.log('🟡 paymentId:', dataId);

  const syncResult = await syncPaymentStatus(dataId);

  if (!syncResult.success) {
    console.error('❌ Falha ao sincronizar pagamento:', {
      paymentId: dataId,
      reason: syncResult.reason,
    });

    /*
     * Retornando 500, o Mercado Pago
     * poderá reenviar a notificação.
     */
    return NextResponse.json(
      {
        received: false,
        error: 'PAYMENT_SYNC_FAILED',
        reason: syncResult.reason,
      },
      {
        status: 500,
      }
    );
  }

  console.log('✅ Pagamento sincronizado:', {
    paymentId: dataId,
    status: syncResult.status,
    updated: syncResult.updated,
  });

  console.log('================ FIM WEBHOOK ================');

  return NextResponse.json(
    {
      received: true,
      success: true,
      paymentId: dataId,
      status: syncResult.status,
      updated: syncResult.updated,
    },
    {
      status: 200,
    }
  );
}
