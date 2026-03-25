import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { prisma } from "@/core/infrastructure/database/prisma";
import { PrismaWhatsAppRepository } from "@/core/infrastructure/database/repositories/prisma-whatsapp.repository";
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
      await service.saveMessage({
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

