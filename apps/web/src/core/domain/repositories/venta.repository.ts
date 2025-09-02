import type { ListVentasQueryDto } from "@/core/application/dto/venta.dto";
import { PageResult } from "@/shared/utils/pagination";
import type { Prisma, Venta } from "@prisma/client";

export type ListVentasParams = Omit<ListVentasQueryDto, "page" | "size"> & {
  page: number;
  size: number;
};

export interface VentaRepository {
  create(
    tx: Prisma.TransactionClient,
    input: Prisma.VentaCreateArgs
  ): Promise<Venta>;
  listPaged(args: ListVentasParams): Promise<PageResult<Venta>>;
}
