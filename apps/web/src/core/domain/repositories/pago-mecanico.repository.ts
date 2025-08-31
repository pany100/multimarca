export type PagoMecanicoData = {
  ordenReparacionId: number;
};

export interface PagoMecanicoRepository {
  create(data: PagoMecanicoData): Promise<any>;
}
