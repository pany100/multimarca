import type { ListTurnosParams, ListTurnosResult } from "@/core/domain/repositories/turno.repository";
import type { TurnoService } from "@/core/application/services/turno.service";

export type ListTurnosInput = ListTurnosParams;
export type ListTurnosOutput = ListTurnosResult;

export class ListTurnosUseCase {
  constructor(private readonly turnoService: TurnoService) {}

  async execute(input: ListTurnosInput): Promise<ListTurnosOutput> {
    return this.turnoService.list(input);
  }
}
