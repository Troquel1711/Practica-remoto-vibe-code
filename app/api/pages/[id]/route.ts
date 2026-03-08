import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const page = await prisma.page.findFirst({
      where: { id, userId: user.userId as string }
    });
    if (!page) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ page });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    const { title, urlSlug, contentJson, status } = await req.json();

    const page = await prisma.page.updateMany({
      where: { id, userId: user.userId as string },
      data: { title, urlSlug, contentJson, status }
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno o slug duplicado' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { id } = await params;
    // We use deleteMany to avoid throwing if not found, as we filter by userId as well
    const deleted = await prisma.page.deleteMany({
      where: { id, userId: user.userId as string }
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'No autorizado o no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno al eliminar la landing page.' }, { status: 500 });
  }
}
