export type CreateMensajeInput = {
  conversacionId: number;
  from: string;
  to: string;
  body: string;
  tipo: string;
  waMessageId?: string;
  mediaId?: string;
  requiresHuman?: boolean;
  status?: string;
  templateName?: string;
  sentByAi?: boolean;
};

export interface WhatsAppRepository {
  findClienteByPhone(phone: string): Promise<any | null>;
  findOrCreateConversacion(clienteId: number): Promise<any>;
  saveMessage(data: CreateMensajeInput): Promise<any>;
  updateMessage(
    id: number,
    data: Partial<Pick<CreateMensajeInput, "requiresHuman" | "status" | "sentByAi">>
  ): Promise<void>;
  updateConversacion(
    id: number,
    data: { ultimoMensaje?: Date; ultimoMensajeEntrante?: Date; estado?: string }
  ): Promise<void>;
  listConversacionesByCliente(clienteId: number): Promise<any[]>;
  listAllConversaciones(): Promise<any[]>;
  findConversacionById(id: number): Promise<any | null>;
  listPendingConversaciones(): Promise<any[]>;
}

