// app/api/admin/logout/route.ts

import { NextResponse } from 'next/server';
import { deleteAdminSession } from '@/lib/auth/admin-session';

export async function POST() {
  await deleteAdminSession();

  return NextResponse.json({
    success: true,
  });
}
