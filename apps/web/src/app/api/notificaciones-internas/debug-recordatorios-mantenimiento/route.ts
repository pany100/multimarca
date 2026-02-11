import { prisma } from "@/core/infrastructure/database/prisma";
import { getCurrentUser } from "src/utils/authFetch";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { NextResponse } from "next/server";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

export const dynamic = "force-dynamic";

type Row = {
  fullName: string;
  phone: string;
  fechaSalidaReparacion: Date;
  patent: string;
  descripcion: string;
  diasParaRecordatorio: unknown;
};

function diasToArray(val: unknown): number[] {
  if (val == null) return [];
  if (Array.isArray(val)) return val.filter((n) => typeof n === "number");
  if (typeof val === "number") return [val];
  try {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return Array.isArray(parsed)
      ? parsed.filter((n: unknown) => typeof n === "number")
      : [];
  } catch {
    return [];
  }
}

/**
 * GET: Diagnóstico de recordatorios de mantenimiento.
 * Misma query y lógica que enviarRecordatoriosMantenimiento, sin crear notificaciones.
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const fechaHoy = today.format("YYYY-MM-DD");

    const rows: Row[] = await prisma.$queryRaw`
      SELECT 
        c.fullName, 
        c.phone,
        a.patent,
        orep.fechaSalidaReparacion, 
        tr.descripcion,
        tr.diasParaRecordatorio
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
        JSON_LENGTH(tr.diasParaRecordatorio) > 0
    `;

    const trabajosParaRecordar = rows.filter((row) => {
      const dias = diasToArray(row.diasParaRecordatorio);
      const fechaSalida = dayjs(row.fechaSalidaReparacion)
        .tz("America/Argentina/Buenos_Aires")
        .startOf("day");
      return dias.some(
        (dia) => fechaSalida.add(dia, "day").format("YYYY-MM-DD") === fechaHoy
      );
    });

    const filasConDetalle = rows.map((row) => {
      const dias = diasToArray(row.diasParaRecordatorio);
      const fechaSalida = dayjs(row.fechaSalidaReparacion)
        .tz("America/Argentina/Buenos_Aires")
        .startOf("day");
      const fechasRecordatorio = dias.map((dia) =>
        fechaSalida.add(dia, "day").format("YYYY-MM-DD")
      );
      return {
        fullName: row.fullName,
        patent: row.patent,
        descripcion: row.descripcion,
        fechaSalidaReparacion: row.fechaSalidaReparacion,
        diasParaRecordatorio: row.diasParaRecordatorio,
        fechasRecordatorio,
        coincideHoy: fechasRecordatorio.includes(fechaHoy),
      };
    });

    return NextResponse.json({
      fechaHoy,
      zona: "America/Argentina/Buenos_Aires",
      totalFilasQuery: rows.length,
      totalParaRecordarHoy: trabajosParaRecordar.length,
      trabajosParaRecordarHoy: trabajosParaRecordar.map((t) => ({
        fullName: t.fullName,
        patent: t.patent,
        descripcion: t.descripcion,
      })),
      todasLasFilasConDetalle: filasConDetalle,
    });
  } catch (error) {
    console.error("Error en debug recordatorios:", error);
    return NextResponse.json(
      { error: "Error en diagnóstico", details: String(error) },
      { status: 500 }
    );
  }
}
