import type { UpdateTurnoData } from "@/core/domain/repositories/turno.repository";
import type { TurnoService } from "@/core/application/services/turno.service";

export type UpdateTurnoInput = { id: number; data: UpdateTurnoData };
export type UpdateTurnoOutput = any;

export class UpdateTurnoUseCase {
  constructor(private readonly turnoService: TurnoService) {}

  async execute(input: UpdateTurnoInput): Promise<UpdateTurnoOutput> {
    return this.turnoService.update(input.id, input.data);
  }
}
