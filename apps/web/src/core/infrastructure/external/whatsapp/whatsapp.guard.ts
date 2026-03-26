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
    // En modo test solo permitir el número de prueba
    if (process.env.WHATSAPP_TEST_MODE === "true") {
      const testPhone = process.env.WHATSAPP_TEST_PHONE ?? "";
      try {
        return normalizeArgentinePhone(phone) === testPhone;
      } catch {
        return false;
      }
    }

    // Normalizar el número entrante para comparar
    let normalizedIncoming: string;
    try {
      normalizedIncoming = normalizeArgentinePhone(phone);
    } catch {
      return false;
    }

    // Traer todos los clientes que tengan algún teléfono cargado
    // y normalizar cada uno para comparar
    // No se puede hacer en una sola query SQL porque la normalización
    // es lógica de aplicación, no de base de datos.
    // Para evitar traer toda la tabla, buscar primero por match exacto
    // y luego por las variantes más comunes del número.

    // Construir variantes del número para buscar en la base
    // El número en la base puede estar en cualquier formato
    const variants = buildPhoneVariants(normalizedIncoming);

    const cliente = await prisma.cliente.findFirst({
      where: { phone: { in: variants } },
    });

    if (!cliente) return false;
    return cliente.can_receive_notifications;
  },
};

// Dado un número normalizado (549XXXXXXXXXX), genera todas las variantes
// posibles que podrían estar guardadas en la base de datos
function buildPhoneVariants(normalized: string): string[] {
  const variants = new Set<string>();

  // El número normalizado mismo
  variants.add(normalized);

  // Con + adelante
  variants.add("+" + normalized);

  // Si empieza con 549 (móvil argentino)
  if (normalized.startsWith("549")) {
    const sinPais = normalized.slice(2); // 9XXXXXXXXXX
    const sinPaisNi9 = normalized.slice(3); // XXXXXXXXXX (10 dígitos)
    variants.add(sinPais);
    variants.add(sinPaisNi9);
    variants.add("0" + sinPaisNi9); // 0XXXXXXXXXX
    variants.add("+" + normalized);
  }

  // Si empieza con 54 sin el 9 (fijo argentino)
  if (normalized.startsWith("54") && !normalized.startsWith("549")) {
    const sinPais = normalized.slice(2); // XXXXXXXXXX
    variants.add(sinPais);
    variants.add("0" + sinPais);
    variants.add("+" + normalized);
  }

  return Array.from(variants);
}

