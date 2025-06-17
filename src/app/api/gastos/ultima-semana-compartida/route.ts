import { EstadoOrdenReparacion } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";
import { checkUserPermission, getDateRange } from "../ultima-semana/route";

/**
 * Gets all repairs between specified dates with status "Terminada" that have more than one mechanic assigned
 */
export async function getReparacionesMultiplesMecanicos(
  startDate: Date,
  endDate: Date
) {
  // First, get all completed repairs in the date range
  const reparaciones = await prisma.ordenReparacion.findMany({
    where: {
      fechaSalidaReparacion: {
        gte: startDate,
        lte: endDate,
      },
      estado: EstadoOrdenReparacion.Terminado,
    },
    include: {
      mecanicos: {
        include: {
          mecanico: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      trabajosRealizados: {
        select: {
          descripcion: true,
          precioUnitario: true,
        },
      },
      auto: {
        select: {
          brand: true,
          model: true,
          patent: true,
        },
      },
      pagos: {
        select: {
          id: true,
          monto: true,
          fechaPago: true,
        },
      },
    },
  });

  // Filter to only keep repairs with more than 1 mechanic
  return reparaciones.filter((reparacion) => reparacion.mecanicos.length > 1);
}

export async function GET(request: Request) {
  try {
    const checkPermissionError = await checkUserPermission(request);
    if (checkPermissionError) {
      return checkPermissionError;
    }

    const { startDate, endDate } = getDateRange(request);

    // Get all repairs with multiple mechanics assigned
    const reparaciones = await getReparacionesMultiplesMecanicos(
      startDate,
      endDate
    );

    // Process and format the repairs data
    const result = reparaciones.map((reparacion) => {
      // Calculate total manoDeObra for this repair order
      const manoDeObraTotal = reparacion.trabajosRealizados.reduce(
        (total, trabajo) => total + Number(trabajo.precioUnitario),
        0
      );

      // Check if the repair order has been paid
      const pagado = reparacion.pagos.some(
        (pago) => pago.fechaPago !== null && pago.monto !== null
      );

      // Calculate total manoDeObra for paid repair orders
      const manoDeObraPagada = pagado ? manoDeObraTotal : 0;

      // Format mechanics list
      const mechanics = reparacion.mecanicos.map((rm) => ({
        id: rm.mecanico.id,
        name: rm.mecanico.name,
      }));

      return {
        id: reparacion.id,
        fecha: reparacion.fechaSalidaReparacion,
        auto: `${reparacion.auto.brand} ${reparacion.auto.model} (${reparacion.auto.patent})`,
        mechanics,
        manoDeObraTotal,
        manoDeObraPagada,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener datos de reparaciones compartidas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
