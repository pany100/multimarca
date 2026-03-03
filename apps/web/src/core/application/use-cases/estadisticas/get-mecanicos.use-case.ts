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

type Row = {
  mecanicoId: number;
  mecanicoNombre: string;
  semanaInicio: string;
  semanaFin: string;
  ganancia: number;
};

type SemanaConRango = {
  canonicalWeekStart: string;
  weekStart: string;
  weekEnd: string;
};

type ResultadoMecanico = {
  mecanicoId: number;
  mecanicoNombre: string;
  gananciasSemanales: {
    weekStart: string;
    weekEnd: string;
    ganancia: number;
  }[];
  gananciaTotal: number;
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
  private getSemanasEntre(
    from: Date,
    to: Date
  ): SemanaConRango[] {
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
    rows: Row[],
    semanas: { weekStart: string; weekEnd: string }[],
    byCanonicalStart?: boolean
  ) {
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
          })),
          gananciaTotal: 0,
        });
      }

      const mec = mecanicosMap.get(row.mecanicoId)!;
      const weekIndex = canonicalToIndex.get(canonicalWeekStart);

      if (weekIndex !== undefined) {
        mec.gananciasSemanales[weekIndex].ganancia += Number(row.ganancia);
      }

      mec.gananciaTotal += Number(row.ganancia);
    }

    const resultados = Array.from(mecanicosMap.values());
    resultados.sort((a, b) => b.gananciaTotal - a.gananciaTotal);

    return resultados;
  }

  async execute(dto: MecanicosDto) {
    const dtoVO = EstadisticasVOMapper.getMecanicosToVo(dto);
    const rows: Row[] = (await this.estadisticaService.getMecanicos(
      dtoVO
    )) as Row[];

    const from = dtoVO.from ?? null;
    const to = dtoVO.to ?? null;
    let semanas: { weekStart: string; weekEnd: string }[];

    if (from && to) {
      const semanasConRango = this.getSemanasEntre(from, to);
      semanas = semanasConRango.map((s) => ({
        weekStart: s.weekStart,
        weekEnd: s.weekEnd,
      }));
      const groupedRows = this.groupByWeek(
        rows,
        semanasConRango,
        true
      );
      return { data: groupedRows, moneda: dtoVO.moneda };
    }

    semanas = this.getUltimasSemanas(10);
    const groupedRows = this.groupByWeek(rows, semanas);
    return { data: groupedRows, moneda: dtoVO.moneda };
  }
}
