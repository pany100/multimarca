import { AgendaService } from "@/core/application/services/agenda.service";
import { CreateAgendaUseCase } from "@/core/application/use-cases/agenda/create-agenda.use-case";
import { ListAgendaUseCase } from "@/core/application/use-cases/agenda/list-agenda.use-case";
import { PrismaAgendaRepository } from "@/core/infrastructure/database/repositories/prisma-agenda.repository";
import {
  createAgendaSchema,
  listAgendaSchema,
} from "@/core/infrastructure/validation/schemas/agenda.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";
import { getCurrentUser } from "src/utils/authFetch";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user = await getCurrentUser(request);
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const useCase = new ListAgendaUseCase(
      new AgendaService(new PrismaAgendaRepository())
    );

    const dto = await validateRequest(
      {
        page: searchParams.get("page"),
        size: searchParams.get("size"),
        query: searchParams.get("query"),
        month: searchParams.get("month"),
        year: searchParams.get("year"),
        onlyPending: searchParams.get("onlyPending") === "true",
        general: searchParams.get("general") === "true",
        userId: user.id,
      },
      listAgendaSchema
    );

    const result = await useCase.execute({
      page: dto.page,
      size: dto.size,
      query: dto.query,
      month: dto.month,
      year: dto.year,
      onlyPending: dto.onlyPending,
      general: dto.general,
      userId: dto.userId,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const user = await getCurrentUser(request);
    if (!user)
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await request.json();
    const dto = await validateRequest(body, createAgendaSchema);

    const useCase = new CreateAgendaUseCase(
      new AgendaService(new PrismaAgendaRepository())
    );

    const created = await useCase.execute({
      ...dto,
      userId: user.id,
      general: searchParams.get("general") === "true",
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
