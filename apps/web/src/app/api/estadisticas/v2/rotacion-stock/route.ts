import {
  computeRotacionKpis,
  getProductosRotacion,
} from "@/core/infrastructure/database/queries/stock-rotacion.query-service";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const productos = await getProductosRotacion({ soloConStock: true });
    const kpis = computeRotacionKpis(productos);
    return NextResponse.json({ kpis, productos });
  } catch (e) {
    return handleApiError(e);
  }
}
