import { EstadoOrdenReparacion } from "@prisma/client";
import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

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

/**
 * Checks if the user has permission to access "Pago Empleados" category
 * @param request The incoming request
 * @returns NextResponse with error or null if user has permission
 */
export async function checkUserPermission(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const decodedToken = JSON.parse(atob(token.split(".")[1]));

  // Get user role from database
  const user = await prisma.usuario.findUnique({
    where: { id: decodedToken.userId },
    include: {
      rol: true,
    },
  });

  if (!user || !user.rol) {
    return NextResponse.json(
      { error: "Usuario no tiene rol asignado" },
      { status: 403 }
    );
  }
  // Return null if user has permission
  return null;
}

export async function getReparacionesTerminadasForMecanico(
  startDate: Date,
  endDate: Date,
  mecanicoId: number
) {
  return getReparacionesForMecanico(
    startDate,
    endDate,
    mecanicoId,
    EstadoOrdenReparacion.Terminado
  );
}

export async function getReparacionesForMecanico(
  startDate: Date,
  endDate: Date,
  mecanicoId: number,
  estado: EstadoOrdenReparacion
) {
  return await prisma.ordenReparacion.findMany({
    where: {
      fechaSalidaReparacion: {
        gte: startDate,
        lte: endDate,
      },
      estado,
      mecanicos: {
        some: {
          mecanicoId,
        },
      },
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
}

export function getWeekDateRange(request: Request): {
  startDate: Date;
  endDate: Date;
} {
  // Get date parameters from request URL
  const url = new URL(request.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  // Set default dates if not provided
  let startDate: Date;
  let endDate: Date;

  if (startParam && endParam) {
    // Use provided dates
    startDate = startOfDay(new Date(startParam));
    endDate = new Date(endParam);
  } else {
    // Calculate default dates (last Sunday to today)
    const today = new Date();
    const lastSunday = new Date(today);
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.

    // If today is Sunday, we use today as the start date
    // Otherwise, we go back to the previous Sunday
    lastSunday.setDate(today.getDate() - currentDay);

    // Set time to beginning of the day (00:00:00)
    startDate = startOfDay(lastSunday);
    endDate = today;
  }

  return { startDate, endDate };
}
