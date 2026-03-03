import type { TurnoService } from "@/core/application/services/turno.service";

export type PatchTurnoVinoInput = { id: number; vino: boolean };
export type PatchTurnoVinoOutput = any;

export class PatchTurnoVinoUseCase {
  constructor(private readonly turnoService: TurnoService) {}

  async execute(input: PatchTurnoVinoInput): Promise<PatchTurnoVinoOutput> {
    return this.turnoService.patchVino(input.id, input.vino);
  }
}
