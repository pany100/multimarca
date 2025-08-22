import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface OrdenCompartidaStats {
  ordenId: number;
  fechaSalida: string;
  mecanicos: {
    id: number;
    nombre: string;
  }[];
  ganancia: number;
}

interface SemanaStats {
  weekStart: string;
  weekEnd: string;
  ordenes: OrdenCompartidaStats[];
  gananciaTotal: number;
  cantidadOrdenes: number;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const moneda = url.searchParams.get("moneda") || "ARS";

    if (moneda !== "ARS" && moneda !== "USD") {
      return NextResponse.json(
        { error: "La moneda debe ser ARS o USD" },
        { status: 400 }
      );
    }

    // Calcular las fechas para las últimas 10 semanas
    const today = new Date();
    const weeks: { start: Date; end: Date }[] = [];

    for (let i = 0; i < 10; i++) {
      // Calcular el inicio de la semana (10-i semanas atrás)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + (today.getDay() || 7)));
      weekStart.setHours(0, 0, 0, 0);

      // Calcular el fin de la semana
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      weeks.push({ start: weekStart, end: weekEnd });
    }

    // Ordenar las semanas de más antigua a más reciente
    weeks.reverse();

    const resultadosPorSemana: SemanaStats[] = [];

    // Procesar cada semana
    for (const week of weeks) {
      const startDate = week.start.toISOString().split("T")[0];
      const endDate = week.end.toISOString().split("T")[0];

      // Consulta para obtener las órdenes compartidas en esta semana
      const query = `
        SELECT 
          orep.id as ordenId,
          orep.fechaSalidaReparacion as fechaSalida,
          ROUND(
            CASE 
              WHEN ? = 'USD' THEN 
                (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ordenReparacionId = orep.id), 0) / COALESCE(d.blue, 1))
              ELSE 
                COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ordenReparacionId = orep.id), 0)
            END
          ) as ganancia
        FROM OrdenReparacion orep
        LEFT JOIN Dolar d ON d.id = orep.dolarId
        WHERE orep.estado = 'Terminado'
        AND orep.fechaSalidaReparacion >= ?
        AND orep.fechaSalidaReparacion <= ?
        AND (
          SELECT COUNT(*) 
          FROM OrdenReparacionMecanico suborm 
          WHERE suborm.ordenReparacionId = orep.id
        ) > 1
      `;
      const params = [moneda, startDate, endDate];

      const ordenes = await prisma.$queryRawUnsafe<
        { ordenId: number; fechaSalida: string; ganancia: number }[]
      >(query, ...params);

      const ordenesConMecanicos: OrdenCompartidaStats[] = [];
      let gananciaTotal = 0;

      // Para cada orden, obtener los mecánicos asociados
      for (const orden of ordenes) {
        const mecanicos = await prisma.ordenReparacionMecanico.findMany({
          where: {
            ordenReparacionId: orden.ordenId,
          },
          select: {
            mecanico: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        ordenesConMecanicos.push({
          ordenId: orden.ordenId,
          fechaSalida: orden.fechaSalida,
          mecanicos: mecanicos.map((m) => ({
            id: m.mecanico.id,
            nombre: m.mecanico.name,
          })),
          ganancia: Number(orden.ganancia || 0),
        });

        gananciaTotal += Number(orden.ganancia || 0);
      }

      resultadosPorSemana.push({
        weekStart: startDate,
        weekEnd: endDate,
        ordenes: ordenesConMecanicos,
        gananciaTotal,
        cantidadOrdenes: ordenesConMecanicos.length,
      });
    }

    return NextResponse.json({
      data: resultadosPorSemana,
      moneda,
    });
  } catch (error) {
    console.error(
      "Error al obtener estadísticas de órdenes compartidas:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
