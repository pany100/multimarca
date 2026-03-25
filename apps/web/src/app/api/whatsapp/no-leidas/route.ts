import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const cantidadNoLeidas = await prisma.mensajeWhatsApp.count({
      where: {
        read: false,
        tipo: "inbound",
      },
    });

    return NextResponse.json({ cantidadNoLeidas }, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

