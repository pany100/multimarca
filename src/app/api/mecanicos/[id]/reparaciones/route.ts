import { EstadoOrdenReparacion } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import {
  checkUserPermission,
  getReparacionesForMecanico,
  getWeekDateRange,
} from "src/utils/gastosUtils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const checkPermissionError = await checkUserPermission(request);
    if (checkPermissionError) {
      return checkPermissionError;
    }

    const mecanicoId = parseInt(params.id, 10);
    if (isNaN(mecanicoId)) {
      return NextResponse.json(
        { error: "ID de mecánico inválido" },
        { status: 400 }
      );
    }

    // Get date range from request parameters
    const { startDate, endDate } = getWeekDateRange(request);

    // Get filter parameters
    const url = new URL(request.url);
    const reparacionesParam =
      url.searchParams.get("reparaciones") || "terminado";
    const compartidasParam = url.searchParams.get("compartidas") || "false";

    // Determine repair status filter
    let estado: EstadoOrdenReparacion = EstadoOrdenReparacion.Terminado;
    if (reparacionesParam.toLowerCase() === "enprogreso") {
      estado = EstadoOrdenReparacion.EnProgreso;
    }

    // Verify if the mechanic exists
    const mecanico = await prisma.empleado.findUnique({
      where: {
        id: mecanicoId,
        tipo: "Mecanico",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!mecanico) {
      return NextResponse.json(
        { error: "Mecánico no encontrado" },
        { status: 404 }
      );
    }

    // Get repair orders for the mechanic within the date range
    const ordenesReparacion = await getReparacionesForMecanico(
      startDate,
      endDate,
      mecanicoId,
      estado
    );

    // Filter by whether repairs are shared or not
    let filteredOrdenes = ordenesReparacion;
    if (compartidasParam !== null) {
      const compartidas = compartidasParam.toLowerCase() === "true";

      if (compartidas) {
        // Filter to only include repairs with more than one mechanic
        filteredOrdenes = ordenesReparacion.filter(
          (orden) => orden.mecanicos.length > 1
        );
      } else {
        // Filter to only include repairs with exactly one mechanic (the current one)
        filteredOrdenes = ordenesReparacion.filter(
          (orden) => orden.mecanicos.length === 1
        );
      }
    }

    // Calculate manoDeObra for each repair order
    const reparaciones = await Promise.all(
      filteredOrdenes.map(async (orden) => {
        // Calculate total manoDeObra for this repair order
        const manoDeObra = orden.trabajosRealizados.reduce(
          (total, trabajo) => total + Number(trabajo.precioUnitario),
          0
        );

        // Check if the repair order has been paid
        const pagado = orden.pagos.some(
          (pago) => pago.fechaPago !== null && pago.monto !== null
        );

        // Get list of mechanics
        const mecanicos = orden.mecanicos.map((rm) => ({
          id: rm.mecanicoId,
          nombre: rm.mecanico?.name || "Desconocido",
        }));

        return {
          id: orden.id,
          fecha: orden.fechaSalidaReparacion,
          auto: orden.auto.patent,
          manoDeObra,
          pagado,
          cantidadMecanicos: orden.mecanicos.length,
          mecanicos,
          compartida: orden.mecanicos.length > 1,
        };
      })
    );

    // Calculate total manoDeObra for all repair orders
    const manoDeObraTotal = reparaciones.reduce(
      (total, reparacion) => total + reparacion.manoDeObra,
      0
    );

    // Calculate total manoDeObra for paid repair orders
    const manoDeObraPagada = reparaciones.reduce(
      (total, reparacion) =>
        total + (reparacion.pagado ? reparacion.manoDeObra : 0),
      0
    );

    const result = {
      mecanico: {
        id: mecanico.id,
        nombre: mecanico.name,
      },
      periodo: {
        desde: startDate,
        hasta: endDate,
      },
      filtros: {
        estado,
        compartidas:
          compartidasParam !== null ? compartidasParam === "true" : null,
      },
      reparaciones,
      estadisticas: {
        cantidadReparaciones: reparaciones.length,
        manoDeObraTotal,
        manoDeObraPagada,
        porcentajePagado:
          manoDeObraTotal > 0 ? (manoDeObraPagada / manoDeObraTotal) * 100 : 0,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener reparaciones del mecánico:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
