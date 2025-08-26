import type {
  CreateTareaInput,
  ListTareasParams,
  TareaDiariaRepository,
} from "@/core/domain/repositories/tarea-diaria.repository";

export class TareaDiariaService {
  constructor(private readonly repo: TareaDiariaRepository) {}

  list(params: ListTareasParams) {
    return this.repo.list(params);
  }

  create(input: CreateTareaInput) {
    return this.repo.create(input);
  }

  findById(id: number) {
    return this.repo.findById(id);
  }
  updatePartial(
    id: number,
    data: Partial<Pick<CreateTareaInput, "descripcion" | "realizado">>
  ) {
    return this.repo.updatePartial(id, data);
  }
  delete(id: number) {
    return this.repo.delete(id);
  }
}
