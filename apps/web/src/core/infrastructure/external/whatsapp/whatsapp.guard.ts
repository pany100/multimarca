import { prisma } from "@/core/infrastructure/database/prisma";
import { normalizeArgentinePhone } from "./phone.normalizer";

export const whatsappGuard = {
  resolveRecipient(phone: string): string {
    const normalized = normalizeArgentinePhone(phone);
    if (process.env.WHATSAPP_TEST_MODE === "true") {
      return process.env.WHATSAPP_TEST_PHONE ?? normalized;
    }
    return normalized;
  },

  async canReceive(phone: string): Promise<boolean> {
    if (process.env.WHATSAPP_TEST_MODE === "true") {
      const testPhone = process.env.WHATSAPP_TEST_PHONE ?? "";
      return normalizeArgentinePhone(phone) === testPhone;
    }

    const cliente = await prisma.cliente.findFirst({ where: { phone } });
    if (!cliente) return false;
    return cliente.can_receive_notifications;
  },
};

