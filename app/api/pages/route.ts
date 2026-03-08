import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { templates } from '@/lib/templates';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  
  const user = await verifyToken(token);
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  try {
    const pages = await prisma.page.findMany({
      where: { userId: user.userId as string },
      orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json({ pages });
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
    const { title, templateId } = await req.json();
    const urlSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${uuidv4().split('-')[0]}`;
    
    let defaultContent = [
      { id: uuidv4(), type: "hero", data: { title: "Mi Nueva Landing Page", subtitle: "Una breve descripción de tu oferta.", buttonText: "Acción" } }
    ];

    if (templateId) {
      const tpl = templates.find(t => t.id === templateId);
      if (tpl) defaultContent = tpl.contentJson;
    }

    const page = await prisma.page.create({
      data: {
        userId: user.userId as string,
        title,
        urlSlug,
        contentJson: JSON.stringify(defaultContent),
        status: "draft"
      }
    });

    return NextResponse.json({ page });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
