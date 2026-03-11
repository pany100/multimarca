import { UpdateAllPreciosManoDeObraUseCase } from "@/core/application/use-cases/mano-de-obra/update-all-precios-mano-de-obra.use-case";
import { PrismaManoDeObraRepository } from "@/core/infrastructure/database/repositories/prisma-mano-de-obra.repository";
import { updateAllManoDeObraSchema } from "@/core/infrastructure/validation/schemas/mano-de-obra.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

const repository = new PrismaManoDeObraRepository();

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get("type") ?? "aumento") as "aumento" | "descuento";
    if (type !== "aumento" && type !== "descuento") {
      return NextResponse.json(
        { error: "type debe ser 'aumento' o 'descuento'" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { porcentaje } = await validateRequest(
      body,
      updateAllManoDeObraSchema
    );
    const trabajosActualizados =
      await new UpdateAllPreciosManoDeObraUseCase(repository).execute(
        type,
        porcentaje
      );
    return NextResponse.json({
      mensaje: "Precios de mano de obra actualizados con éxito",
      trabajosActualizados,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
