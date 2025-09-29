import { GetDeudoresUseCase } from "@/core/application/use-cases/deudores/get-deudores.use-case";
import { DeudoresQueriesService } from "@/core/infrastructure/database/queries/deudores-queries.service";
import { listDeudoresQuerySchema } from "@/core/infrastructure/validation/schemas/cliente.schema";
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
      listDeudoresQuerySchema
    );
    const result = await new GetDeudoresUseCase(
      new DeudoresQueriesService()
    ).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
