import { startOfDay } from "date-fns";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export async function GET(request: Request) {
  try {
    // Check user permissions
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

    // Check if user has permission to view "Pago Empleados"
    const categoriaGasto = await prisma.categoriaGasto.findFirst({
      where: {
        nombre: "Pago Empleados",
      },
      include: {
        roles: true,
      },
    });

    // If category exists and has roles assigned, check if user's role is included
    if (categoriaGasto && categoriaGasto.roles.length > 0) {
      const hasPermission = categoriaGasto.roles.some(
        (rol) => rol.id === user.rol.id
      );

      if (!hasPermission) {
        // User doesn't have permission, return empty array
        return NextResponse.json([]);
      }
    }

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

    // Get all mechanics (only those with tipo "Mecanico")
    const mecanicos = await prisma.empleado.findMany({
      where: {
        tipo: "Mecanico",
      },
      select: {
        id: true,
        name: true,
      },
    });

    // For each mechanic, get their repair orders from the specified date range
    const result = await Promise.all(
      mecanicos.map(async (mecanico) => {
        // Get all repair orders for this mechanic from the date range
        const ordenesReparacion = await prisma.ordenReparacionMecanico.findMany(
          {
            where: {
              mecanicoId: mecanico.id,
              ordenReparacion: {
                fechaSalidaReparacion: {
                  gte: startDate,
                  lte: endDate,
                },
              },
            },
            select: {
              ordenReparacion: {
                select: {
                  id: true,
                  fechaSalidaReparacion: true,
                  auto: {
                    select: {
                      brand: true,
                      model: true,
                      patent: true,
                    },
                  },
                  trabajosRealizados: {
                    select: {
                      descripcion: true,
                      precioUnitario: true,
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
              },
            },
          }
        );

        // Calculate manoDeObra for each repair order and total for the mechanic
        const reparaciones = await Promise.all(
          ordenesReparacion.map(async (orden) => {
            // Calculate total manoDeObra for this repair order
            const manoDeObra = orden.ordenReparacion.trabajosRealizados.reduce(
              (total, trabajo) => total + Number(trabajo.precioUnitario),
              0
            );

            // Check if the repair order has been paid
            const pagado = orden.ordenReparacion.pagos.some(
              (pago) => pago.fechaPago !== null && pago.monto !== null
            );

            return {
              idOrep: orden.ordenReparacion.id,
              fecha: orden.ordenReparacion.fechaSalidaReparacion,
              auto: `${orden.ordenReparacion.auto.brand} ${orden.ordenReparacion.auto.model} (${orden.ordenReparacion.auto.patent})`,
              manoDeObra,
              pagado,
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

        return {
          mecanicoId: mecanico.id,
          mecanicoNombre: mecanico.name,
          reparaciones,
          manoDeObraTotal,
          manoDeObraPagada,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener datos de mecánicos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
