import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const branding = await prisma.branding.findFirst({
      where: { userId: user.userId as string },
    });
    return NextResponse.json({ branding });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { logoUrl, colors, typography } = await req.json();

    const existingBranding = await prisma.branding.findFirst({
      where: { userId: user.userId as string },
    });

    let branding;
    if (existingBranding) {
      branding = await prisma.branding.update({
        where: { id: existingBranding.id },
        data: { logoUrl, colors, typography },
      });
    } else {
      branding = await prisma.branding.create({
        data: {
          userId: user.userId as string,
          logoUrl,
          colors,
          typography,
        },
      });
    }

    return NextResponse.json({ branding });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
