import { NotificationService } from "@/core/application/services/notification.service";
import { MarkAllNotificationsAsReadUseCase } from "@/core/application/use-cases/notificacion/mark-all-notifications-read.use-case";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import { markAllNotificationsReadSchema } from "@/core/infrastructure/validation/schemas/notificacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";
import { getCurrentUser } from "src/utils/authFetch";

export const dynamic = "force-dynamic";

/**
 * Marca como leídas todas las notificaciones del usuario autenticado.
 * Solo afecta las notificaciones que tienen userId igual al del usuario.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const dto = await validateRequest(
      { userId: user.id },
      markAllNotificationsReadSchema
    );

    const repository = new PrismaNotificationRepository();
    const notificationService = new NotificationService(repository);
    const result = await new MarkAllNotificationsAsReadUseCase(
      notificationService
    ).execute(dto);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
