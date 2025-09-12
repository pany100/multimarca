import { endOfWeek, format, parseISO, startOfWeek, subWeeks } from "date-fns";
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

  private getUltimasSemanas(
    n: number
  ): { weekStart: string; weekEnd: string }[] {
    const hoy = new Date();
    const semanas: { weekStart: string; weekEnd: string }[] = [];

    for (let i = n - 1; i >= 0; i--) {
      const date = subWeeks(hoy, i);
      const weekStart = format(
        startOfWeek(date, { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      ); // sábado
      const weekEnd = format(
        endOfWeek(date, { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      ); // viernes
      semanas.push({ weekStart, weekEnd });
    }

    return semanas;
  }

  private groupByWeek(rows: Row[]) {
    const semanas = this.getUltimasSemanas(10);

    const mecanicosMap = new Map<number, ResultadoMecanico>();

    for (const row of rows) {
      // Calcular la semana de la fila
      const date = parseISO(row.semanaInicio);
      const weekStart = format(
        startOfWeek(date, { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      ); // sábado
      const weekEnd = format(
        endOfWeek(date, { weekStartsOn: 0 }),
        "yyyy-MM-dd"
      ); // viernes

      if (!mecanicosMap.has(row.mecanicoId)) {
        mecanicosMap.set(row.mecanicoId, {
          mecanicoId: row.mecanicoId,
          mecanicoNombre: row.mecanicoNombre,
          gananciasSemanales: semanas.map((s) => ({ ...s, ganancia: 0 })), // inicializar con 0
          gananciaTotal: 0,
        });
      }

      const mec = mecanicosMap.get(row.mecanicoId)!;

      // Encontrar la semana en el array y sumarle la ganancia
      const semana = mec.gananciasSemanales.find(
        (s) => s.weekStart === weekStart && s.weekEnd === weekEnd
      );

      if (semana) {
        semana.ganancia += Number(row.ganancia);
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
    const groupedRows = this.groupByWeek(rows);

    return { data: groupedRows, moneda: dtoVO.moneda };
  }
}
