import { WhatsAppService } from "@/core/application/services/whatsapp.service";

export class GetAllConversacionesUseCase {
  constructor(private readonly service: WhatsAppService) {}

  execute() {
    return this.service.listAllConversaciones();
  }
}

