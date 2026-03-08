import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Ruta pública: no requiere JWT
    const form = await prisma.form.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        fieldsJson: true,
        styleJson: true
      }
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ form }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error obteniendo formulario' }, { status: 500 });
  }
}
