import { TareaDiariaService } from "@/core/application/services/tarea-diaria.service";
import { DeleteTareaUseCase } from "@/core/application/use-cases/tarea-diaria/delete-tarea.use-case";
import { UpdateTareaUseCase } from "@/core/application/use-cases/tarea-diaria/update-tarea.use-case";
import { PrismaTareaDiariaRepository } from "@/core/infrastructure/database/repositories/prisma-tarea-diaria.repository";
import { SocketNotifier } from "@/core/infrastructure/external/socket-notifier";
import { updateTareaSchema } from "@/core/infrastructure/validation/schemas/tarea-diaria.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

function buildService() {
  return new TareaDiariaService(new PrismaTareaDiariaRepository());
}

function parseIdParam(raw: string) {
  const id = Number(raw);
  if (!Number.isFinite(id) || id < 1) throw new Error("ID inválido");
  return id;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseIdParam(params.id);
    const body = await request.json();
    const dto = await validateRequest(body, updateTareaSchema);

    const user = await getCurrentUser(request);
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const useCase = new UpdateTareaUseCase(
      buildService(),
      new SocketNotifier()
    );
    const updated = await useCase.execute({
      id,
      user: { id: Number(user.id), rol: user.rol },
      data: dto,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseIdParam(params.id);

    const user = await getCurrentUser(request);
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const useCase = new DeleteTareaUseCase(
      buildService(),
      new SocketNotifier()
    );
    const result = await useCase.execute({
      id,
      user: { id: Number(user.id), rol: user.rol },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
