// src/core/application/use-cases/orden-reparacion/create-orden.use-case.ts
import type { CreateOrdenDto } from "@/core/application/dto/orden-reparacion.dto";
import type { ExchangeRatePort } from "@/core/domain/ports/exchange-rate.port";
import type { FileStoragePort } from "@/core/domain/ports/file-storage.port";
import type { InventoryPort } from "@/core/domain/ports/inventory.port";
import type { NotifierPort } from "@/core/domain/ports/notifier.port";
import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import type { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
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
} from "@/core/domain/value-objects/repuesto-usado.vo";
import {
  TrabajoRealizado,
  TrabajoRealizadoProps,
} from "@/core/domain/value-objects/trabajo-realizado.vo";
import { EstadoOrdenReparacion, Prisma } from "@prisma/client";

export class CreateOrdenUseCase {
  constructor(
    private readonly repo: OrdenReparacionRepository,
    private readonly exchange: ExchangeRatePort,
    private readonly files: FileStoragePort,
    private readonly notifier: NotifierPort,
    private readonly uow: UnitOfWork,
    private readonly inventory: InventoryPort
  ) {}

  async execute(input: CreateOrdenDto) {
    const estado = EstadoOrden.from(
      input.estado ?? EstadoOrdenReparacion.Presupuestado
    );
    // Validación de “terminada”
    if (estado.isTerminado()) {
      const ok =
        (input.mecanicos?.length ?? 0) > 0 &&
        input.fechaEntradaReparacion &&
        input.fechaSalidaReparacion &&
        ((input.repuestosUsados?.length ?? 0) > 0 ||
          (input.reparacionesDeTercero?.length ?? 0) > 0 ||
          (input.trabajosRealizados?.length ?? 0) > 0);
      if (!ok)
        throw new Error(
          "Para finalizar, se requieren mecánicos, fechas y al menos un trabajo/repuesto/tercero."
        );
    }

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
      (r): RepuestoUsado =>
        RepuestoUsado.from({
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
    const tercerosRaw = await Promise.all(
      (input.reparacionesDeTercero ?? []).map(async (t) => {
        let recibo = t.recibo ?? null;
        if (recibo && typeof recibo === "string" && recibo.includes("/tmp/")) {
          recibo = await this.files.moveTempTo(recibo, "recibos");
        }
        return { ...t, recibo };
      })
    );
    const terceros = tercerosRaw.map(
      (t): ReparacionTercero =>
        ReparacionTercero.from({
          nombre: t.nombre,
          proveedorId: t.proveedor.id,
          precioCompra: t.precioCompra,
          precioVenta: t.precioVenta,
          recibo: t.recibo,
        } as ReparacionTerceroProps)
    );

    // Validar stock suficiente
    await this.inventory.ensureSufficient(
      repuestos.map((r) => ({
        stockId: r.stockId,
        units: r.unidadesConsumidas,
        name: r.stockName,
      }))
    );

    const fechaCreacion = input.fechaCreacion
      ? new Date(input.fechaCreacion)
      : new Date();
    const dolar = await this.exchange.getForDate(fechaCreacion);

    const creada = await this.uow.run(async ({ tx }) => {
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
        await this.inventory.consumeAndNotify(
          repuestos.map((r) => ({
            stockId: r.stockId,
            units: r.unidadesConsumidas,
          })),
          { tx }
        );
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

      return orden;
    });

    this.notifier.emit("newNotification");
    return creada;
  }
}
