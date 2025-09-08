import {
  ClienteRepository,
  ClienteWithRelations,
} from "@/core/domain/repositories/cliente.repository";

export class ClienteService {
  constructor(private readonly repo: ClienteRepository) {}

  findById(id: number): Promise<ClienteWithRelations> {
    const cliente = this.repo.findById(id);
    if (!cliente) {
      throw new Error("Cliente no encontrado");
    }
    return cliente;
  }
}
