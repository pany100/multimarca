import { ExchangeRatePort } from "@/core/domain/ports/exchange-rate.port";
import { FileStoragePort } from "@/core/domain/ports/file-storage.port";
import { InventoryPort } from "@/core/domain/ports/inventory.port";
import {
  OrdenReparacionRepository,
  RepuestoFromOrderInDb,
} from "@/core/domain/repositories/orden-reparacion.repository";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { MecanicoRef } from "@/core/domain/value-objects/mecanico-ref.vo";
import { PriceAdjustments } from "@/core/domain/value-objects/price-adjustments.vo";
import {
  ReparacionTercero,
  ReparacionTerceroProps,
} from "@/core/domain/value-objects/reparacion-tercero.vo";
import {
  RepuestoUsado,
  RepuestoUsadoProps,
  RepuestoUsado as RepuestoUsadoVO,
} from "@/core/domain/value-objects/repuesto-usado.vo";
import { StockAction } from "@/core/domain/value-objects/stock-action.vo";
import {
  TrabajoRealizado,
  TrabajoRealizadoProps,
} from "@/core/domain/value-objects/trabajo-realizado.vo";
import { EstadoOrdenReparacion, Prisma } from "@prisma/client";
import { CreateOrdenDto } from "../dto/orden-reparacion.dto";
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

    // Ajustes de precio
    const P = PriceAdjustments.normalize({
      descuento: input.descuento,
      incremento: input.incremento,
      incrementoInterno: input.incrementoInterno,
      porcentajeRecargo: input.porcentajeRecargo,
    });

    // Mapear VOs
    const mecanicos = (input.mecanicos ?? []).map(MecanicoRef.from);
    const repuestos = (input.repuestosUsados ?? []).map(
      (r): RepuestoUsadoVO =>
        RepuestoUsadoVO.from({
          stockId: r.stock.id,
          unidadesConsumidas: r.unidadesConsumidas,
          precioCompra: r.precioCompra,
          precioVenta: r.precioVenta,
          stockName: r.stock?.name,
        } as RepuestoUsadoProps)
    );
    const trabajos = (input.trabajosRealizados ?? []).map(
      (t): TrabajoRealizado =>
        TrabajoRealizado.from({
          descripcion: t.manoDeObra?.name ?? t.descripcion ?? "",
          precioUnitario: t.precioUnitario,
          diasParaRecordatorio: t.diasParaRecordatorio ?? null,
        } as TrabajoRealizadoProps)
    );

    const terceros = await Promise.all(
      (input.reparacionesDeTercero ?? []).map((t) =>
        ReparacionTercero.from(
          {
            nombre: t.nombre,
            proveedorId: t.proveedor.id,
            precioCompra: t.precioCompra,
            precioVenta: t.precioVenta,
            recibo: t.recibo,
          } as ReparacionTerceroProps,
          this.files
        )
      )
    );

    // Generar acciones de stock para los repuestos
    const stockActions = this.stockManager.generateTakeActions(repuestos);

    // Validar stock suficiente
    await this.inventory.ensureSufficient(stockActions);

    const fechaCreacion = input.fechaCreacion
      ? new Date(input.fechaCreacion)
      : new Date();
    const dolar = await this.exchange.getForDate(fechaCreacion);

    const controles = await tx.controlMecanico.findMany();

    const orden = await this.repo.create(tx, {
      data: {
        autoId: Number(input.autoId),
        fechaCreacion,
        fechaEntradaReparacion: input.fechaEntradaReparacion ?? null,
        fechaSalidaReparacion: input.fechaSalidaReparacion ?? null,
        dolarId: dolar?.id ?? null,
        kilometros: input.kilometros ?? null,
        observacionesCliente: input.observacionesCliente,
        observacionesOcultas: input.observacionesOcultas ?? null,
        observacionesEntrada: input.observacionesEntrada ?? "[]",
        observacionesSalida: input.observacionesSalida ?? "[]",
        estado: estado.value,
        pdfPath: input.pdfPath ?? null,
        descuento: new Prisma.Decimal(P.descuento),
        descripcionDescuento: input.descripcionDescuento ?? null,
        incremento: new Prisma.Decimal(P.incremento),
        descripcionIncremento: input.descripcionIncremento ?? null,
        incrementoInterno: new Prisma.Decimal(P.incrementoInterno),
        porcentajeRecargo: new Prisma.Decimal(P.porcentajeRecargo),

        mecanicos: { create: mecanicos.map((m) => ({ mecanicoId: m.id })) },
        repuestosUsados: {
          create: repuestos.map((r) => ({
            precioCompra: r.precioCompra.asDecimal(),
            precioVenta: r.precioVenta.asDecimal(),
            unidadesConsumidas: r.unidadesConsumidas,
            stock: { connect: { id: r.stockId } },
          })),
        },
        reparacionesDeTercero: {
          create: terceros.map((t) => ({
            nombre: t.nombre,
            precioCompra: t.precioCompra.asDecimal(),
            precioVenta: t.precioVenta.asDecimal(),
            proveedor: { connect: { id: t.proveedorId } },
            recibo: t.recibo,
          })),
        },
        trabajosRealizados: {
          create: trabajos.map((t) => ({
            descripcion: t.descripcion,
            precioUnitario: t.precioUnitario.asDecimal(),
            diasParaRecordatorio: t.diasParaRecordatorio,
          })),
        },
        controlesEnReparacion: {
          create: controles.map((c: any) => ({
            controlMecanicoId: c.id,
            valor: c.type === "checkbox" ? "false" : "",
          })),
        },
      },
      include: {
        auto: { include: { owner: true } },
        mecanicos: true,
        repuestosUsados: true,
        reparacionesDeTercero: true,
        trabajosRealizados: true,
        controlesEnReparacion: true,
        pagos: true,
      },
    });

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
