import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { SendMessageUseCase } from "@/core/application/use-cases/whatsapp/send-message.use-case";
import { SendPdfUseCase } from "@/core/application/use-cases/whatsapp/send-pdf.use-case";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PrismaWhatsAppRepository } from "@/core/infrastructure/database/repositories/prisma-whatsapp.repository";
import { aiFilter } from "@/core/infrastructure/external/whatsapp/ai-filter";
import { getIO } from "@/lib/socketio";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hubMode = searchParams.get("hub.mode");
  const hubVerifyToken = searchParams.get("hub.verify_token");
  const hubChallenge = searchParams.get("hub.challenge");

  if (
    hubMode === "subscribe" &&
    hubVerifyToken === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new Response(hubChallenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const messages = body?.entry?.[0]?.changes?.[0]?.value?.messages;
    if (!Array.isArray(messages)) {
      console.log(
        "[WhatsApp Webhook] POST: sin array messages (status/otro evento) → 200 sin procesar"
      );
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const service = new WhatsAppService(new PrismaWhatsAppRepository());

    for (const message of messages) {
      const waMessageId = message.id;
      const from = message.from;
      const timestamp = new Date(Number(message.timestamp) * 1000);

      const messageType = message.type ?? "text";
      const isText = messageType === "text";

      console.log("[WhatsApp Webhook] mensaje entrante", {
        waMessageId,
        from,
        messageType,
        isText,
      });

      // Extraer body según tipo
      const body = isText
        ? (message.text?.body ?? "")
        : `[${messageType}]`;

      // Extraer media_id según tipo
      const mediaId: string | undefined =
        message.audio?.id ??
        message.image?.id ??
        message.video?.id ??
        message.document?.id ??
        message.sticker?.id ??
        undefined;

      // Extraer mimeType (Meta no siempre lo manda en el webhook, se infiere del tipo)
      const mimeTypeMap: Record<string, string> = {
        audio: "audio/ogg",
        image: "image/jpeg",
        video: "video/mp4",
        sticker: "image/webp",
      };
      const mediaMimeType: string | undefined =
        message.document?.mime_type ??
        mimeTypeMap[messageType] ??
        undefined;

      // Caption para imagen, video y documento
      const mediaCaption: string | undefined =
        message.image?.caption ??
        message.video?.caption ??
        message.document?.filename ?? // para documentos usamos filename como caption
        undefined;

      // Si es un reply, guardar el waMessageId del mensaje original
      const replyToWaId: string | undefined = message.context?.id ?? undefined;

      // 1. Chequear duplicado
      const existing = await prisma.mensajeWhatsApp.findFirst({
        where: { waMessageId },
      });
      if (existing) {
        console.log("[WhatsApp Webhook] flujo: omitir duplicado", {
          waMessageId,
        });
        continue;
      }

      // 2. Resolver cliente
      const cliente = await service.findClienteByPhone(from);
      if (!cliente) {
        console.log(
          "[WhatsApp Webhook] flujo: omitir — cliente no encontrado para from",
          { from }
        );
        continue;
      }

      // 3. Resolver conversación
      const conversacion = await service.findOrCreateConversacion(cliente.id);

      // 4. Guardar mensaje inbound
      const savedMessage = await service.saveMessage({
        conversacionId: conversacion.id,
        from,
        to: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
        body,
        tipo: "inbound",
        waMessageId,
        mediaId,
        mediaMimeType,
        mediaCaption,
        replyToWaId,
        requiresHuman: !isText,
        status: "received",
        timestamp,
      } as any);

      console.log("[WhatsApp Webhook] inbound guardado", {
        conversacionId: conversacion.id,
        mensajeId: savedMessage.id,
        requiresHuman: !isText,
        messageType,
      });

      // 5. Actualizar conversación
      await service.updateConversacion(conversacion.id, {
        ultimoMensaje: new Date(),
        ultimoMensajeEntrante: new Date(),
      });

      getIO()?.emit("newWhatsAppMessage", {
        conversacionId: conversacion.id,
        clienteId: cliente.id,
        previewBody: body,
      });

      // Si el mensaje no es texto, avisar al cliente y derivar al humano
      if (!isText) {
        // Emitir socket para notificar al administrativo
        getIO()?.emit("newWhatsAppMessage", {
          conversacionId: conversacion.id,
          requiresHuman: true,
        });

        // Responder al cliente con un mensaje automático
        try {
          const service2 = new WhatsAppService(new PrismaWhatsAppRepository());
          await new SendMessageUseCase(service2).execute({
            conversacionId: conversacion.id,
            to: from,
            type: "text",
            body: "Recibimos tu mensaje. Por el momento solo podemos procesar mensajes de texto de forma automática. Un asesor del taller te va a responder a la brevedad.",
            sentByAi: true,
          });
        } catch (err) {
          console.error(
            "[WhatsApp Webhook] error al enviar respuesta automática a media:",
            err
          );
          // No romper el webhook si falla el envío
        }

        // No llamar a processWithAI para mensajes no-texto
        continue;
      }

      // Solo llegar acá si isText === true
      const conversacionActual = await service.findConversacionById(
        conversacion.id
      );
      processWithAI(savedMessage, cliente, conversacionActual).catch(
        console.error
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

async function processWithAI(
  savedMessage: { id: number; body: string; from: string; conversacionId: number },
  cliente: { id: number; fullName: string; cars: { id: number }[] },
  conversacion: { id: number; aiOwned: boolean; aiTurns: number }
): Promise<void> {
  const service = new WhatsAppService(new PrismaWhatsAppRepository())
  const autoIds = cliente.cars.map(c => c.id)
  const MAX_TURNS = parseInt(process.env.AI_MAX_TURNS ?? "3")
  const HUMAN_TAKEOVER_MINUTES = parseInt(process.env.AI_HUMAN_TAKEOVER_MINUTES ?? "60")

  console.log("[AI] inicio processWithAI", {
    conversacionId: conversacion.id,
    mensajeId: savedMessage.id,
    body: savedMessage.body,
    aiOwned: conversacion.aiOwned,
    aiTurns: conversacion.aiTurns,
    maxTurns: MAX_TURNS,
    clienteId: cliente.id,
    autos: autoIds
  })

  // 1. Chequear si un humano tomó el control recientemente
  const humanoReciente = await prisma.mensajeWhatsApp.findFirst({
    where: {
      conversacionId: conversacion.id,
      requiresHuman: true,
      read: false
    },
    orderBy: { timestamp: "desc" }
  })

  const takoverCutoff = new Date(Date.now() - HUMAN_TAKEOVER_MINUTES * 60 * 1000)
  if (humanoReciente && humanoReciente.timestamp > takoverCutoff) {
    console.log("[AI] conversación en manos de humano — omitir IA", {
      conversacionId: conversacion.id,
      ultimoRequiresHumanAt: humanoReciente.timestamp,
      cutoff: takoverCutoff
    })
    getIO()?.emit("newWhatsAppMessage", { conversacionId: conversacion.id, requiresHuman: false })
    return
  }

  // 2. Rate limit
  const hace60Seg = new Date(Date.now() - 60 * 1000)
  const mensajesRecientes = await prisma.mensajeWhatsApp.count({
    where: {
      conversacionId: conversacion.id,
      tipo: "inbound",
      timestamp: { gte: hace60Seg }
    }
  })
  const RATE_LIMIT = parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE ?? "3")
  if (mensajesRecientes > RATE_LIMIT) {
    console.log("[AI] rate limit alcanzado — omitir", { conversacionId: conversacion.id, mensajesRecientes })
    return
  }

  // 3. Obtener contexto
  const quinceDiasAtras = new Date()
  quinceDiasAtras.setDate(quinceDiasAtras.getDate() - 15)

  const [turnosFuturos, ultimasOrdenes, ultimosPresupuestos, trabajosRealizados] = await Promise.all([
    prisma.turno.findMany({
      where: { autoId: { in: autoIds }, fecha: { gte: new Date() } },
      orderBy: { fecha: "asc" },
      take: 3
    }),
    prisma.ordenReparacion.findMany({
      where: {
        autoId: { in: autoIds },
        fechaCreacion: { gte: quinceDiasAtras },
        estado: { in: ["EnProgreso", "Aceptado", "Terminado", "SeRetira", "Presupuestado"] }
      },
      orderBy: { fechaCreacion: "desc" },
      take: 3,
      include: {
        auto: { select: { brand: true, model: true, patent: true } },
        trabajosRealizados: { select: { descripcion: true } }
      }
    }),
    prisma.presupuesto.findMany({
      where: {
        autoId: { in: autoIds },
        fecha: { gte: quinceDiasAtras },
        estado: { in: ["EnPreparacion", "Terminado", "Enviado", "ADefinir", "Aceptado"] }
      },
      orderBy: { fecha: "desc" },
      take: 2,
      include: { auto: { select: { brand: true, model: true, patent: true } } }
    }),
    prisma.trabajoRealizado.findMany({
      where: {
        ordenReparacion: {
          autoId: { in: autoIds },
          fechaCreacion: { gte: quinceDiasAtras }
        }
      },
      select: { descripcion: true, ordenReparacionId: true },
      take: 10
    })
  ])

  console.log("[AI] contexto obtenido", {
    turnosFuturos: turnosFuturos.map(t => ({ fecha: t.fecha, hora: t.hora, problema: t.problema })),
    ultimasOrdenes: ultimasOrdenes.map(o => ({
      id: o.id,
      estado: o.estado,
      auto: o.auto.patent,
      fechaCreacion: o.fechaCreacion,
      fechaSalida: (o as any).fechaSalidaReparacion ?? null,
      trabajos: o.trabajosRealizados.map(tr => tr.descripcion)
    })),
    ultimosPresupuestos: ultimosPresupuestos.map(p => ({
      id: p.id,
      estado: p.estado,
      auto: p.auto?.patent
    })),
    trabajosRealizados: trabajosRealizados.map(tr => tr.descripcion)
  })

  // 4. Historial
  const history = await service.getConversationHistory(conversacion.id, 10)
  console.log("[AI] historial", { mensajes: history.length, ultimo: history[history.length - 1] ?? null })

  // 5. Clasificar
  const context = {
    turnosFuturos: turnosFuturos.map(t => ({
      fecha: t.fecha, hora: t.hora, problema: t.problema, auto: ""
    })),
    ultimasOrdenes: ultimasOrdenes.map(o => ({
      id: o.id,
      estado: o.estado,
      auto: [o.auto.brand, o.auto.model, o.auto.patent].filter(Boolean).join(" "),
      fechaCreacion: o.fechaCreacion,
      fechaSalidaReparacion: (o as any).fechaSalidaReparacion ?? null,
      trabajosRealizados: o.trabajosRealizados.map(tr => tr.descripcion)
    })),
    ultimosPresupuestos: ultimosPresupuestos.map(p => ({
      id: p.id,
      estado: p.estado,
      auto: [p.auto?.brand, p.auto?.model, p.auto?.patent].filter(Boolean).join(" ")
    })),
    trabajosRealizados: trabajosRealizados.map(tr => tr.descripcion)
  }

  const result = await aiFilter.classify({ history, cliente: { fullName: cliente.fullName }, context: context as any })

  console.log("[AI] resultado clasificador", { type: result.type, conversacionId: conversacion.id })

  // 6. Actuar
  if (result.type === "courtesy") {
    console.log("[AI] cortesía — sin acción")
    return
  }

  if (result.type === "answer") {
    console.log("[AI] answer — enviando respuesta", { preview: (result as any).response?.slice(0, 80) })
    await new SendMessageUseCase(service).execute({
      conversacionId: conversacion.id,
      to: savedMessage.from,
      type: "text",
      body: (result as any).response,
      sentByAi: true
    })
    await service.updateConversacionAi(conversacion.id, { aiOwned: false, aiTurns: 0 })

    // Si hay una orden terminada reciente, intentar enviar el PDF
    const ordenTerminada = ultimasOrdenes.find(o => o.estado === "Terminado" || o.estado === "SeRetira")
    if (ordenTerminada) {
      console.log("[AI] orden terminada detectada — intentar enviar PDF", { ordenId: ordenTerminada.id })
      try {
        await new SendPdfUseCase(service).execute({ resourceType: "orden", resourceId: ordenTerminada.id })
        console.log("[AI] PDF de orden enviado", { ordenId: ordenTerminada.id })
      } catch (err) {
        console.error("[AI] error al enviar PDF de orden — continuar sin PDF", err)
      }
    }

    // Si hay un presupuesto enviado/terminado reciente, intentar enviar el PDF
    const presupuestoEnviado = ultimosPresupuestos.find(
      p => p.estado === "Enviado" || p.estado === "Terminado"
    )
    if (presupuestoEnviado) {
      console.log("[AI] presupuesto enviado detectado — intentar enviar PDF", { presupuestoId: presupuestoEnviado.id })
      try {
        await new SendPdfUseCase(service).execute({ resourceType: "presupuesto", resourceId: presupuestoEnviado.id })
        console.log("[AI] PDF de presupuesto enviado", { presupuestoId: presupuestoEnviado.id })
      } catch (err) {
        console.error("[AI] error al enviar PDF de presupuesto — continuar sin PDF", err)
      }
    }

    return
  }

  if (result.type === "follow_up") {
    if (conversacion.aiTurns >= MAX_TURNS) {
      console.log("[AI] límite de turnos alcanzado — handoff", { aiTurns: conversacion.aiTurns, maxTurns: MAX_TURNS })
      await new SendMessageUseCase(service).execute({
        conversacionId: conversacion.id,
        to: savedMessage.from,
        type: "text",
        body: "Aguardanos un momento, ahora nos comunicamos con vos.",
        sentByAi: true
      })
      await service.updateMessage(savedMessage.id, { requiresHuman: true })
      await service.updateConversacionAi(conversacion.id, { aiOwned: false, aiTurns: 0 })
      getIO()?.emit("newWhatsAppMessage", { conversacionId: conversacion.id, requiresHuman: true })
    } else {
      console.log("[AI] follow_up", { aiTurns: conversacion.aiTurns, question: (result as any).question?.slice(0, 80) })
      await new SendMessageUseCase(service).execute({
        conversacionId: conversacion.id,
        to: savedMessage.from,
        type: "text",
        body: (result as any).question,
        sentByAi: true
      })
      await service.updateConversacionAi(conversacion.id, {
        aiOwned: true,
        aiTurns: conversacion.aiTurns + 1
      })
    }
    return
  }

  if (result.type === "handoff_with_message") {
    console.log("[AI] handoff_with_message", { preview: (result as any).response?.slice(0, 80) })
    await new SendMessageUseCase(service).execute({
      conversacionId: conversacion.id,
      to: savedMessage.from,
      type: "text",
      body: (result as any).response,
      sentByAi: true
    })
    await service.updateMessage(savedMessage.id, { requiresHuman: true })
    await service.updateConversacionAi(conversacion.id, { aiOwned: false, aiTurns: 0 })
    getIO()?.emit("newWhatsAppMessage", { conversacionId: conversacion.id, requiresHuman: true })
  }
}

