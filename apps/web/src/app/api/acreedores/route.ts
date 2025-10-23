import { GetAcreedoresUseCase } from "@/core/application/use-cases/acreedores/get-acreedores.use-case";
import { AcreedoresQueriesService } from "@/core/infrastructure/database/queries/acreedores-queries.service";
import { listAcreedoresQuerySchema } from "@/core/infrastructure/validation/schemas/cliente.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: searchParams.get("page"),
        size: searchParams.get("size"),
        query: searchParams.get("query"),
        from: searchParams.get("from")
          ? new Date(searchParams.get("from") as string)
          : undefined,
        to: searchParams.get("to")
          ? new Date(searchParams.get("to") as string)
          : undefined,
      },
      listAcreedoresQuerySchema
    );
    const result = await new GetAcreedoresUseCase(
      new AcreedoresQueriesService()
    ).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
