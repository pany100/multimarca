import type { RecordatorioManoDeObraRepository } from "@/core/domain/repositories/recordatorio-mano-de-obra.repository";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Argentina/Buenos_Aires");

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

export type ListRecordatoriosParams = {
  page: number;
  size: number;
  query?: string;
  estado?: "pendiente" | "enviado";
};

export type RecordatorioItem = {
  fullName: string;
  phone: string;
  fechaSalidaReparacion: Date;
  patent: string;
  kilometros: number | null;
  descripcion: string;
  fechaRecordatorio: string;
  enviado: boolean;
};

export type ListRecordatoriosResult = {
  items: RecordatorioItem[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
};

export class RecordatorioManoDeObraService {
  constructor(
    private readonly recordatorioRepo: RecordatorioManoDeObraRepository
  ) {}

  async list(params: ListRecordatoriosParams): Promise<ListRecordatoriosResult> {
    const { page, size, query: queryParam, estado } = params;
    const query = (queryParam ?? "").trim().toLowerCase();

    const today = dayjs().tz("America/Argentina/Buenos_Aires");
    const fechaHoy = today.format("YYYY-MM-DD");
    const seisMesesAtras = today.subtract(6, "month").format("YYYY-MM-DD");
    const unAnioAdelante = today.add(365, "day").format("YYYY-MM-DD");

    const rows = await this.recordatorioRepo.findTrabajosConRecordatorio();
    const expanded: RecordatorioItem[] = [];

    for (const row of rows) {
      const dias = diasToArray(row.diasParaRecordatorio);
      const fechaSalida = dayjs(row.fechaSalidaReparacion)
        .tz("America/Argentina/Buenos_Aires")
        .startOf("day");

      for (const dia of dias) {
        const fechaRecordatorio = fechaSalida.add(dia, "day");
        const fechaRecordatorioStr = fechaRecordatorio.format("YYYY-MM-DD");

        if (
          fechaRecordatorioStr >= seisMesesAtras &&
          fechaRecordatorioStr <= unAnioAdelante
        ) {
          const pasaFiltroQuery =
            !query ||
            row.fullName.toLowerCase().includes(query) ||
            row.descripcion.toLowerCase().includes(query);

          if (!pasaFiltroQuery) continue;

          const enviado = fechaRecordatorioStr <= fechaHoy;

          if (estado === "pendiente" && enviado) continue;
          if (estado === "enviado" && !enviado) continue;

          expanded.push({
            fullName: row.fullName,
            phone: row.phone,
            fechaSalidaReparacion: row.fechaSalidaReparacion,
            patent: row.patent,
            kilometros: row.kilometros,
            descripcion: row.descripcion,
            fechaRecordatorio: fechaRecordatorio.toISOString(),
            enviado,
          });
        }
      }
    }

    expanded.sort(
      (a, b) =>
        new Date(a.fechaRecordatorio).getTime() -
        new Date(b.fechaRecordatorio).getTime()
    );

    const total = expanded.length;
    const items = expanded.slice(page * size, page * size + size);

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
}
