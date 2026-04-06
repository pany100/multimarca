import { ListStockDto, UpdateStockPricesByProveedorDto } from "@/core/application/dto/stock.dto";
import { PageResult } from "@/shared/utils/pagination";
import { Prisma } from "@prisma/client";

export type ListStockParams = Omit<ListStockDto, "page" | "size"> & {
  page: number;
  size: number;
};

export type StockWithProveedor = Prisma.StockGetPayload<{
  include: {
    proveedor: true;
  };
}>;

export interface StockRepository {
  listPaged(params: ListStockParams): Promise<PageResult<StockWithProveedor>>;
  listAll(): Promise<StockWithProveedor[]>;
  create(data: Prisma.StockCreateArgs): Promise<StockWithProveedor>;
  findById(id: number): Promise<StockWithProveedor | null>;
  update(data: Prisma.StockUpdateArgs): Promise<StockWithProveedor>;
  delete(id: number): Promise<void>;
  updatePricesByProveedor(dto: UpdateStockPricesByProveedorDto): Promise<void>;
}
