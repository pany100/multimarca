import { WhatsAppService } from "@/core/application/services/whatsapp.service";

export class GetConversacionesUseCase {
  constructor(private readonly service: WhatsAppService) {}

  async execute(input: { clienteId: number }) {
    const { clienteId } = input;
    if (clienteId <= 0) throw new Error("clienteId inválido");
    return this.service.listConversacionesByCliente(clienteId);
  }
}

