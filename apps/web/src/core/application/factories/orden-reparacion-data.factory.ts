import { FileStoragePort } from "@/core/domain/ports/file-storage.port";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { MecanicoRef } from "@/core/domain/value-objects/mecanico-ref.vo";
import { OrdenReparacionVO } from "@/core/domain/value-objects/orden-reparacion.vo";
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
import { PrismaControlMecanicoRepository } from "@/core/infrastructure/database/repositories/prisma-control-mecanico.repository";
import { DolarExchangeAdapter } from "@/core/infrastructure/external/dolar-exchange.adapter";
import { S3FileStorageAdapter } from "@/core/infrastructure/external/s3-file-storage.adapter";
import { EstadoOrdenReparacion, Prisma } from "@prisma/client";
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
  estado: EstadoOrden;
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

    const estado = EstadoOrden.from(
      input.estado ?? EstadoOrdenReparacion.Presupuestado
    );

    return {
      priceAdjustments,
      mecanicos,
      repuestos,
      trabajos,
      terceros,
      estado,
    };
  }

  static createCreateDataToPersist(
    ordenReparacion: OrdenReparacionVO
  ): OrdenReparacionCreateData {
    return {
      data: {
        autoId: Number(ordenReparacion.autoId),
        fechaCreacion: ordenReparacion.fechaCreacion,
        fechaEntradaReparacion: ordenReparacion.fechaEntradaReparacion ?? null,
        fechaSalidaReparacion: ordenReparacion.fechaSalidaReparacion ?? null,
        dolarId: ordenReparacion.dolarId ?? null,
        kilometros: ordenReparacion.kilometros ?? null,
        observacionesCliente: ordenReparacion.observacionesCliente,
        observacionesOcultas: ordenReparacion.observacionesOcultas ?? null,
        observacionesEntrada: ordenReparacion.observacionesEntrada ?? "[]",
        observacionesSalida: ordenReparacion.observacionesSalida ?? "[]",
        estado: ordenReparacion.estado.toPrisma(),
        pdfPath: ordenReparacion.pdfPath ?? null,
        descuento: new Prisma.Decimal(ordenReparacion.descuento),
        descripcionDescuento: ordenReparacion.descripcionDescuento ?? null,
        incremento: new Prisma.Decimal(ordenReparacion.incremento),
        descripcionIncremento: ordenReparacion.descripcionIncremento ?? null,
        incrementoInterno: new Prisma.Decimal(
          ordenReparacion.incrementoInterno
        ),
        porcentajeRecargo: new Prisma.Decimal(
          ordenReparacion.porcentajeRecargo
        ),

        mecanicos: {
          create: ordenReparacion.mecanicosVO.map((m) => ({
            mecanicoId: m.id,
            detalle: m.detalle,
          })),
        },
        repuestosUsados: {
          create: ordenReparacion.repuestosVO.map((r) => ({
            precioCompra: r.precioCompra.asDecimal(),
            precioVenta: r.precioVenta.asDecimal(),
            unidadesConsumidas: r.unidadesConsumidas,
            stock: { connect: { id: r.stockId } },
          })),
        },
        reparacionesDeTercero: {
          create: ordenReparacion.tercerosVO.map((t) => ({
            nombre: t.nombre,
            precioCompra: t.precioCompra.asDecimal(),
            precioVenta: t.precioVenta.asDecimal(),
            proveedor: { connect: { id: t.proveedorId } },
            recibo: t.recibo,
          })),
        },
        trabajosRealizados: {
          create: ordenReparacion.trabajosVO.map((t) => ({
            descripcion: t.descripcion,
            precioUnitario: t.precioUnitario.asDecimal(),
            diasParaRecordatorio: t.diasParaRecordatorio,
          })),
        },
        controlesEnReparacion: {
          create: ordenReparacion.controlesEnReparacion.map((c: any) => ({
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

  static async transformInputToVO(
    input: CreateOrdenDto
  ): Promise<OrdenReparacionVO> {
    // Transform to individual VOs first
    const fileService = new S3FileStorageAdapter();
    const exchange = new DolarExchangeAdapter();
    const controlMecanico = new PrismaControlMecanicoRepository();
    const {
      priceAdjustments,
      mecanicos,
      repuestos,
      trabajos,
      terceros,
      estado,
    } = await this.transformInput(input, fileService);
    const fechaCreacion = input.fechaCreacion
      ? new Date(input.fechaCreacion)
      : new Date();
    const dolar = await exchange.getForDate(fechaCreacion);

    const controles = await controlMecanico.findMany();
    return OrdenReparacionVO.from({
      priceAdjustmentsVO: priceAdjustments,
      mecanicosVO: mecanicos,
      repuestosVO: repuestos,
      trabajosVO: trabajos,
      tercerosVO: terceros,
      autoId: input.autoId,
      fechaEntradaReparacion: input.fechaEntradaReparacion,
      fechaSalidaReparacion: input.fechaSalidaReparacion,
      fechaCreacion: fechaCreacion,
      kilometros: input.kilometros,
      observacionesCliente: input.observacionesCliente,
      observacionesEntrada: input.observacionesEntrada,
      observacionesSalida: input.observacionesSalida,
      observacionesOcultas: input.observacionesOcultas,
      estado,
      controlesEnReparacion: controles,
      pdfPath: input.pdfPath,
      descuento: input.descuento,
      descripcionDescuento: input.descripcionDescuento,
      incremento: input.incremento,
      descripcionIncremento: input.descripcionIncremento,
      incrementoInterno: input.incrementoInterno,
      porcentajeRecargo: input.porcentajeRecargo,
      dolarId: dolar?.id,
    });
  }
}
