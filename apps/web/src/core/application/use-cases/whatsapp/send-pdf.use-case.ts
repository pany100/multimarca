import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { prisma } from "@/core/infrastructure/database/prisma";
import { metaClient } from "@/core/infrastructure/external/whatsapp/meta.client";
import { generatePdfBuffer } from "@/core/infrastructure/external/whatsapp/pdf-generator";
import { whatsappGuard } from "@/core/infrastructure/external/whatsapp/whatsapp.guard";

export type SendPdfInput = {
  resourceType: "orden" | "venta" | "presupuesto";
  resourceId: number;
};

export class SendPdfUseCase {
  constructor(private readonly service: WhatsAppService) {}

  async execute(input: SendPdfInput) {
    const id = input.resourceId;

    // 1. Resolver clienteId
    let clienteId: number | null = null;

    if (input.resourceType === "orden") {
      const orden = await prisma.ordenReparacion.findUnique({
        where: { id },
        include: { auto: true },
      });
      clienteId = orden?.auto?.ownerId ?? null;
    }

    if (input.resourceType === "venta") {
      const venta = await prisma.venta.findUnique({ where: { id } });
      if (venta?.clienteId == null) throw new Error("Recurso no encontrado");
      clienteId = venta.clienteId;
    }

    if (input.resourceType === "presupuesto") {
      const presupuesto = await prisma.presupuesto.findUnique({
        where: { id },
        include: { auto: true },
      });
      clienteId = presupuesto?.auto?.ownerId ?? null;
    }

    if (clienteId == null) throw new Error("Recurso no encontrado");

    // 2. Validar cliente
    const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente?.phone)
      throw new Error("El cliente no tiene teléfono registrado");
    if (!cliente.can_receive_notifications)
      throw new Error("El cliente no acepta notificaciones");

    // 3. Generar PDF
    const buffer = await generatePdfBuffer(input.resourceType, input.resourceId);

    // 4. Upload media
    const filename = `${input.resourceType}_${input.resourceId}.pdf`;
    const mediaId = await metaClient.uploadMedia(
      buffer,
      "application/pdf",
      filename
    );

    // 5. Enviar documento
    const recipient = whatsappGuard.resolveRecipient(cliente.phone);
    const { waMessageId } = await metaClient.sendDocument(
      recipient,
      mediaId,
      filename
    );

    // 6. Persistir mensaje y actualizar conversación
    const conversacion = await this.service.findOrCreateConversacion(clienteId);
    await this.service.saveMessage({
      conversacionId: conversacion.id,
      from: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
      to: cliente.phone,
      body: filename,
      tipo: "outbound",
      waMessageId,
      status: "sent",
    });
    await this.service.updateConversacion(conversacion.id, {
      ultimoMensaje: new Date(),
    });

    // 7. OK
    return { ok: true };
  }
}

