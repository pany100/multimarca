export interface TipoDeOperacionRepository {
  delete(id: number): Promise<void>;
  findById(id: number): Promise<any>;
}
