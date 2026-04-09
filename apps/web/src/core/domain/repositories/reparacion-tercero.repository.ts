export interface ReparacionTerceroRepository {
  add(
    data: {
      ordenReparacionId?: number;
      ventaId?: number;
      presupuestoId?: number;
      nombre: string;
      proveedorId: number;
      precioCompra: number;
      precioVenta: number;
      iva?: number | null;
      buyIva?: number | null;
      markup?: number | null;
      recibo?: string | null;
    },
    deps?: { tx?: any }
  ): Promise<any>;

  update(
    id: number,
    data: {
      nombre?: string;
      proveedorId?: number;
      precioCompra?: number;
      precioVenta?: number;
      iva?: number | null;
      buyIva?: number | null;
      markup?: number | null;
      recibo?: string | null;
    },
    deps?: { tx?: any }
  ): Promise<any>;

  delete(id: number): Promise<any>;
}
