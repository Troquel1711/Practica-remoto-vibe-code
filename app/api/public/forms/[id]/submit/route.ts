import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const formData = body.data;

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Datos de formulario inválidos' }, { status: 400 });
    }

    // El formulario debe existir para procesar su respuesta
    const form = await prisma.form.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!form) {
      return NextResponse.json({ error: 'Formulario no asociado a ningún usuario' }, { status: 404 });
    }

    // Aquí registramos la respuesta como un Lead asociado al dueño del formulario
    // Un formulario público podría o no tener campos como `email` o `name` bajo esos nombres id exactos. 
    // Por simplicidad, guardamos todo el payload en la tabla de Leads en customData.
    
    // Tratamos de adivinar el email si existe un campo que parezca un correo
    let extractedEmail = "";
    let extractedName = "Lead desde Formulario";
    
    for (const key in formData) {
      const val = String(formData[key]).toLowerCase();
      if (val.includes('@') && val.includes('.')) {
        extractedEmail = formData[key];
      }
    }

    const newLead = await prisma.lead.create({
      data: {
        userId: form.userId,
        name: extractedName,
        email: extractedEmail || "noreply@launchify.app",
        source: `Form [${form.name}]: ${JSON.stringify(formData).substring(0, 100)}`
      }
    });

    // --- EXECUTE AUTOMATIONS ---
    const activeAutomations = await prisma.automation.findMany({
      where: {
        userId: form.userId,
        status: 'active',
        trigger: 'form_submit'
      },
      include: {
        actions: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (activeAutomations.length > 0) {
      // Execute asynchronously (fire and forget pattern for simple flows)
      Promise.all(activeAutomations.map(async (auto) => {
        try {
          for (const action of auto.actions) {
            let config: any = {};
            try { config = JSON.parse(action.config || "{}"); } catch(e){}
            
            console.log(`[Automation Exec] Triggering node '${action.type}' for Lead ${newLead.id}`);

            if (action.type === 'webhook' && config.url) {
              await fetch(config.url, {
                method: config.method || 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lead: newLead, payload: formData })
              }).catch(err => console.error("Webhook failed:", err));
            } else if (action.type === 'email') {
              console.log(`=> Simulando envío de Email a ${extractedEmail} con asunto: ${config.subject}`);
            } else if (action.type === 'whatsapp') {
              console.log(`=> Simulando WhatsApp enviado: ${config.message}`);
            } else if (action.type === 'tag') {
              console.log(`=> Añadiendo etiquetas al lead: ${config.tags}`);
            } else if (action.type === 'slack') {
              console.log(`=> Notificación a Slack (#${config.channel}): ${config.message}`);
            }
            // Real apps would use a Queue/BullMQ for 'wait' and retries.
          }
        } catch(e) {
          console.error(`Error en automatización ${auto.id}:`, e);
        }
      })).catch(console.error);
    }

    return NextResponse.json({ success: true, leadId: newLead.id });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando respuesta' }, { status: 500 });
  }
}
