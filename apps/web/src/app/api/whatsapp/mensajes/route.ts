import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { metaClient } from "@/core/infrastructure/external/whatsapp/meta.client";
import { PrismaWhatsAppRepository } from "@/core/infrastructure/database/repositories/prisma-whatsapp.repository";
import { whatsappGuard } from "@/core/infrastructure/external/whatsapp/whatsapp.guard";
import { sendMensajeSchema } from "@/core/infrastructure/validation/schemas/whatsapp.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const dto = await validateRequest(body, sendMensajeSchema);

    const service = new WhatsAppService(new PrismaWhatsAppRepository());
    const conversacion = await service.findConversacionById(
      dto.conversacionId
    );
    if (!conversacion) {
      return NextResponse.json(
        { error: "Conversación no encontrada" },
        { status: 404 }
      );
    }

    const ultimoMensajeEntrante = conversacion.ultimoMensajeEntrante;
    const isWindowOpen =
      ultimoMensajeEntrante != null &&
      Date.now() - new Date(ultimoMensajeEntrante).getTime() < WINDOW_MS;

    const recipient = whatsappGuard.resolveRecipient(dto.to);

    const canReceive = await whatsappGuard.canReceive(dto.to);
    if (!canReceive) {
      return NextResponse.json(
        { error: "El cliente no acepta notificaciones" },
        { status: 400 }
      );
    }

    if (dto.type === "text") {
      if (!isWindowOpen) {
        return NextResponse.json(
          { error: "Ventana cerrada" },
          { status: 400 }
        );
      }

      const { waMessageId } = await metaClient.sendText(recipient, dto.body);

      await service.saveMessage({
        conversacionId: dto.conversacionId,
        from: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
        to: recipient,
        body: dto.body,
        tipo: "outbound",
        waMessageId,
        status: "sent",
        sentByAi: false,
      });

      await service.updateConversacion(dto.conversacionId, {
        ultimoMensaje: new Date(),
      });

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // template
    if (isWindowOpen) {
      return NextResponse.json(
        { error: "La conversación está activa; no corresponde template" },
        { status: 400 }
      );
    }

    const components = dto.templateParams ?? [];
    const languageCode = dto.languageCode === "es" ? "es_AR" : dto.languageCode;
    const { waMessageId } = await metaClient.sendTemplate(
      recipient,
      dto.templateName,
      languageCode,
      components as object[]
    );

    const bodyComponent = Array.isArray(components)
      ? (components as any[]).find((c) => c?.type === "body")
      : undefined;
    const textParams =
      bodyComponent?.parameters
        ?.filter((p: any) => p?.type === "text")
        ?.map((p: any) => p?.text) ?? [];
    const messageBody = textParams[2] ?? "";

    await service.saveMessage({
      conversacionId: dto.conversacionId,
      from: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
      to: recipient,
      body: messageBody,
      tipo: "outbound",
      waMessageId,
      status: "sent",
      templateName: dto.templateName,
      sentByAi: false,
    });

    await service.updateConversacion(dto.conversacionId, {
      ultimoMensaje: new Date(),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

