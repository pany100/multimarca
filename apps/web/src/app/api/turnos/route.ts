import { TurnoService } from "@/core/application/services/turno.service";
import { CreateTurnoUseCase } from "@/core/application/use-cases/turno/create-turno.use-case";
import { ListTurnosUseCase } from "@/core/application/use-cases/turno/list-turnos.use-case";
import { PrismaFeriadoRepository } from "@/core/infrastructure/database/repositories/prisma-feriado.repository";
import { PrismaTurnoRepository } from "@/core/infrastructure/database/repositories/prisma-turno.repository";
import {
  createTurnoSchema,
  CreateTurnoDto,
  listTurnosQuerySchema,
  ListTurnosQueryDto,
} from "@/core/infrastructure/validation/schemas/turno.schema";
import { normalizeTurnoFechaInputToUtc } from "@/lib/turno-fecha-tz";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";

export const dynamic = "force-dynamic";

function toCreateData(dto: CreateTurnoDto) {
  return {
    hora: dto.hora,
    fecha: normalizeTurnoFechaInputToUtc(dto.fecha),
    problema: dto.problema,
    autoId: dto.autoId ?? null,
    informacionAuto: dto.informacionAuto ?? null,
    informacionPatente: dto.informacionPatente ?? null,
    presupuestoId: dto.presupuestoId ?? null,
    clienteNombre: dto.clienteNombre ?? null,
    clienteTelefono: dto.clienteTelefono ?? null,
    vino: dto.vino ?? null,
    observaciones: dto.observaciones ?? null,
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = {
      page: searchParams.get("page") ?? "0",
      size: searchParams.get("size") ?? "10",
      query: searchParams.get("query") ?? "",
      fecha: searchParams.get("fecha") ?? undefined,
      future: searchParams.get("future") ?? undefined,
    };
    const dto = await validateRequest(
      raw as unknown,
      listTurnosQuerySchema as ZodSchema<ListTurnosQueryDto>
    );

    const turnoRepo = new PrismaTurnoRepository();
    const feriadoRepo = new PrismaFeriadoRepository();
    const turnoService = new TurnoService(turnoRepo, feriadoRepo);
    const result = await new ListTurnosUseCase(turnoService).execute({
      page: dto.page,
      size: dto.size,
      query: dto.query,
      fecha: dto.fecha,
      future: dto.future,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const dto = await validateRequest(body, createTurnoSchema);

    const turnoRepo = new PrismaTurnoRepository();
    const feriadoRepo = new PrismaFeriadoRepository();
    const turnoService = new TurnoService(turnoRepo, feriadoRepo);
    const nuevoTurno = await new CreateTurnoUseCase(turnoService).execute(
      toCreateData(dto)
    );

    return NextResponse.json(nuevoTurno, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
