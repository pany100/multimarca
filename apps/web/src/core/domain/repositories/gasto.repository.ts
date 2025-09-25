export interface GastoRepository {
  getGastoMecanicosUltimaSemana(from: Date, to: Date): Promise<any>;
}
