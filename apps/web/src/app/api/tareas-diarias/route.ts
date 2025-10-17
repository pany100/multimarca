import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";
import { CreateTareaUseCase } from "@/core/application/use-cases/tarea-diaria/create-tarea.use-case";
import { ListTareasUseCase } from "@/core/application/use-cases/tarea-diaria/list-tareas.use-case";
import { PrismaTareaDiariaRepository } from "@/core/infrastructure/database/repositories/prisma-tarea-diaria.repository";
import { SocketNotifier } from "@/core/infrastructure/external/socket-notifier";
import {
  createTareaSchema,
  listTareasQuerySchema,
} from "@/core/infrastructure/validation/schemas/tarea-diaria.schema";
import { getIO } from "@/lib/socketio";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

function buildService() {
  return new TareaDiariaService(new PrismaTareaDiariaRepository());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        from: searchParams.get("from"),
        to: searchParams.get("to"),
        search: searchParams.get("search") || undefined,
        nombre: searchParams.get("nombre") || undefined,
      },
      listTareasQuerySchema
    );

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await new ListTareasUseCase(buildService()).execute({
      from: dto.from,
      to: dto.to,
      search: dto.search,
      nombre: dto.nombre,
      user,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { descripcion } = body;

    const user = await getCurrentUser(request);

    const dto = await validateRequest(
      {
        descripcion,
        userId: Number(user?.id),
      },
      createTareaSchema
    );

    const created = await new CreateTareaUseCase(
      buildService(),
      new SocketNotifier()
    ).execute({
      ...dto,
    });

    const io = getIO();
    if (io) io.emit("newTarea");

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
