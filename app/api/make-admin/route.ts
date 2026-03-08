import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Convierte todos los usuarios locales existentes a administradores
    await prisma.user.updateMany({
      data: { role: 'admin' }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: '¡Listo! Tu cuenta ahora tiene permisos de Administrador.',
      instrucciones: 'Por favor, VE A TU DASHBOARD, CIERRA SESIÓN y VUELVE A INICIARLA para que los cambios se reflejen en tu navegador.' 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
