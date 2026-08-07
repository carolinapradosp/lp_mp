// app/api/products/upload/route.ts

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

import { verifyAdminSession } from '@/lib/auth/admin-session';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;

    const response = await handleUpload({
      body,
      request,

      onBeforeGenerateToken: async (pathname) => {
        const isAuthenticated = await verifyAdminSession();

        if (!isAuthenticated) {
          throw new Error('Usuário não autorizado.');
        }

        if (!pathname.startsWith('products/')) {
          throw new Error('Diretório de upload inválido.');
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,

          maximumSizeInBytes: MAX_FILE_SIZE,

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            source: 'admin-products',
          }),
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.info('Upload do produto concluído:', blob.url);
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Erro ao autorizar upload:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Não foi possível enviar a imagem.';

    return NextResponse.json(
      {
        message,
      },
      {
        status: 400,
      }
    );
  }
}
