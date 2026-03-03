import type { CreateTurnoData } from "@/core/domain/repositories/turno.repository";
import type { TurnoService } from "@/core/application/services/turno.service";

export type CreateTurnoInput = CreateTurnoData;
export type CreateTurnoOutput = any;

export class CreateTurnoUseCase {
  constructor(private readonly turnoService: TurnoService) {}

  async execute(input: CreateTurnoInput): Promise<CreateTurnoOutput> {
    return this.turnoService.create(input);
  }
}
