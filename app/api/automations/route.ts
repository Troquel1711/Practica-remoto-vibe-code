import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const automations = await prisma.automation.findMany({
      where: { userId: user.userId as string },
      include: { actions: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ automations });
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
    const { name, trigger, actions } = await req.json();

    const automation = await prisma.automation.create({
      data: {
        userId: user.userId as string,
        name,
        trigger,
        actions: {
          create: actions.map((action: any, index: number) => ({
            type: action.type,
            config: JSON.stringify(action.config),
            orderIndex: index
          }))
        }
      },
      include: { actions: true }
    });

    return NextResponse.json({ automation });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
