// app/api/webhooks/mercadopago/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { syncPaymentStatus } from '@/lib/mercadopago/sync-payment-status';

function validateSignature(
  request: Request,
  body: any,
  searchParams: URLSearchParams
) {
  try {
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');

    console.log('================ VALIDATE SIGNATURE ================');
    console.log('📦 x-signature:', signature);
    console.log('📦 x-request-id:', requestId);

    if (!signature || !requestId) {
      console.error('❌ Headers assinatura ausentes');
      return false;
    }

    let ts = '';
    let hash = '';

    signature.split(',').forEach((part) => {
      const [key, value] = part.split('=');

      if (key?.trim() === 'ts') {
        ts = value;
      }

      if (key?.trim() === 'v1') {
        hash = value;
      }
    });

    const dataId =
      searchParams.get('data.id') ||
      searchParams.get('id') ||
      body?.data?.id ||
      body?.resource ||
      body?.id;

    console.log('📦 dataId assinatura:', dataId);

    if (!dataId) {
      console.error('❌ data.id ausente');
      return false;
    }

    const manifest =
      `id:${String(dataId).toLowerCase()};` +
      `request-id:${requestId};` +
      `ts:${ts};`;

    const secret = process.env.MP_WEBHOOK_SECRET!;

    const generatedHash = crypto
      .createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    console.log('📦 ts:', ts);
    console.log('📦 manifest:', manifest);
    console.log('📦 hash recebido:', hash);
    console.log('📦 hash gerado:', generatedHash);
    console.log('✅ assinatura válida?', generatedHash === hash);

    return generatedHash === hash;
  } catch (err) {
    console.error('❌ Erro validação assinatura:', err);
    return false;
  }
}

export async function POST(request: Request) {
  console.log('');
  console.log('================ WEBHOOK MP ================');

  console.log('📦 URL:', request.url);

  let body: any = {};

  try {
    body = await request.json();

    console.log('📦 BODY:', JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('❌ Erro parse body:', err);

    return new NextResponse(null, {
      status: 200,
    });
  }

  console.log('');
  console.log('================ HEADERS ================');

  request.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  const { searchParams } = new URL(request.url);

  const isValid = validateSignature(request, body, searchParams);

  /*
   * Quando validar tudo em produção,
   * descomente esse bloco.
   */
  /*
  if (!isValid) {
    console.error('❌ Assinatura inválida');

    return new NextResponse(null, {
      status: 401,
    });
  }
  */

  const topic =
    body?.type ||
    body?.topic ||
    searchParams.get('type') ||
    searchParams.get('topic');

  const dataId =
    searchParams.get('data.id') ||
    searchParams.get('id') ||
    body?.data?.id ||
    body?.resource ||
    body?.id;

  console.log('');
  console.log('================ EVENTO ================');

  console.log('📦 topic:', topic);
  console.log('📦 dataId:', dataId);

  if (!topic) {
    console.log('⚠️ Evento sem tópico');

    return new NextResponse(null, {
      status: 200,
    });
  }

  if (topic !== 'payment') {
    console.log('⚠️ Evento ignorado:', topic);

    return new NextResponse(null, {
      status: 200,
    });
  }

  if (!dataId) {
    console.log('⚠️ dataId ausente');

    return new NextResponse(null, {
      status: 200,
    });
  }

  try {
    console.log('');
    console.log('================ SYNC PAYMENT ================');
    console.log('🟡 paymentId:', dataId);

    await syncPaymentStatus(dataId.toString());

    console.log('✅ Pagamento sincronizado');
  } catch (err) {
    console.error('❌ Erro sincronizando pagamento:', err);
  }

  console.log('================ FIM WEBHOOK ================');

  return new NextResponse(null, {
    status: 200,
  });
}
