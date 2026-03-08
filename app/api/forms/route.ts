import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const forms = await prisma.form.findMany({
      where: { userId: user.userId as string },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ forms });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { name, fieldsJson } = await req.json();

    const form = await prisma.form.create({
      data: {
        userId: user.userId as string,
        name: name || 'Nuevo Formulario',
        fieldsJson: fieldsJson || '[]'
      }
    });

    return NextResponse.json({ success: true, form });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno al crear el formulario' }, { status: 500 });
  }
}
