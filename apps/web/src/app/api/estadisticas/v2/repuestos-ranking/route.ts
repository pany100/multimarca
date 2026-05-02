import {
  getRankingRepuestosTaller,
  getRankingRepuestosTerceros,
} from "@/core/infrastructure/database/queries/estadisticas-repuestos.service";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function defaultRange() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  const to = `${ny}-${String(nm).padStart(2, "0")}-01`;
  return { from, to };
}

function parseRange(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const fromParam = sp.get("from");
  const toParam = sp.get("to");
  const def = defaultRange();
  const from = fromParam && /^\d{4}-\d{2}-\d{2}$/.test(fromParam) ? fromParam : def.from;
  const to = toParam && /^\d{4}-\d{2}-\d{2}$/.test(toParam) ? toParam : def.to;
  return { from, to };
}

export async function GET(req: NextRequest) {
  try {
    const { from, to } = parseRange(req);
    const [taller, terceros] = await Promise.all([
      getRankingRepuestosTaller(from, to),
      getRankingRepuestosTerceros(from, to),
    ]);
    return NextResponse.json({ from, to, taller, terceros });
  } catch (e) {
    return handleApiError(e);
  }
}
