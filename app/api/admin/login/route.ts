// app/api/admin/login/route.ts

import { NextResponse } from 'next/server';
import { createAdminSession } from '@/lib/auth/admin-session';
import { validateAdminCredentials } from '@/lib/auth/credentials';

type LoginBody = {
  username?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    if (
      typeof body.username !== 'string' ||
      typeof body.password !== 'string'
    ) {
      return NextResponse.json(
        {
          error: 'Usuário e senha são obrigatórios',
        },
        {
          status: 400,
        }
      );
    }

    const username = body.username.trim();
    const password = body.password;

    if (!username || !password) {
      return NextResponse.json(
        {
          error: 'Usuário e senha são obrigatórios',
        },
        {
          status: 400,
        }
      );
    }

    const isValid = validateAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        {
          error: 'Usuário ou senha inválidos',
        },
        {
          status: 401,
        }
      );
    }

    await createAdminSession();

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Erro no login administrativo:', error);

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
      },
      {
        status: 500,
      }
    );
  }
}
