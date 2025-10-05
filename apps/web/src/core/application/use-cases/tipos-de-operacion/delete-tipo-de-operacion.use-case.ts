import { TipoDeOperacionRepository } from "@/core/domain/repositories/tipo-de-operacion.repository";
import { TransaccionesQueriesService } from "@/core/infrastructure/database/queries/transacciones-queries.service";

export class DeleteTipoDeOperacionUseCase {
  constructor(
    private readonly tipoDeOperacionRepository: TipoDeOperacionRepository,
    private readonly transaccionesQueriesService: TransaccionesQueriesService
  ) {}

  async execute(id: number) {
    const tipoDeOperacion = await this.tipoDeOperacionRepository.findById(id);
    if (!tipoDeOperacion) {
      throw new Error("Tipo de operación no encontrado");
    }
    const totalObject =
      await this.transaccionesQueriesService.getCountTransaccionesByTipo(id);
    console.log(totalObject);
    console.log(totalObject[0].total_transacciones);
    console.log(totalObject[0].total_transacciones > 0);
    if (totalObject[0].total_transacciones > 0) {
      throw new Error(
        `No se puede eliminar el tipo de operación porque tiene ${totalObject[0].total_transacciones} transacciones asociadas`
      );
    }
    return this.tipoDeOperacionRepository.delete(id);
  }
}
