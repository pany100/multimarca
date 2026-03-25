import { WhatsAppService } from "@/core/application/services/whatsapp.service";

export class GetInboxUseCase {
  constructor(private readonly service: WhatsAppService) {}

  execute() {
    return this.service.listPendingConversaciones();
  }
}

