import type { ListGastosQueryDto } from "@/core/application/dto/gasto.dto";
import { PageResult } from "@/shared/utils/pagination";

export type ListGastosParams = Omit<ListGastosQueryDto, "page" | "size"> & {
  page: number;
  size: number;
  userRoleName: string;
};

export interface GastoRepository {
  listPaged(args: ListGastosParams): Promise<PageResult<any>>;
  getGastoMecanicosUltimaSemana(from: Date, to: Date): Promise<any>;
  getGastoMecanicosUltimaSemanaCompartida(from: Date, to: Date): Promise<any>;
  getVentasMecanicosUltimaSemana(from: Date, to: Date): Promise<any>;
  getVentasMecanicosUltimaSemanaCompartida(from: Date, to: Date): Promise<any>;
}
