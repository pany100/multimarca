import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface MecanicoGananciaSemanal {
  mecanicoId: number;
  mecanicoNombre: string;
  weekStart: string;
  weekEnd: string;
  ganancia: number;
}

interface MecanicoGanancias {
  mecanicoId: number;
  mecanicoNombre: string;
  gananciasSemanales: {
    weekStart: string;
    weekEnd: string;
    ganancia: number;
  }[];
  gananciaTotal: number;
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

    // Obtener todos los mecánicos
    const mecanicos = await prisma.empleado.findMany({
      where: {
        tipo: "Mecanico",
      },
      select: {
        id: true,
        name: true,
      },
    });

    const resultadosPorMecanico: MecanicoGanancias[] = [];

    // Para cada mecánico, calcular las ganancias por semana
    for (const mecanico of mecanicos) {
      const gananciasSemanales: MecanicoGananciaSemanal[] = [];
      let gananciaTotal = 0;

      // Procesar cada semana
      for (const week of weeks) {
        const startDate = week.start.toISOString().split("T")[0];
        const endDate = week.end.toISOString().split("T")[0];

        // Consulta para obtener las ganancias del mecánico en esta semana
        const query = `
          SELECT ROUND(SUM(
            CASE 
              WHEN ? = 'USD' THEN 
                (COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ordenReparacionId = orep.id), 0) / COALESCE(d.blue, 1))
              ELSE 
                COALESCE((SELECT SUM(tr.precioUnitario) FROM TrabajoRealizado tr WHERE tr.ordenReparacionId = orep.id), 0)
            END
          )) as ganancia
          FROM OrdenReparacion orep
          JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
          LEFT JOIN Dolar d ON d.id = orep.dolarId
          WHERE orep.estado = 'Terminado'
          AND orm.mecanicoId = ?
          AND orep.fechaSalidaReparacion >= ?
          AND orep.fechaSalidaReparacion <= ?
          GROUP BY orep.id
        `;

        const params = [moneda, mecanico.id, startDate, endDate];

        const [resultado] = await prisma.$queryRawUnsafe<
          { ganancia: number }[]
        >(query, ...params);

        const ganancia = Number(resultado?.ganancia || 0);
        gananciaTotal += ganancia;

        gananciasSemanales.push({
          mecanicoId: mecanico.id,
          mecanicoNombre: mecanico.name,
          weekStart: startDate,
          weekEnd: endDate,
          ganancia,
        });
      }

      resultadosPorMecanico.push({
        mecanicoId: mecanico.id,
        mecanicoNombre: mecanico.name,
        gananciasSemanales: gananciasSemanales.map(
          ({ weekStart, weekEnd, ganancia }) => ({
            weekStart,
            weekEnd,
            ganancia,
          })
        ),
        gananciaTotal,
      });
    }

    // Ordenar los mecánicos por ganancia total (de mayor a menor)
    resultadosPorMecanico.sort((a, b) => b.gananciaTotal - a.gananciaTotal);

    return NextResponse.json({
      data: resultadosPorMecanico,
      moneda,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de mecánicos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
