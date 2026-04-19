import {
  addWeeks,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { MecanicosDto } from "../../dto/estadisticas.dto";
import { EstadisticasVOMapper } from "../../mapper/estadisticas-vo.mapper";
import { EstadisticaService } from "../../services/estadistica.service";
import type {
  MecanicoRow,
  OrdenCompartida,
} from "@/core/infrastructure/database/queries/estadisticas-mecanicos-query.service";

type SemanaConRango = {
  canonicalWeekStart: string;
  weekStart: string;
  weekEnd: string;
};

type GananciaSemanal = {
  weekStart: string;
  weekEnd: string;
  ganancia: number;
  cantidadOrdenes: number;
};

type ResultadoMecanico = {
  mecanicoId: number;
  mecanicoNombre: string;
  gananciasSemanales: GananciaSemanal[];
  gananciaTotal: number;
  ordenesTotal: number;
  ticketPromedio: number;
};

export class GetMecanicosUseCase {
  constructor(private readonly estadisticaService: EstadisticaService) {}

  /** Últimas N semanas (lun-dom, semana empieza lunes). */
  private getUltimasSemanas(
    n: number
  ): { weekStart: string; weekEnd: string }[] {
    const hoy = new Date();
    const semanas: { weekStart: string; weekEnd: string }[] = [];

    for (let i = n - 1; i >= 0; i--) {
      const date = subWeeks(hoy, i);
      const weekStart = format(
        startOfWeek(date, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      const weekEnd = format(
        endOfWeek(date, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      semanas.push({ weekStart, weekEnd });
    }

    return semanas;
  }

  /** Semanas que tocan [from, to], con semanas cortas recortadas por from/to. */
  private getSemanasEntre(from: Date, to: Date): SemanaConRango[] {
    const start = startOfWeek(from, { weekStartsOn: 1 });
    const end = endOfWeek(to, { weekStartsOn: 1 });
    const semanas: SemanaConRango[] = [];
    let current = start;

    while (current <= end) {
      const weekEndDate = endOfWeek(current, { weekStartsOn: 1 });
      const displayStart = current < from ? from : current;
      const displayEnd = weekEndDate > to ? to : weekEndDate;
      semanas.push({
        canonicalWeekStart: format(current, "yyyy-MM-dd"),
        weekStart: format(displayStart, "yyyy-MM-dd"),
        weekEnd: format(displayEnd, "yyyy-MM-dd"),
      });
      current = addWeeks(current, 1);
    }

    return semanas;
  }

  private groupByWeek(
    rows: MecanicoRow[],
    semanas: { weekStart: string; weekEnd: string }[],
    byCanonicalStart?: boolean
  ): ResultadoMecanico[] {
    const canonicalToIndex = new Map<string, number>();
    semanas.forEach((s, i) => {
      const key =
        byCanonicalStart && "canonicalWeekStart" in s
          ? (s as SemanaConRango).canonicalWeekStart
          : s.weekStart;
      canonicalToIndex.set(key, i);
    });

    const mecanicosMap = new Map<number, ResultadoMecanico>();

    for (const row of rows) {
      const date = parseISO(row.semanaInicio);
      const canonicalWeekStart = format(
        startOfWeek(date, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );

      if (!mecanicosMap.has(row.mecanicoId)) {
        mecanicosMap.set(row.mecanicoId, {
          mecanicoId: row.mecanicoId,
          mecanicoNombre: row.mecanicoNombre,
          gananciasSemanales: semanas.map((s) => ({
            weekStart: s.weekStart,
            weekEnd: s.weekEnd,
            ganancia: 0,
            cantidadOrdenes: 0,
          })),
          gananciaTotal: 0,
          ordenesTotal: 0,
          ticketPromedio: 0,
        });
      }

      const mec = mecanicosMap.get(row.mecanicoId)!;
      const weekIndex = canonicalToIndex.get(canonicalWeekStart);

      if (weekIndex !== undefined) {
        mec.gananciasSemanales[weekIndex].ganancia += Number(row.ganancia);
        mec.gananciasSemanales[weekIndex].cantidadOrdenes += Number(
          row.cantidadOrdenes
        );
      }

      mec.gananciaTotal += Number(row.ganancia);
      mec.ordenesTotal += Number(row.cantidadOrdenes);
    }

    const resultados = Array.from(mecanicosMap.values());
    for (const r of resultados) {
      r.ticketPromedio = r.ordenesTotal > 0 ? r.gananciaTotal / r.ordenesTotal : 0;
    }
    resultados.sort((a, b) => b.gananciaTotal - a.gananciaTotal);

    return resultados;
  }

  async execute(dto: MecanicosDto) {
    const dtoVO = EstadisticasVOMapper.getMecanicosToVo(dto);

    const [rows, ordenesCompartidas] = await Promise.all([
      this.estadisticaService.getMecanicos(dtoVO) as Promise<MecanicoRow[]>,
      this.estadisticaService.getOrdenesCompartidas(dtoVO),
    ]);

    const from = dtoVO.from ?? null;
    const to = dtoVO.to ?? null;

    let data: ResultadoMecanico[];

    if (from && to) {
      const semanasConRango = this.getSemanasEntre(from, to);
      data = this.groupByWeek(rows, semanasConRango, true);
    } else {
      const semanas = this.getUltimasSemanas(10);
      data = this.groupByWeek(rows, semanas);
    }

    const totalGeneral = data.reduce((acc, m) => acc + m.gananciaTotal, 0);
    const ordenesTotales = data.reduce((acc, m) => acc + m.ordenesTotal, 0);

    return {
      data,
      moneda: dtoVO.moneda,
      kpis: {
        totalManoDeObra: totalGeneral,
        ordenesTerminadas: ordenesTotales,
        ticketPromedio: ordenesTotales > 0 ? totalGeneral / ordenesTotales : 0,
        cantidadMecanicos: data.length,
      },
      ordenesCompartidas: (ordenesCompartidas as OrdenCompartida[]).map((o) => ({
        ordenId: Number(o.ordenId),
        fechaSalida: o.fechaSalida,
        manoDeObraConIva: Number(o.manoDeObraConIva),
        mecanicos: o.mecanicos,
      })),
    };
  }
}
