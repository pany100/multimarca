import { NotificationService } from "@/core/application/services/notification.service";
import { ListNotificationsByUserUseCase } from "@/core/application/use-cases/notificacion/list-notifications-by-user.use-case";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
import {
  listNotificationsQuerySchema,
  ListNotificationsQueryDto,
} from "@/core/infrastructure/validation/schemas/notificacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { ZodSchema } from "zod";
import { NextResponse } from "next/server";
import { getCurrentUser } from "src/utils/authFetch";

export const dynamic = "force-dynamic";

/**
 * GET: Lista notificaciones del usuario autenticado (solo las suyas).
 * Query: page, size, leidas ("true" | "false" | sin enviar = todas).
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const raw = {
      page: searchParams.get("page") ?? "0",
      size: searchParams.get("size") ?? "10",
      leidas: searchParams.get("leidas") ?? undefined,
    };
    const dto = await validateRequest(
      raw as unknown,
      listNotificationsQuerySchema as unknown as ZodSchema<ListNotificationsQueryDto>
    );

    const repository = new PrismaNotificationRepository();
    const notificationService = new NotificationService(repository);
    const result = await new ListNotificationsByUserUseCase(
      notificationService
    ).execute({
      userId: user.id,
      page: dto.page,
      size: dto.size,
      leidas: dto.leidas,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
