import { PatchVentaDto } from "@/core/application/dto/venta.dto";
import {
  VentaRepository,
  VentaWithRelations,
} from "@/core/domain/repositories/venta.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";

export class PatchVentaUseCase {
  constructor(private readonly ventaRepository: VentaRepository) {}

  async execute(dto: PatchVentaDto): Promise<VentaWithRelations> {
    const ventaId = Number(dto.id);

    // Verificar que la venta existe
    const ventaExistente = await this.ventaRepository.findById(ventaId);
    if (!ventaExistente) {
      throw new Error("Venta no encontrada");
    }

    // Validaciones de negocio
    if (dto.estado === "Cerrado" && ventaExistente.estado !== "Cerrado") {
      const tieneTrabajosRealizados =
        ventaExistente.trabajosRealizados.length > 0;
      const tieneMecanicos = ventaExistente.mecanicos.length > 0;

      if (tieneTrabajosRealizados && !tieneMecanicos) {
        throw new Error(
          "No se puede cerrar la venta: debe asignar al menos un mecánico cuando hay trabajos de mano de obra"
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (dto.clienteId !== undefined) updateData.clienteId = dto.clienteId;
    if (dto.informacionCliente !== undefined)
      updateData.informacionCliente = dto.informacionCliente;
    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.descuento !== undefined) updateData.descuento = dto.descuento;
    if (dto.descripcionDescuento !== undefined)
      updateData.descripcionDescuento = dto.descripcionDescuento;
    if (dto.incremento !== undefined) updateData.incremento = dto.incremento;
    if (dto.descripcionIncremento !== undefined)
      updateData.descripcionIncremento = dto.descripcionIncremento;
    if (dto.porcentajeRecargo !== undefined)
      updateData.porcentajeRecargo = dto.porcentajeRecargo;
    if (dto.estado !== undefined) updateData.estado = dto.estado;
    if (dto.cedulaFilePath !== undefined)
      updateData.cedulaFilePath = dto.cedulaFilePath;
    if (dto.ajustesPrecio !== undefined)
      updateData.ajustesPrecio = dto.ajustesPrecio;
    if (dto.modoAjustes !== undefined)
      updateData.modoAjustes = dto.modoAjustes;
    if (dto.descuentoParaManoDeObra !== undefined)
      updateData.descuentoParaManoDeObra = dto.descuentoParaManoDeObra;

    // Delegar al repositorio la lógica de mapeo y actualización
    const venta = await this.ventaRepository.patchVenta(ventaId, updateData);

    // Procesar la venta actualizada
    const comprobanteCalculado = ComprobanteCalculadoFactory.fromVenta(venta);

    const reparacionesDeTercero = venta.reparacionesDeTercero.map((el) => ({
      ...el,
      recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
      precioConRecargo: comprobanteCalculado.getPrecioFinalForReparaciones(
        Number(el.precioVenta)
      ),
    }));

    const totalPagado = venta.ingresos.reduce(
      (sum, ingreso) => sum + Number(ingreso.monto),
      0
    );

    const cedulaPath =
      venta.cedulaFile?.finalPath || venta.cedulaFile?.tempPath || null;

    const mecanicos = venta.mecanicos.map(
      (el: {
        id: number;
        mecanicoId: number;
        mecanico: { id: number; name: string };
        detalle: string | null;
      }) => ({
        id: el.mecanico.id,
        mecanicoVentaId: el.id,
        name: el.mecanico.name,
        detalle: el.detalle,
      })
    );

    return {
      ...venta,
      cedulaPath,
      reparacionesDeTercero,
      mecanicos,
      precioTotal: comprobanteCalculado.total,
      total: comprobanteCalculado.total,
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
      totalRepuestos: comprobanteCalculado.totalRepuestos,
      totalReparacionesDeTerceros: comprobanteCalculado.totalTerceros,
      totalPagado,
    } as any;
  }
}
