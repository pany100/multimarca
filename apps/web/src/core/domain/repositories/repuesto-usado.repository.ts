export interface RepuestoUsadoRepository {
  add(
    data: {
      ordenReparacionId: number;
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

  delete(id: number): Promise<any>;
}
