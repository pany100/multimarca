import { DeudoresQueriesService } from "@/core/infrastructure/database/queries/deudores-queries.service";
import { normalizePageSize } from "@/shared/utils/pagination";
import { ListDeudoresDto } from "../../dto/cliente.dto";

export type ComprobanteAdeudado = {
  tipo: "orden_reparacion" | "venta";
  id: number;
  patente: string | null;
  fecha: string;
  pendiente: number;
};

export class GetDeudoresUseCase {
  constructor(private deudoresQueriesService: DeudoresQueriesService) {}
  async execute(dto: ListDeudoresDto): Promise<any> {
    const { page, size } = normalizePageSize(dto.page, dto.size, {
      defaultSize: 10,
    });
    const result = await this.deudoresQueriesService.listTopDeudores({
      page,
      size,
      query: dto.query || "",
      from: dto.from,
      to: dto.to,
    });
    return {
      ...result,
      items: (result.items ?? []).map((row: any) => ({
        ...row,
        comprobantes: parseComprobantes(row.comprobantes),
      })),
    };
  }
}

function parseComprobantes(value: unknown): ComprobanteAdeudado[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as ComprobanteAdeudado[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}
