import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import prisma from "src/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const query = searchParams.get("query") || "";
    const estado = searchParams.get("estado");

    const skip = page * size;

    const hoy = new Date();
    const fechaHoy = hoy.toISOString().split("T")[0];
    const seisMesesAtras = new Date(hoy);
    seisMesesAtras.setMonth(hoy.getMonth() - 6);
    const fechaSeisMesesAtras = seisMesesAtras.toISOString().split("T")[0];

    let estadoCondition = null;
    if (estado === "enviado") {
      estadoCondition = Prisma.sql`AND DATE(DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY)) <= ${fechaHoy}`;
    } else if (estado === "pendiente") {
      estadoCondition = Prisma.sql`AND DATE(DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY)) > ${fechaHoy}`;
    } else {
      estadoCondition = Prisma.sql``;
    }

    const [recordatorios, total] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          c.fullName, 
          c.phone, 
          orep.fechaSalidaReparacion,
          a.patent,
          orep.kilometros,
          tr.descripcion,
          DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY) as fechaRecordatorio,
          CASE 
            WHEN DATE(DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY)) <= ${fechaHoy} 
            THEN true 
            ELSE false 
          END as enviado
        FROM
          OrdenReparacion orep
        JOIN
          Auto a on a.id = orep.autoId
        JOIN 
          Cliente c ON a.ownerId = c.id
        JOIN 
          TrabajoRealizado tr ON orep.id = tr.ordenReparacionId
        WHERE 
          orep.estado = 'Terminado'
        AND 
          c.can_receive_notifications = true
        AND 
          tr.diasParaRecordatorio IS NOT NULL
        AND 
          DATE(DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY)) 
          BETWEEN ${fechaSeisMesesAtras} AND DATE_ADD(${fechaHoy}, INTERVAL 365 DAY)
        AND
          (c.fullName LIKE ${`%${query}%`} OR tr.descripcion LIKE ${`%${query}%`})
        ${estadoCondition}
        ORDER BY DATE(fechaRecordatorio) ASC
        LIMIT ${size} OFFSET ${skip}
      `,
      prisma.$queryRaw`
        SELECT CAST(COUNT(*) AS SIGNED) as count
        FROM
          OrdenReparacion orep
        JOIN
          Auto a on a.id = orep.autoId
        JOIN 
          Cliente c ON a.ownerId = c.id
        JOIN 
          TrabajoRealizado tr ON orep.id = tr.ordenReparacionId
        WHERE 
          orep.estado = 'Terminado'
        AND 
          c.can_receive_notifications = true
        AND 
          tr.diasParaRecordatorio IS NOT NULL
        AND 
          DATE(DATE_ADD(orep.fechaSalidaReparacion, INTERVAL tr.diasParaRecordatorio DAY)) 
          BETWEEN ${fechaSeisMesesAtras} AND DATE_ADD(${fechaHoy}, INTERVAL 365 DAY)
        AND
          (c.fullName LIKE ${`%${query}%`} OR tr.descripcion LIKE ${`%${query}%`})
        ${estadoCondition}
      `,
    ]);

    const totalCount = Number((total as any)[0].count);

    return NextResponse.json({
      items: recordatorios,
      total: totalCount,
      page,
      size,
      totalPages: Math.ceil(totalCount / size),
    });
  } catch (error) {
    console.error("Error al obtener recordatorios:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
