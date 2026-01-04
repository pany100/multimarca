export interface RepuestoUsadoRepository {
  findById(id: number): Promise<any>;

  add(
    data: {
      ordenReparacionId?: number;
      ventaId?: number;
      presupuestoId?: number;
      stockId: number;
      precioCompra: number;
      precioVenta: number;
      unidadesConsumidas: number;
    },
    deps?: { tx?: any }
  ): Promise<any>;

  update(
    id: number,
    data: {
      stockId?: number;
      precioCompra?: number;
      precioVenta?: number;
      unidadesConsumidas?: number;
    },
    deps?: { tx?: any }
  ): Promise<any>;

  delete(id: number, deps?: { tx?: any }): Promise<any>;
}
