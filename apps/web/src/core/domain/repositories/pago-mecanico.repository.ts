export type PagoMecanicoData = {
  ordenReparacionId: number;
};

export interface PagoMecanicoRepository {
  create(data: PagoMecanicoData, deps?: { tx?: any }): Promise<any>;
  findByOrdenId(id: number): Promise<any>;
}
