import { ExchangeRatePort } from "@/core/domain/ports/exchange-rate.port";
import { FileStoragePort } from "@/core/domain/ports/file-storage.port";
import { InventoryPort } from "@/core/domain/ports/inventory.port";
import {
  OrdenReparacionRepository,
  RepuestoFromOrderInDb,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { RepuestoUsado } from "@/core/domain/value-objects/repuesto-usado.vo";
import { StockAction } from "@/core/domain/value-objects/stock-action.vo";
import { EstadoOrdenReparacion } from "@prisma/client";
import { CreateOrdenDto } from "../dto/orden-reparacion.dto";
import { OrdenReparacionDataFactory } from "../factories/orden-reparacion-data.factory";
import { StockManagerService } from "./stock-manager.service";

export class OrdenReparacionService {
  constructor(
    private readonly stockManager: StockManagerService,
    private readonly repo: OrdenReparacionRepository,
    private readonly inventory: InventoryPort,
    private readonly exchange: ExchangeRatePort,
    private readonly files: FileStoragePort
  ) {}

  async delete({ tx }: any, id: number) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Orden de reparación no encontrada");
    const repuestos = (existing.repuestosUsados ?? []).map(
      (r: RepuestoFromOrderInDb): RepuestoUsado => RepuestoUsado.fromOrderDb(r)
    );

    // Generar acciones de stock para liberar repuestos
    const stockActions = this.stockManager.generateReleaseActions(repuestos);

    await this.inventory.restoreStock(
      repuestos.map((r: RepuestoUsado) => ({
        stockId: r.stockId,
        units: r.unidadesConsumidas,
      })),
      { tx }
    );
    await this.repo.delete(tx, id);

    return stockActions; // Retornar las acciones generadas para logging/auditoría
  }

  async create(
    { tx }: any,
    input: CreateOrdenDto
  ): Promise<{ orden: any; stockActions: StockAction[] }> {
    const estado = EstadoOrden.from(
      input.estado ?? EstadoOrdenReparacion.Presupuestado
    );

    // Transformar datos usando factory
    const { priceAdjustments, mecanicos, repuestos, trabajos, terceros } =
      await OrdenReparacionDataFactory.transformInput(input, this.files);

    const stockActions = this.stockManager.generateTakeActions(repuestos);

    // Validar stock suficiente
    await this.inventory.ensureSufficient(stockActions);

    const fechaCreacion = input.fechaCreacion
      ? new Date(input.fechaCreacion)
      : new Date();
    const dolar = await this.exchange.getForDate(fechaCreacion);

    const controles = await tx.controlMecanico.findMany();

    const createData = OrdenReparacionDataFactory.createData(
      input,
      estado,
      priceAdjustments,
      mecanicos,
      repuestos,
      trabajos,
      terceros,
      controles,
      dolar,
      fechaCreacion
    );

    const orden = await this.repo.create(tx, createData);

    if (!estado.isPresupuestado()) {
      await this.inventory.consumeAndNotify(stockActions, { tx });
    }

    if (estado.isTerminado()) {
      await tx.pagoAMecanico.create({
        data: { ordenReparacionId: orden.id },
      });
      await tx.notificacionInterna.create({
        data: {
          fecha: new Date(),
          titulo: "Reparación Terminada",
          texto: `La reparación del auto ${orden.autoId} se encuentra terminada. Pagar mano de obra.`,
          leida: false,
          ordenReparacionId: orden.id,
          tipo: "REPARACION_TERMINADA",
        },
      });
    }

    return { orden, stockActions };
  }
}
