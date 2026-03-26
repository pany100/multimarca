import { WhatsAppService } from "@/core/application/services/whatsapp.service";
import { metaClient } from "@/core/infrastructure/external/whatsapp/meta.client";
import { whatsappGuard } from "@/core/infrastructure/external/whatsapp/whatsapp.guard";

export type SendMessageUseCaseInput = {
  conversacionId: number;
  to: string;
  type: "text" | "template";
  body?: string;
  templateName?: string;
  templateParams?: object[];
  languageCode?: string;
  sentByAi?: boolean;
};

export class SendMessageUseCase {
  constructor(private readonly service: WhatsAppService) {}

  async execute(input: SendMessageUseCaseInput): Promise<any> {
    const conversacion = await this.service.findConversacionById(
      input.conversacionId
    );
    if (!conversacion) throw new Error("Conversación no encontrada");

    const canReceive = await whatsappGuard.canReceive(input.to);
    if (!canReceive) {
      throw new Error("El número no está habilitado para recibir mensajes");
    }

    if (input.type === "text") {
      const within = this.service.isWithin24hWindow(
        conversacion.ultimoMensajeEntrante
      );
      if (!within) {
        throw new Error(
          "Ventana de 24h vencida. Solo se pueden enviar templates."
        );
      }
    }

    const recipient = whatsappGuard.resolveRecipient(input.to);

    let waMessageId: string;
    if (input.type === "text") {
      if (!input.body) {
        throw new Error("body es requerido para mensajes de texto");
      }
      const result = await metaClient.sendText(recipient, input.body);
      waMessageId = result.waMessageId;
    } else {
      if (!input.templateName) {
        throw new Error("templateName es requerido para templates");
      }
      const result = await metaClient.sendTemplate(
        recipient,
        input.templateName,
        input.languageCode ?? "es",
        input.templateParams
      );
      waMessageId = result.waMessageId;
    }

    const saved = await this.service.saveMessage({
      conversacionId: input.conversacionId,
      from: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
      to: input.to,
      body: input.body ?? input.templateName ?? "",
      tipo: "outbound",
      waMessageId,
      status: "sent",
      templateName: input.templateName,
      sentByAi: input.sentByAi ?? false,
    });

    await this.service.updateConversacion(input.conversacionId, {
      ultimoMensaje: new Date(),
    });

    return saved;
  }
}

