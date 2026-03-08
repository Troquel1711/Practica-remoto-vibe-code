import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const automation = await prisma.automation.findUnique({
      where: { id: params.id },
      include: { 
        actions: {
          orderBy: { orderIndex: 'asc' }
        } 
      }
    });

    if (!automation || automation.userId !== user.userId) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    return NextResponse.json({ automation });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const { name, trigger, status, actions } = await req.json();

    const existingAuto = await prisma.automation.findUnique({
      where: { id: params.id }
    });

    if (!existingAuto || existingAuto.userId !== user.userId) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    }

    // Replace actions: delete old ones, create new ones
    await prisma.$transaction([
      prisma.action.deleteMany({ where: { automationId: params.id } }),
      prisma.automation.update({
        where: { id: params.id },
        data: {
          name,
          trigger,
          status,
          actions: {
            create: actions.map((act: any, idx: number) => ({
              type: act.type,
              config: typeof act.config === 'string' ? act.config : JSON.stringify(act.config || {}),
              orderIndex: idx
            }))
          }
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
