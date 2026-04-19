import {
  addDays,
  getComposicionFacturacion,
  getDefaultDateRange,
} from "@/core/infrastructure/database/queries/financiero.query-service";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const defaults = getDefaultDateRange();
    const from = fromParam || defaults.from;
    const to = toParam ? addDays(toParam, 1) : defaults.to;

    const composicion = await getComposicionFacturacion(from, to);

    return NextResponse.json(composicion);
  } catch (e) {
    return handleApiError(e);
  }
}
