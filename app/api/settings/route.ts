import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const userData = await prisma.user.findUnique({
      where: { id: user.userId as string },
      select: { id: true, name: true, email: true, role: true }
    });
    return NextResponse.json({ user: userData });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { name, currentPassword, newPassword } = await req.json();

    const currentUser = await prisma.user.findUnique({ where: { id: user.userId as string } });
    if (!currentUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const dataToUpdate: any = { name };

    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, currentUser.passwordHash);
      if (!isValid) return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.userId as string },
      data: dataToUpdate,
      select: { id: true, name: true, email: true }
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
