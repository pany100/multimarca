import { TurnoService } from "@/core/application/services/turno.service";
import { DeleteTurnoUseCase } from "@/core/application/use-cases/turno/delete-turno.use-case";
import { PatchTurnoVinoUseCase } from "@/core/application/use-cases/turno/patch-turno-vino.use-case";
import { UpdateTurnoUseCase } from "@/core/application/use-cases/turno/update-turno.use-case";
import { PrismaFeriadoRepository } from "@/core/infrastructure/database/repositories/prisma-feriado.repository";
import { PrismaTurnoRepository } from "@/core/infrastructure/database/repositories/prisma-turno.repository";
import {
  patchTurnoVinoSchema,
  turnoIdParamSchema,
  updateTurnoSchema,
  UpdateTurnoDto,
} from "@/core/infrastructure/validation/schemas/turno.schema";
import { normalizeTurnoFechaInputToUtc } from "@/lib/turno-fecha-tz";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function toUpdateData(dto: UpdateTurnoDto) {
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

/**
 * PATCH: actualiza solo el campo vino (boolean) del turno.
 * Body: { vino: true | false }
 */
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const idDto = await validateRequest({ id: params.id }, turnoIdParamSchema);
    const body = (await request.json()) as unknown;
    const dto = await validateRequest(body, patchTurnoVinoSchema);

    const turnoRepo = new PrismaTurnoRepository();
    const feriadoRepo = new PrismaFeriadoRepository();
    const turnoService = new TurnoService(turnoRepo, feriadoRepo);
    const result = await new PatchTurnoVinoUseCase(turnoService).execute({
      id: idDto.id,
      vino: dto.vino,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const idDto = await validateRequest({ id: params.id }, turnoIdParamSchema);
    const body = (await request.json()) as unknown;
    const dto = await validateRequest(body, updateTurnoSchema);

    const turnoRepo = new PrismaTurnoRepository();
    const feriadoRepo = new PrismaFeriadoRepository();
    const turnoService = new TurnoService(turnoRepo, feriadoRepo);
    const result = await new UpdateTurnoUseCase(turnoService).execute({
      id: idDto.id,
      data: toUpdateData(dto),
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const idDto = await validateRequest({ id: params.id }, turnoIdParamSchema);

    const turnoRepo = new PrismaTurnoRepository();
    const feriadoRepo = new PrismaFeriadoRepository();
    const turnoService = new TurnoService(turnoRepo, feriadoRepo);
    await new DeleteTurnoUseCase(turnoService).execute({ id: idDto.id });

    return NextResponse.json({ message: "Turno eliminado con éxito" });
  } catch (error) {
    return handleApiError(error);
  }
}
