import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'angel.leovardo@gmail.com' } });
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    // Check if the form already exists to prevent duplicate failures
    const existingForm = await prisma.form.findFirst({ where: { name: 'Formulario Inteligente' }});
    if (existingForm) {
       return NextResponse.json({ success: true, message: 'Already created.' });
    }

    const formFields = [
      { id: 'f1', type: 'name', label: 'Nombre Completo', placeholder: 'Ej: Juan Pérez', required: true },
      { id: 'f2', type: 'email', label: 'Correo Electrónico', placeholder: 'tu@email.com', required: true },
      { id: 'f3', type: 'whatsapp', label: 'WhatsApp', placeholder: '+52 000 000 0000', required: true },
      { id: 'f4', type: 'company', label: 'Nombre de tu Empresa', placeholder: 'Mi Negocio', required: false },
      { id: 'f5', type: 'textarea', label: '¿En qué podemos ayudarte?', placeholder: 'Escribe los detalles aquí...', required: false }
    ];

    const form = await prisma.form.create({
      data: {
        userId: user.id,
        name: 'Formulario Inteligente',
        fieldsJson: JSON.stringify(formFields)
      }
    });

    const auto = await prisma.automation.create({
      data: {
        userId: user.id,
        name: 'Enviar Leads a GHL',
        trigger: 'form_submit',
        status: 'active',
        actions: {
          create: [
            {
              type: 'webhook',
              orderIndex: 0,
              config: JSON.stringify({
                url: 'https://services.leadconnectorhq.com/hooks/tyLcD5PsU0EFBHpBQXfM/webhook-trigger/f28702b7-9f40-449c-8350-c8759a700e37',
                method: 'POST'
              })
            }
          ]
        }
      }
    });

    return NextResponse.json({ success: true, form, auto });
  } catch(err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
