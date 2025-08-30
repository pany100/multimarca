import { FileStoragePort } from "@/core/domain/ports/file-storage.port";
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
import { Prisma } from "@prisma/client";
import { CreateOrdenDto } from "../dto/orden-reparacion.dto";

export interface OrdenReparacionCreateData {
  data: Prisma.OrdenReparacionUncheckedCreateInput;
  include: Prisma.OrdenReparacionInclude;
}

export interface TransformedOrdenData {
  priceAdjustments: PriceAdjustments;
  mecanicos: MecanicoRef[];
  repuestos: RepuestoUsado[];
  trabajos: TrabajoRealizado[];
  terceros: ReparacionTercero[];
}

export class OrdenReparacionDataFactory {
  static async transformInput(
    input: CreateOrdenDto,
    fileService: FileStoragePort
  ): Promise<TransformedOrdenData> {
    // Ajustes de precio
    const priceAdjustments = PriceAdjustments.normalize({
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
          fileService
        )
      )
    );

    return {
      priceAdjustments,
      mecanicos,
      repuestos,
      trabajos,
      terceros,
    };
  }

  static createData(
    input: CreateOrdenDto,
    estado: EstadoOrden,
    priceAdjustments: PriceAdjustments,
    mecanicos: MecanicoRef[],
    repuestos: RepuestoUsado[],
    trabajos: TrabajoRealizado[],
    terceros: ReparacionTercero[],
    controles: any[],
    dolar: { id: number } | null,
    fechaCreacion: Date
  ): OrdenReparacionCreateData {
    return {
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
        descuento: new Prisma.Decimal(priceAdjustments.descuento),
        descripcionDescuento: input.descripcionDescuento ?? null,
        incremento: new Prisma.Decimal(priceAdjustments.incremento),
        descripcionIncremento: input.descripcionIncremento ?? null,
        incrementoInterno: new Prisma.Decimal(
          priceAdjustments.incrementoInterno
        ),
        porcentajeRecargo: new Prisma.Decimal(
          priceAdjustments.porcentajeRecargo
        ),

        mecanicos: {
          create: mecanicos.map((m) => ({ mecanicoId: m.id })),
        },
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
    };
  }
}
