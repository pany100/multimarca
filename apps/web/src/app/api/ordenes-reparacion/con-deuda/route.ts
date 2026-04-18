import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

const ordenInclude = {
  repuestosUsados: { include: { stock: true } },
  reparacionesDeTercero: { include: { proveedor: true, reciboFile: true } },
  trabajosRealizados: true,
  ingresos: { include: { dolar: true } },
  auto: { include: { owner: true } },
  ajustesPrecio: true,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const queryAsNumber = parseInt(query);
    const isNumericQuery = !isNaN(queryAsNumber);

    const ordenes = await prisma.ordenReparacion.findMany({
      where: {
        estado: { not: "Presupuestado" },
        OR: [
          ...(isNumericQuery ? [{ id: queryAsNumber }] : []),
          { auto: { patent: { contains: query } } },
          { auto: { brand: { contains: query } } },
          { auto: { owner: { fullName: { contains: query } } } },
        ],
      },
      include: ordenInclude,
      orderBy: { fechaCreacion: "desc" },
      take: 20,
    });

    const ordenesConDeuda = ordenes
      .map((orden) => {
        const calculoVO = ComprobanteCalculadoFactory.fromOrden(orden);
        return {
          id: orden.id,
          fecha: orden.fechaEntradaReparacion || orden.fechaCreacion,
          estado: orden.estado,
          auto: orden.auto
            ? {
                patent: orden.auto.patent,
                brand: orden.auto.brand,
                model: orden.auto.model,
              }
            : null,
          clienteId: orden.auto?.ownerId || null,
          clienteNombre:
            (orden.auto as any)?.owner?.fullName || "Sin cliente",
          totalAPagar: calculoVO.total,
          totalPagado: calculoVO.totalPagado,
          deuda: calculoVO.deuda,
        };
      })
      .filter((orden) => orden.deuda > 0 || orden.totalAPagar === 0);

    return NextResponse.json(ordenesConDeuda);
  } catch (e) {
    return handleApiError(e);
  }
}
