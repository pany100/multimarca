import { UpdateStockDto } from "@/core/application/dto/stock.dto";
import { StockRepository } from "@/core/domain/repositories/stock.repository";
import { Prisma } from "@prisma/client";

export class UpdateStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(id: number, dto: UpdateStockDto) {
    const data: Prisma.StockUpdateArgs = {
      where: { id },
      data: {
        name: dto.name,
        brand: dto.brand,
        buyPrice: dto.buyPrice,
        units: dto.units,
        restockValue: dto.restockValue ?? null,
        label: dto.label ?? null,
        markup: dto.markup ?? null,
        buyIva: dto.buyIva ?? null,
        sellIva: dto.sellIva ?? null,
        proveedorId: dto.proveedorId ?? undefined,
        reportName: dto.reportName ?? null,
        sector: dto.sector ?? null,
        carBrand: dto.carBrand ?? null,
        fraccionable:
          dto.fraccionable !== undefined ? Boolean(dto.fraccionable) : undefined,
      } as any,
    };

    return await this.repo.update(data);
  }
}
