import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, password } = body;

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

    const adminUsername = process.env.ADMIN_USERNAME;

    const adminPassword = process.env.ADMIN_PASSWORD;

    const isValidUser = username === adminUsername;

    const isValidPassword = password === adminPassword;

    if (!isValidUser || !isValidPassword) {
      return NextResponse.json(
        {
          error: 'Usuário ou senha inválidos',
        },
        {
          status: 401,
        }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: 'admin-auth',
      value: 'authenticated',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 dia
    });

    return response;
  } catch (error) {
    console.error(error);

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
