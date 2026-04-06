import { CreateStockDto } from "@/core/application/dto/stock.dto";
import { StockRepository } from "@/core/domain/repositories/stock.repository";
import { Prisma } from "@prisma/client";

export class CreateStockUseCase {
  constructor(private readonly repo: StockRepository) {}

  async execute(dto: CreateStockDto) {
    // En DB: brand y buyPrice son obligatorios. En UI (alta rápida) pedimos solo
    // nombre, rótulo y proveedor, así que seteamos defaults seguros.
    const brand = (dto.brand ?? "").trim() || "Sin marca";
    const buyPrice = Number.isFinite(Number(dto.buyPrice)) ? Number(dto.buyPrice) : 0;

    const data: Prisma.StockCreateArgs = {
      data: {
        name: dto.name,
        label: dto.label,
        proveedorId: dto.proveedorId,
        brand,
        buyPrice,
        units: 0,
        restockValue: dto.restockValue ?? null,
        markup: dto.markup ?? null,
        reportName: dto.reportName ?? null,
        sector: dto.sector ?? null,
        carBrand: dto.carBrand ?? null,
        fraccionable: Boolean(dto.fraccionable),
      } as any,
    };

    return await this.repo.create(data);
  }
}
