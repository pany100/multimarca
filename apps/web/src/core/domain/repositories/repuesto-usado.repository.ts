export type UpdateRepuestoUsadoData = {
  stockId?: number;
  precioCompra?: number;
  precioVenta?: number;
  unidadesConsumidas?: number;
  ocultoParaCliente?: boolean;
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
};

export type AddRepuestoUsadoData = {
  ordenReparacionId?: number;
  ventaId?: number;
  presupuestoId?: number;
  stockId: number;
  precioCompra: number;
  precioVenta: number;
  unidadesConsumidas: number;
  ocultoParaCliente?: boolean;
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
};

export interface RepuestoUsadoRepository {
  findById(id: number): Promise<any>;

  add(data: AddRepuestoUsadoData, deps?: { tx?: any }): Promise<any>;

  update(id: number, data: UpdateRepuestoUsadoData, deps?: { tx?: any }): Promise<any>;

  delete(id: number, deps?: { tx?: any }): Promise<any>;
}
