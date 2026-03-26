import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { SendMessageUseCase } from "@/core/application/use-cases/whatsapp/send-message.use-case";
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
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const service = new WhatsAppService(new PrismaWhatsAppRepository());

    for (const message of messages) {
      const waMessageId = message.id;
      const from = message.from;
      const timestamp = new Date(Number(message.timestamp) * 1000);

      const messageType = message.type ?? "text";
      const isText = messageType === "text";

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
      if (existing) continue;

      // 2. Resolver cliente
      const cliente = await service.findClienteByPhone(from);
      if (!cliente) continue;

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

      // 5. Actualizar conversación
      await service.updateConversacion(conversacion.id, {
        ultimoMensaje: new Date(),
        ultimoMensajeEntrante: new Date(),
      });

      // Obtener la conversación actualizada para leer aiOwned y aiTurns
      const conversacionActual = await service.findConversacionById(
        conversacion.id
      );
      if (isText)
        processWithAI(savedMessage, cliente, conversacionActual).catch(
          console.error
        );

      getIO()?.emit("newWhatsAppMessage", {
        conversacionId: conversacion.id,
        clienteId: cliente.id,
        previewBody: body,
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

async function processWithAI(
  savedMessage: {
    id: number;
    body: string;
    from: string;
    conversacionId: number;
  },
  cliente: { id: number; fullName: string; cars: { id: number }[] },
  conversacion: { id: number; aiOwned: boolean; aiTurns: number }
): Promise<void> {
  const service = new WhatsAppService(new PrismaWhatsAppRepository());
  const autoIds = cliente.cars.map((c) => c.id);
  const MAX_TURNS = parseInt(process.env.AI_MAX_TURNS ?? "3");

  // 1. Obtener contexto del cliente (turnos, órdenes, presupuestos)
  const [turnosFuturos, ultimasOrdenes, ultimosPresupuestos] =
    await Promise.all([
      prisma.turno.findMany({
        where: { autoId: { in: autoIds }, fecha: { gte: new Date() } },
        orderBy: { fecha: "asc" },
        take: 3,
      }),
      prisma.ordenReparacion.findMany({
        where: { autoId: { in: autoIds } },
        orderBy: { fechaCreacion: "desc" },
        take: 3,
        include: { auto: { select: { brand: true, model: true } } },
      }),
      prisma.presupuesto.findMany({
        where: { autoId: { in: autoIds } },
        orderBy: { fecha: "desc" },
        take: 2,
        include: { auto: { select: { brand: true, model: true } } },
      }),
    ]);

  // 2. Obtener historial reciente de la conversación (últimos 10 mensajes)
  const history = await service.getConversationHistory(conversacion.id, 10);

  // 3. Llamar al clasificador con el historial completo
  const result = await aiFilter.classify({
    history,
    cliente: { fullName: cliente.fullName },
    context: {
      turnosFuturos: turnosFuturos.map((t) => ({
        fecha: t.fecha,
        hora: t.hora,
        problema: t.problema,
        auto: "",
      })),
      ultimasOrdenes: ultimasOrdenes.map((o) => ({
        id: o.id,
        estado: o.estado,
        auto: [o.auto.brand, o.auto.model].filter(Boolean).join(" "),
      })),
      ultimosPresupuestos: ultimosPresupuestos.map((p) => ({
        id: p.id,
        estado: p.estado,
        auto: [p.auto?.brand, p.auto?.model].filter(Boolean).join(" "),
      })),
    },
  });

  // 4. Actuar según el resultado
  if (result.type === "answer") {
    // La IA pudo responder → enviar y resetear estado
    await new SendMessageUseCase(service).execute({
      conversacionId: conversacion.id,
      to: savedMessage.from,
      type: "text",
      body: result.response,
      sentByAi: true,
    });
    await service.updateConversacionAi(conversacion.id, {
      aiOwned: false,
      aiTurns: 0,
    });
  } else if (result.type === "follow_up") {
    if (conversacion.aiTurns >= MAX_TURNS) {
      // Llegó al límite de turnos → derivar al humano
      await service.updateMessage(savedMessage.id, { requiresHuman: true });
      await service.updateConversacionAi(conversacion.id, {
        aiOwned: false,
        aiTurns: 0,
      });
      getIO()?.emit("newWhatsAppMessage", {
        conversacionId: conversacion.id,
        requiresHuman: true,
      });
    } else {
      // Puede hacer follow_up → enviar pregunta y marcar conversación como aiOwned
      await new SendMessageUseCase(service).execute({
        conversacionId: conversacion.id,
        to: savedMessage.from,
        type: "text",
        body: result.question,
        sentByAi: true,
      });
      await service.updateConversacionAi(conversacion.id, {
        aiOwned: true,
        aiTurns: conversacion.aiTurns + 1,
      });
    }
  } else {
    // handoff → derivar al humano y resetear estado
    await service.updateMessage(savedMessage.id, { requiresHuman: true });
    await service.updateConversacionAi(conversacion.id, {
      aiOwned: false,
      aiTurns: 0,
    });
    getIO()?.emit("newWhatsAppMessage", {
      conversacionId: conversacion.id,
      requiresHuman: true,
    });
  }
}

