import { AgendaService } from "@/core/application/services/agenda.service";
import { DeleteAgendaUseCase } from "@/core/application/use-cases/agenda/delete-agenda.use-case";
import { GetAgendaUseCase } from "@/core/application/use-cases/agenda/get-agenda.use-case";
import { UpdateAgendaUseCase } from "@/core/application/use-cases/agenda/update-agenda.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaAgendaRepository } from "@/core/infrastructure/database/repositories/prisma-agenda.repository";
import {
  deleteAgendaSchema,
  updateAgendaSchema,
} from "@/core/infrastructure/validation/schemas/agenda.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { parseIdParam } from "@/shared/utils/params";
import { getCurrentUser } from "@/utils/authFetch";
import { NextResponse } from "next/server";

function buildService() {
  return new AgendaService(
    new PrismaAgendaRepository(),
    new PrismaUnitOfWork()
  );
}

export async function GET(
  _req: Request,
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const id = parseIdParam(params.id);
    const data = await new GetAgendaUseCase(buildService()).execute(id, user);
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const id = parseIdParam(params.id);
    const { searchParams } = new URL(request.url);

    const body = await request.json();
    const dto = await validateRequest(
      {
        ...body,
        typeOfUpdate: searchParams.get("typeOfUpdate"),
      },
      updateAgendaSchema
    );

    // si querés exigir título en update, dejalo en schema .min(1) sin .optional()
    const data = await new UpdateAgendaUseCase(buildService()).execute(
      id,
      dto,
      user,
      dto.typeOfUpdate
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(_req);
    const { searchParams } = new URL(_req.url);

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const id = parseIdParam(params.id);
    const dto = await validateRequest(
      {
        id,
        typeOfDelete: searchParams.get("typeOfDelete"),
      },
      deleteAgendaSchema
    );

    await new DeleteAgendaUseCase(buildService()).execute(
      id,
      user,
      dto.typeOfDelete
    );
    return NextResponse.json(
      { message: "Recordatorio eliminado correctamente" },
      { status: 200 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
