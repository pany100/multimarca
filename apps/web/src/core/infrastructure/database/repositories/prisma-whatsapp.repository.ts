import type {
  CreateMensajeInput,
  WhatsAppRepository,
} from "@/core/domain/repositories/whatsapp.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaWhatsAppRepository implements WhatsAppRepository {
  findClienteByPhone(phone: string) {
    return prisma.cliente.findFirst({ where: { phone }, include: { cars: true } });
  }

  async findOrCreateConversacion(clienteId: number) {
    const conversacion = await prisma.conversacionWhatsApp.findFirst({
      where: { clienteId, estado: "Activa" },
      orderBy: { ultimoMensaje: "desc" },
      take: 1,
    });

    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

    if (conversacion) {
      if (Date.now() - conversacion.ultimoMensaje.getTime() > SEVEN_DAYS) {
        await prisma.conversacionWhatsApp.update({
          where: { id: conversacion.id },
          data: { estado: "Cerrada" },
        });
        return prisma.conversacionWhatsApp.create({
          data: { clienteId, estado: "Activa" },
        });
      }
      return conversacion;
    }

    return prisma.conversacionWhatsApp.create({
      data: { clienteId, estado: "Activa" },
    });
  }

  saveMessage(data: CreateMensajeInput) {
    return prisma.mensajeWhatsApp.create({ data });
  }

  async updateMessage(
    id: number,
    data: Partial<Pick<CreateMensajeInput, "requiresHuman" | "status" | "sentByAi">>
  ) {
    await prisma.mensajeWhatsApp.update({ where: { id }, data });
  }

  async updateConversacion(
    id: number,
    data: { ultimoMensaje?: Date; ultimoMensajeEntrante?: Date; estado?: string }
  ) {
    await prisma.conversacionWhatsApp.update({ where: { id }, data });
  }

  listConversacionesByCliente(clienteId: number) {
    return prisma.conversacionWhatsApp.findMany({
      where: { clienteId },
      orderBy: { iniciada: "asc" },
      include: { mensajes: { orderBy: { timestamp: "asc" }, take: 100 } },
    });
  }

  listAllConversaciones() {
    return prisma.conversacionWhatsApp.findMany({
      orderBy: { ultimoMensaje: "desc" },
      include: {
        cliente: { select: { id: true, fullName: true, phone: true } },
        mensajes: { orderBy: { timestamp: "asc" }, take: 100 },
      },
    });
  }

  findConversacionById(id: number) {
    return prisma.conversacionWhatsApp.findUnique({
      where: { id },
      include: { mensajes: { orderBy: { timestamp: "asc" } } },
    });
  }

  listPendingConversaciones() {
    return prisma.conversacionWhatsApp.findMany({
      where: { mensajes: { some: { requiresHuman: true, read: false } } },
      include: {
        cliente: { select: { id: true, fullName: true, phone: true } },
        mensajes: {
          where: { requiresHuman: true, read: false },
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
      orderBy: { ultimoMensaje: "desc" },
    });
  }
}

