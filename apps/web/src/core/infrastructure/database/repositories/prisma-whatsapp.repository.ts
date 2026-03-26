import type {
  CreateMensajeInput,
  WhatsAppRepository,
} from "@/core/domain/repositories/whatsapp.repository";
import { prisma } from "@/core/infrastructure/database/prisma";
import type { EstadoConversacion } from "@prisma/client";

export class PrismaWhatsAppRepository implements WhatsAppRepository {
  async findClienteByPhone(phone: string): Promise<any | null> {
    // 1. Match exacto
    const exact = await prisma.cliente.findFirst({
      where: { phone },
      include: { cars: true },
    });
    if (exact) return exact;

    // 2. Generar variantes del número para buscar
    // Meta siempre manda en formato 549XXXXXXXXXX (sin +)
    // La base puede tener el número en distintos formatos
    const variants = new Set<string>();

    // Si viene con prefijo 549 → agregar sin prefijo país y sin 9
    if (phone.startsWith("549")) {
      const sinPrefijo = phone.slice(3); // 1112345678
      variants.add(sinPrefijo);
      variants.add("0" + sinPrefijo); // 01112345678
      variants.add("+" + phone); // +5491112345678
      variants.add(phone.slice(2)); // 91112345678 (raro pero posible)
    }
    // Si viene con prefijo 54 sin el 9
    if (phone.startsWith("54") && !phone.startsWith("549")) {
      const sinPrefijo = phone.slice(2); // 1112345678
      variants.add(sinPrefijo);
      variants.add("0" + sinPrefijo);
      variants.add("+" + phone);
    }

    if (variants.size === 0) return null;

    return prisma.cliente.findFirst({
      where: { phone: { in: Array.from(variants) } },
      include: { cars: true },
    });
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
    data: {
      ultimoMensaje?: Date;
      ultimoMensajeEntrante?: Date;
      estado?: EstadoConversacion;
    }
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

