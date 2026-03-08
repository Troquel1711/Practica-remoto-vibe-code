import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'angel.leovardo@gmail.com' } });
  if (!user) {
    console.log('Usuario no encontrado');
    return;
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
      name: 'Formulario de Contacto Principal',
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

  console.log('SUCCESS');
}

main().catch(console.error).finally(()=>prisma.$disconnect());
