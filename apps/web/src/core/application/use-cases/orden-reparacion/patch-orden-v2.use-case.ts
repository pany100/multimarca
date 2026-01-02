import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { patchOrdenV2Schema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { z } from "zod";

type PatchOrdenV2Dto = z.infer<typeof patchOrdenV2Schema>;

export class PatchOrdenV2UseCase {
  constructor(private ordenRepository: OrdenReparacionRepository) {}

  async execute(dto: PatchOrdenV2Dto) {
    const ordenId = parseInt(dto.id);

    // Verificar que la orden existe
    const ordenExistente = await this.ordenRepository.findById(ordenId);
    if (!ordenExistente) {
      throw new Error("Orden de reparación no encontrada");
    }

    // Preparar datos para actualizar (solo los campos que vienen en el DTO)
    const dataToUpdate: any = {};

    if (dto.autoId !== undefined) {
      dataToUpdate.autoId = dto.autoId;
    }

    if (dto.kilometros !== undefined) {
      dataToUpdate.kilometros = dto.kilometros;
    }

    if (dto.observacionesCliente !== undefined) {
      dataToUpdate.observacionesCliente = dto.observacionesCliente;
    }

    if (dto.estado !== undefined) {
      dataToUpdate.estado = dto.estado;
    }

    if (dto.observacionesInternas !== undefined) {
      dataToUpdate.observacionesInternas = dto.observacionesInternas;
    }

    if (dto.observacionesSalida !== undefined) {
      dataToUpdate.observacionesSalida = dto.observacionesSalida;
    }

    if (dto.observacionesOcultas !== undefined) {
      dataToUpdate.observacionesOcultas = dto.observacionesOcultas;
    }

    if (dto.fechaEntradaReparacion !== undefined) {
      dataToUpdate.fechaEntradaReparacion = dto.fechaEntradaReparacion;
    }

    if (dto.fechaSalidaReparacion !== undefined) {
      dataToUpdate.fechaSalidaReparacion = dto.fechaSalidaReparacion;
    }

    // Validaciones de negocio
    if (dto.autoId !== undefined) {
      // Aquí podrías agregar validaciones adicionales, como verificar que el auto existe
      // Por ahora dejamos que Prisma maneje la foreign key constraint
    }

    if (
      dto.kilometros !== undefined &&
      dto.kilometros !== null &&
      dto.kilometros < 0
    ) {
      throw new Error("Los kilómetros no pueden ser negativos");
    }

    // Actualizar la orden
    const order = await this.ordenRepository.updatePartial(
      ordenId,
      dataToUpdate
    );

    // Procesar la orden actualizada igual que GetOrdenUseCase
    const { mecanicos, ...ordenReparacionWithoutMecanicos } = order;
    const mecanicosWithoutMecanico = mecanicos.map(
      (el: {
        mecanico: { id: number; name: string };
        detalle: string | null;
      }) => ({
        id: el.mecanico.id,
        name: el.mecanico.name,
        detalle: el.detalle,
      })
    );
    const comprobanteCalculado = ComprobanteCalculadoFactory.fromOrden(order);
    const reparacionesDeTercero = order.reparacionesDeTercero.map(
      (el: {
        reciboFile: { finalPath?: string; tempPath?: string };
        precioVenta: number;
      }) => ({
        ...el,
        recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
        precioConRecargo: comprobanteCalculado.getPrecioFinalForReparaciones(
          el.precioVenta
        ),
      })
    );

    return {
      ...ordenReparacionWithoutMecanicos,
      mecanicos: mecanicosWithoutMecanico,
      reparacionesDeTercero,
      recibos: order.recibosFiles.map(
        (el: { finalPath?: string; tempPath?: string }) =>
          el.finalPath || el.tempPath || null
      ),
      pdfPath:
        order.scannerFile?.finalPath || order.scannerFile?.tempPath || null,
      total: comprobanteCalculado.total,
      totalPagado: comprobanteCalculado.totalPagado,
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
      totalRepuestos: comprobanteCalculado.totalRepuestos,
      totalReparacionesDeTerceros: comprobanteCalculado.totalTerceros,
      deuda: comprobanteCalculado.deuda,
    };
  }
}
