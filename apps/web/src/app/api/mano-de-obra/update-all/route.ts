import { UpdateAllPreciosManoDeObraUseCase } from "@/core/application/use-cases/mano-de-obra/update-all-precios-mano-de-obra.use-case";
import { PrismaManoDeObraRepository } from "@/core/infrastructure/database/repositories/prisma-mano-de-obra.repository";
import { updateAllManoDeObraSchema } from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaManoDeObraRepository();

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { porcentajeAumento } = await validateRequest(
      body,
      updateAllManoDeObraSchema
    );
    const trabajosActualizados =
      await new UpdateAllPreciosManoDeObraUseCase(repository).execute(
        porcentajeAumento
      );
    return NextResponse.json({
      mensaje: "Precios de mano de obra actualizados con éxito",
      trabajosActualizados,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
