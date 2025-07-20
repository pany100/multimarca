import prisma from "@/lib/prisma";
import { calcularTotalOrdenReparacion } from "@/utils/ordenHelper";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const soloConDeuda = searchParams.get("soloConDeuda") === "true";

    // Descodificar el slug para manejar caracteres especiales en informacionCliente
    const informacionCliente = decodeURIComponent(slug);

    // Query para ventas con el informacionCliente específico con datos relacionados
    const ventas = await prisma.venta.findMany({
      where: {
        informacionCliente: informacionCliente,
      },
      include: {
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        ingresos: {
          include: {
            dolar: true,
          },
        },
      },
      orderBy: {
        fecha: "desc",
      },
    });

    // Calcular deuda y total para cada venta
    const ventasConDeuda = ventas.map((venta) => {
      const ventaParaCalculo = {
        ...venta,
        repuestosUsados: venta.repuestosUsados.map((r) => ({
          precioVenta: Number(r.precioVenta),
          unidadesConsumidas: r.unidadesConsumidas,
        })),
        reparacionesDeTercero: venta.reparacionesDeTercero.map((r) => ({
          precioVenta: Number(r.precioVenta),
        })),
        trabajosRealizados: venta.trabajosRealizados.map((t) => ({
          precioUnitario: Number(t.precioUnitario),
        })),
        descuento: Number(venta.descuento),
        incremento: Number(venta.incremento),
      };

      const totalAPagar = calcularTotalOrdenReparacion(ventaParaCalculo);
      const totalPagado = venta.ingresos.reduce((sum, ingreso) => {
        if (ingreso.moneda === "Dolar") {
          return sum + Number(ingreso.monto) * Number(ingreso.dolar?.blue);
        }
        return sum + Number(ingreso.monto);
      }, 0);

      return {
        ...venta,
        totalAPagar,
        totalPagado,
        deuda: totalAPagar - totalPagado,
      };
    });

    // Aplicar filtro de solo con deuda si es necesario
    const ventasFiltradas = soloConDeuda
      ? ventasConDeuda.filter((venta) => venta.deuda > 0)
      : ventasConDeuda;

    // Formatear los resultados para devolver opciones para el select
    const ventasOptions = ventasFiltradas.map((venta) => ({
      value: venta.id,
      label: `${new Date(venta.fecha).toLocaleDateString()} - $${
        venta.totalAPagar
      } ${venta.deuda > 0 ? ` (Deuda: $${venta.deuda.toFixed(2)})` : ""}`,
      venta: {
        ...venta,
        totalAPagar: venta.totalAPagar,
        totalPagado: venta.totalPagado,
        deuda: venta.deuda,
      },
    }));

    return NextResponse.json(ventasOptions);
  } catch (error) {
    console.error("Error fetching ventas by informacionCliente:", error);
    return NextResponse.json(
      { error: "Error fetching ventas" },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
