import { ExportAllManoDeObraUseCase } from "@/core/application/use-cases/mano-de-obra/export-all-mano-de-obra.use-case";
import { PrismaManoDeObraRepository } from "@/core/infrastructure/database/repositories/prisma-mano-de-obra.repository";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const repository = new PrismaManoDeObraRepository();

export async function GET() {
  try {
    const result = await new ExportAllManoDeObraUseCase(repository).execute();
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
