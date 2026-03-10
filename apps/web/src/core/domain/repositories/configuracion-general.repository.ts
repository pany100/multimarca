export type ConfiguracionGeneral = {
  id: number;
  nombre: string;
  valor: string;
};

export interface ConfiguracionGeneralRepository {
  findById(id: number): Promise<ConfiguracionGeneral | null>;
}
