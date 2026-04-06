import { CreateStockDto } from "@/core/application/dto/stock.dto";
import { StockRepository } from "@/core/domain/repositories/stock.repository";
import { Prisma } from "@prisma/client";

export class CreateStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(dto: CreateStockDto) {
    const data: Prisma.StockCreateArgs = {
      data: {
        name: dto.name,
        brand: dto.brand,
        buyPrice: dto.buyPrice,
        units: 0,
        restockValue: dto.restockValue ?? null,
        label: dto.label ?? null,
        markup: dto.markup ?? null,
        proveedorId: dto.proveedorId ?? undefined,
        reportName: dto.reportName ?? null,
        sector: dto.sector ?? null,
        carBrand: dto.carBrand ?? null,
        fraccionable: Boolean(dto.fraccionable),
      } as any,
    };

    return await this.repo.create(data);
  }
}
