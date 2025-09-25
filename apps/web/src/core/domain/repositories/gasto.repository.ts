export interface GastoRepository {
  getGastoMecanicosUltimaSemana(from: Date, to: Date): Promise<any>;
  getGastoMecanicosUltimaSemanaCompartida(from: Date, to: Date): Promise<any>;
}
