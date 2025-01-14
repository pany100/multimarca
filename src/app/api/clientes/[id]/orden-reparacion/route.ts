import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clienteId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const soloConDeuda = searchParams.get("soloConDeuda") === "true";

    const ordenesReparacion = await prisma.ordenReparacion.findMany({
      where: {
        auto: {
          ownerId: clienteId,
        },
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
        mecanicos: true,
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        ingresos: {
          include: {
            dolar: true,
          },
        },
      },
    });

    const ordenesConDeuda = ordenesReparacion.map((orden) => {
      const ordenParaCalculo = {
        ...orden,
        repuestosUsados: orden.repuestosUsados.map((r) => ({
          precioVenta: Number(r.precioVenta),
          unidadesConsumidas: r.unidadesConsumidas,
        })),
        reparacionesDeTercero: orden.reparacionesDeTercero.map((r) => ({
          precioVenta: Number(r.precioVenta),
        })),
        trabajosRealizados: orden.trabajosRealizados.map((t) => ({
          precioUnitario: Number(t.precioUnitario),
        })),
        descuento: Number(orden.descuento),
      };
      const totalAPagar = calcularTotalOrdenReparacion(ordenParaCalculo);
      const totalPagado = orden.ingresos.reduce((sum, ingreso) => {
        if (ingreso.moneda === "Dolar") {
          return sum + Number(ingreso.monto) * Number(ingreso.dolar?.blue);
        }
        return sum + Number(ingreso.monto);
      }, 0);

      return {
        ...orden,
        totalAPagar,
        totalPagado,
        deuda: totalAPagar - totalPagado,
      };
    });

    if (soloConDeuda) {
      return NextResponse.json(
        ordenesConDeuda.filter((orden) => orden.deuda > 0)
      );
    }

    return NextResponse.json(ordenesConDeuda);
  } catch (error) {
    console.error("Error al obtener las órdenes de reparación:", error);
    return NextResponse.json(
      { error: "Error al obtener las órdenes de reparación" },
      { status: 500 }
    );
  }
}
