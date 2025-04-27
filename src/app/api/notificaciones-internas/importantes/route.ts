import { PrismaClient, TipoNotificacionInterna } from "@prisma/client";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { NextResponse } from "next/server";
import { getCurrentUser } from "src/utils/authFetch";

// Configurar dayjs para usar timezone
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Get start and end of today in Argentina's timezone
    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const startOfDay = today.startOf("day").toDate();
    const endOfDay = today.endOf("day").toDate();

    const notificaciones = await prisma.notificacionInterna.findMany({
      where: {
        AND: [
          {
            leida: false,
            fecha: {
              gte: startOfDay,
              lte: endOfDay,
            },
            tipo: {
              in: [
                TipoNotificacionInterna.TURNOS_DEL_DIA,
                TipoNotificacionInterna.CHEQUE_POR_VENCER,
                TipoNotificacionInterna.RECORDATORIOS_MANO_DE_OBRA,
              ],
            },
          },
          {
            OR: [{ userId: null }, { userId: user.id }],
          },
        ],
      },
      orderBy: {
        fecha: "desc",
      },
    });

    return NextResponse.json(notificaciones);
  } catch (error) {
    console.error("Error al obtener notificaciones importantes:", error);
    return NextResponse.json(
      { error: "Error al obtener notificaciones importantes" },
      { status: 500 }
    );
  }
}
