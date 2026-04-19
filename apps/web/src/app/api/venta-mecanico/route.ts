import { AddMecanicoToVentaUseCase } from "@/core/application/use-cases/venta/add-mecanico-to-venta.use-case";
import { PrismaVentaRepository } from "@/core/infrastructure/database/repositories/prisma-venta.repository";
import { addMecanicoToVentaSchema } from "@/core/infrastructure/validation/schemas/venta.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, addMecanicoToVentaSchema);

    const useCase = new AddMecanicoToVentaUseCase(
      new PrismaVentaRepository()
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
