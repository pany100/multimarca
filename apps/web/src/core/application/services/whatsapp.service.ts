import type {
  CreateMensajeInput,
  WhatsAppRepository,
} from "@/core/domain/repositories/whatsapp.repository";
import type { EstadoConversacion } from "@prisma/client";

export class WhatsAppService {
  constructor(private readonly repo: WhatsAppRepository) {}

  findClienteByPhone(phone: string) {
    return this.repo.findClienteByPhone(phone);
  }

  findOrCreateConversacion(clienteId: number) {
    return this.repo.findOrCreateConversacion(clienteId);
  }

  saveMessage(data: CreateMensajeInput) {
    return this.repo.saveMessage(data);
  }

  updateMessage(
    id: number,
    data: Partial<Pick<CreateMensajeInput, "requiresHuman" | "status" | "sentByAi">>
  ) {
    return this.repo.updateMessage(id, data);
  }

  updateConversacion(
    id: number,
    data: {
      ultimoMensaje?: Date;
      ultimoMensajeEntrante?: Date;
      estado?: EstadoConversacion;
    }
  ) {
    return this.repo.updateConversacion(id, data);
  }

  updateConversacionAi(id: number, data: { aiOwned: boolean; aiTurns: number }) {
    return this.repo.updateConversacionAi(id, data);
  }

  // Retorna true si la IA debe procesar este mensaje
  shouldProcessWithAi(conversacion: { aiOwned: boolean }): boolean {
    // Siempre intentar si la conversación está en manos de la IA
    // El webhook decide si es el primer mensaje o no
    return conversacion.aiOwned;
  }

  // Retorna true si la IA puede hacer otra pregunta de seguimiento
  isUnderTurnLimit(conversacion: { aiTurns: number }): boolean {
    const MAX = parseInt(process.env.AI_MAX_TURNS ?? "3");
    return conversacion.aiTurns < MAX;
  }

  listConversacionesByCliente(clienteId: number) {
    return this.repo.listConversacionesByCliente(clienteId);
  }

  listAllConversaciones() {
    return this.repo.listAllConversaciones();
  }

  findConversacionById(id: number) {
    return this.repo.findConversacionById(id);
  }

  listPendingConversaciones() {
    return this.repo.listPendingConversaciones();
  }

  getConversationHistory(conversacionId: number, limit: number) {
    return this.repo.getConversationHistory(conversacionId, limit);
  }

  isWithin24hWindow(ultimoMensajeEntrante: Date | null | undefined): boolean {
    return (
      ultimoMensajeEntrante != null &&
      Date.now() - ultimoMensajeEntrante.getTime() < 24 * 60 * 60 * 1000
    );
  }
}

