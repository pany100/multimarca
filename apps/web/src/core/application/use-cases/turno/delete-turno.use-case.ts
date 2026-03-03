import type { TurnoService } from "@/core/application/services/turno.service";

export type DeleteTurnoInput = { id: number };
export type DeleteTurnoOutput = void;

export class DeleteTurnoUseCase {
  constructor(private readonly turnoService: TurnoService) {}

  async execute(input: DeleteTurnoInput): Promise<DeleteTurnoOutput> {
    await this.turnoService.delete(input.id);
  }
}
