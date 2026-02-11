import { enviarNotificacionesCheques } from "@/cron/notificacionesCheques";
import { getCurrentUser } from "src/utils/authFetch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST: Ejecuta el cron de notificaciones de cheques por vencer (próximos 3 días) en segundo plano.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    enviarNotificacionesCheques().catch((err) => {
      console.error("[Cron API] Error en notificaciones cheques:", err);
    });

    return NextResponse.json(
      { message: "Cron de notificaciones de cheques ejecutándose en segundo plano" },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error al disparar cron cheques:", error);
    return NextResponse.json(
      { error: "Error al ejecutar el cron" },
      { status: 500 }
    );
  }
}
