import { prisma } from "@/core/infrastructure/database/prisma";
import { getIO } from "@/lib/socketio";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { clienteId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const clienteId = parseInt(params.clienteId, 10);
    if (Number.isNaN(clienteId) || clienteId <= 0) {
      return NextResponse.json({ error: "clienteId inválido" }, { status: 400 });
    }

    await prisma.mensajeWhatsApp.updateMany({
      where: {
        read: false,
        tipo: "inbound",
        conversacion: {
          clienteId,
        },
      },
      data: { read: true },
    });

    getIO()?.emit("newWhatsAppMessage", { clienteId });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

