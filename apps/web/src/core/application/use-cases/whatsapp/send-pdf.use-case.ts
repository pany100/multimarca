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

  private resolveTemplateConfig(
    resourceType: SendPdfInput["resourceType"],
    resourceData: any,
  ): { templateName: string; components: object[] } {
    if (resourceType === "orden") {
      const patente = resourceData.auto?.patent ?? "N/A";
      return {
        templateName: "reparacion_terminada_pdf",
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  id: "MEDIA_ID_PLACEHOLDER",
                  filename: "orden.pdf",
                },
              },
            ],
          },
          { type: "body", parameters: [{ type: "text", text: patente }] },
        ],
      };
    }

    if (resourceType === "presupuesto") {
      const vehiculo =
        resourceData.auto?.patent ?? resourceData.informacionAuto ?? "N/A";
      return {
        templateName: "presupuesto_entregado",
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "document",
                document: {
                  id: "MEDIA_ID_PLACEHOLDER",
                  filename: "presupuesto.pdf",
                },
              },
            ],
          },
          { type: "body", parameters: [{ type: "text", text: vehiculo }] },
        ],
      };
    }

    return {
      templateName: "venta_realizada",
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                id: "MEDIA_ID_PLACEHOLDER",
                filename: "venta.pdf",
              },
            },
          ],
        },
      ],
    };
  }

  private resolveTemplateBody(resourceType: string, resourceData: any): string {
    if (resourceType === "orden") {
      const patente = resourceData.auto?.patent ?? "N/A";
      return `La reparación del auto ${patente} ya está lista. Adjunto encontrarás tu órden para descargar.`;
    }
    if (resourceType === "presupuesto") {
      const vehiculo =
        resourceData.auto?.patent ?? resourceData.informacionAuto ?? "N/A";
      return `El presupuesto para el vehículo ${vehiculo} ya está listo. Adjunto encontrarás el informe para descargar.`;
    }
    if (resourceType === "venta") {
      return "Adjuntamos los detalles de la venta realizada.";
    }
    return "";
  }

  async execute(input: SendPdfInput) {
    // 1. Resolver clienteId y resourceData
    let clienteId: number | null = null;
    let resourceData: any = null;

    if (input.resourceType === "orden") {
      const recurso = await prisma.ordenReparacion.findUnique({
        where: { id: input.resourceId },
        include: { auto: { include: { owner: true } } },
      });
      if (!recurso) throw new Error("Orden no encontrada");
      clienteId = recurso.auto.ownerId;
      resourceData = recurso;
    }

    if (input.resourceType === "venta") {
      const recurso = await prisma.venta.findUnique({
        where: { id: input.resourceId },
        include: { cliente: true },
      });
      if (!recurso) throw new Error("Venta no encontrada");
      if (!recurso.clienteId)
        throw new Error("La venta no tiene cliente asociado");
      clienteId = recurso.clienteId;
      resourceData = recurso;
    }

    if (input.resourceType === "presupuesto") {
      const recurso = await prisma.presupuesto.findUnique({
        where: { id: input.resourceId },
        include: { auto: { include: { owner: true } } },
      });
      if (!recurso) throw new Error("Presupuesto no encontrado");
      clienteId = recurso.auto?.ownerId ?? null;
      if (!clienteId)
        throw new Error("El presupuesto no tiene cliente asociado");
      resourceData = recurso;
    }

    if (clienteId == null) throw new Error("Recurso no encontrado");

    // 2. Validar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!cliente?.phone)
      throw new Error("El cliente no tiene teléfono registrado");
    if (!cliente.can_receive_notifications)
      throw new Error("El cliente no acepta notificaciones");

    // 3. Generar PDF + upload media
    const buffer = await generatePdfBuffer(
      input.resourceType,
      input.resourceId,
    );
    const filename = `${input.resourceType}_${input.resourceId}.pdf`;
    const mediaId = await metaClient.uploadMedia(
      buffer,
      "application/pdf",
      filename,
    );

    // 4. Template config + inject mediaId
    const { templateName, components } = this.resolveTemplateConfig(
      input.resourceType,
      resourceData,
    );
    const finalComponents = JSON.parse(
      JSON.stringify(components).replace(/MEDIA_ID_PLACEHOLDER/g, mediaId),
    );

    // 5. Enviar template con documento adjunto
    const recipient = whatsappGuard.resolveRecipient(cliente.phone);
    const { waMessageId } = await metaClient.sendTemplate(
      recipient,
      templateName,
      "es_AR",
      finalComponents,
    );

    // 6. Persistir mensaje y actualizar conversación
    const conversacion = await this.service.findOrCreateConversacion(clienteId);
    await this.service.saveMessage({
      conversacionId: conversacion.id,
      from: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
      to: cliente.phone,
      body: this.resolveTemplateBody(input.resourceType, resourceData),
      tipo: "outbound",
      waMessageId,
      status: "sent",
      templateName,
      mediaId,
    });
    await this.service.updateConversacion(conversacion.id, {
      ultimoMensaje: new Date(),
    });

    return { ok: true };
  }
}
