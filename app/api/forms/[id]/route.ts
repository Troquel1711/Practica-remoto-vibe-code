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
    const form = await prisma.form.findFirst({
      where: { id, userId: user.userId as string }
    });
    if (!form) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ form });
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
    const { name, fieldsJson, styleJson } = await req.json();

    const existingForm = await prisma.form.findUnique({
      where: { id }
    });

    if (!existingForm || existingForm.userId !== user.userId) {
      return NextResponse.json({ error: 'No encontrado o sin permiso' }, { status: 404 });
    }

    const form = await prisma.form.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingForm.name,
        fieldsJson: fieldsJson !== undefined ? fieldsJson : existingForm.fieldsJson,
        styleJson: styleJson !== undefined ? styleJson : existingForm.styleJson
      }
    });

    return NextResponse.json({ success: true, form });
  } catch (error) {
    return NextResponse.json({ error: 'Error actualizando formulario' }, { status: 500 });
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
    const deleted = await prisma.form.deleteMany({
      where: { id, userId: user.userId as string }
    });
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno al eliminar el formulario' }, { status: 500 });
  }
}
