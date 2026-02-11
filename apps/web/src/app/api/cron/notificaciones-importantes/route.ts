import { procesarNotificacionesImportantes } from "@/cron/notificacionesImportantes";
import { getCurrentUser } from "src/utils/authFetch";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST: Ejecuta el cron de notificaciones importantes (turnos del día,
 * recordatorios mantenimiento, eventos agenda) en segundo plano.
 * Responde al instante; el cron no corta la ejecución de la app.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Disparar en segundo plano sin await: la app sigue respondiendo
    procesarNotificacionesImportantes().catch((err) => {
      console.error("[Cron API] Error en notificaciones importantes:", err);
    });

    return NextResponse.json(
      { message: "Cron de notificaciones importantes ejecutándose en segundo plano" },
      { status: 202 }
    );
  } catch (error) {
    console.error("Error al disparar cron:", error);
    return NextResponse.json(
      { error: "Error al ejecutar el cron" },
      { status: 500 }
    );
  }
}
