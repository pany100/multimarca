import type {
  CreateMensajeInput,
  WhatsAppRepository,
} from "@/core/domain/repositories/whatsapp.repository";

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
    data: { ultimoMensaje?: Date; ultimoMensajeEntrante?: Date; estado?: string }
  ) {
    return this.repo.updateConversacion(id, data);
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

  isWithin24hWindow(ultimoMensajeEntrante: Date | null | undefined): boolean {
    return (
      ultimoMensajeEntrante != null &&
      Date.now() - ultimoMensajeEntrante.getTime() < 24 * 60 * 60 * 1000
    );
  }
}

