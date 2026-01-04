import { hasAllRequiredFields } from "@/core/domain/policies/orden-reparacion.policy";
import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { EstadoOrden } from "@/core/domain/value-objects/estado-orden.vo";
import { patchOrdenV2Schema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { EstadoOrdenReparacion } from "@prisma/client";
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

    // Validación de estado "terminada"
    if (dto.estado) {
      const estado = EstadoOrden.from(dto.estado as EstadoOrdenReparacion);
      if (estado.isTerminado()) {
        // Combinar datos existentes con los del patch para validar
        const dataToValidate = {
          ...ordenExistente,
          ...dto,
          mecanicos: ordenExistente.mecanicos?.map((m: any) => ({
            mecanicoId: m.mecanico?.id || m.mecanicoId,
          })),
          repuestosUsados: ordenExistente.repuestosUsados,
          reparacionesDeTercero: ordenExistente.reparacionesDeTercero,
          trabajosRealizados: ordenExistente.trabajosRealizados,
        };
        if (!hasAllRequiredFields(dataToValidate)) {
          throw new Error(
            "Para finalizar, se requieren mecánicos, fechas y al menos un trabajo/repuesto/tercero."
          );
        }
      }
    }

    // Validaciones de negocio
    if (
      dto.kilometros !== undefined &&
      dto.kilometros !== null &&
      dto.kilometros < 0
    ) {
      throw new Error("Los kilómetros no pueden ser negativos");
    }

    // Delegar al repositorio la lógica de mapeo y actualización
    const order = await this.ordenRepository.patchOrden(ordenId, dto);

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
