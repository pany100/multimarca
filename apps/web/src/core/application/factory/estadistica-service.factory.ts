import { EstadisticasAutosQueriesService } from "@/core/infrastructure/database/queries/estadisticas-autos-queries.service";
import { EstadisticasBalanceQueriesService } from "@/core/infrastructure/database/queries/estadisticas-balance-queries.service";
import { EstadisticasMecanicosQueriesService } from "@/core/infrastructure/database/queries/estadisticas-mecanicos-query.service";
import { EstadisticaService } from "../services/estadistica.service";

export class EstadisticaServiceFactory {
  constructor() {}

  static create() {
    return new EstadisticaService(
      new EstadisticasAutosQueriesService(),
      new EstadisticasBalanceQueriesService(),
      new EstadisticasMecanicosQueriesService()
    );
  }
}
