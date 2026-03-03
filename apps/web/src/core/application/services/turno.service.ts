import type { FeriadoRepository } from "@/core/domain/repositories/feriado.repository";
import type {
  CreateTurnoData,
  ListTurnosParams,
  ListTurnosResult,
  TurnoRepository,
  UpdateTurnoData,
} from "@/core/domain/repositories/turno.repository";

export class TurnoService {
  constructor(
    private readonly turnoRepo: TurnoRepository,
    private readonly feriadoRepo: FeriadoRepository,
  ) {}

  async list(params: ListTurnosParams): Promise<ListTurnosResult> {
    return this.turnoRepo.findMany(params);
  }

  async getById(id: number): Promise<any | null> {
    return this.turnoRepo.findById(id);
  }

  async create(data: CreateTurnoData): Promise<any> {
    const requestDate = new Date(data.fecha);
    requestDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (requestDate < today) {
      throw new Error("No se pueden crear turnos para fechas pasadas");
    }

    if (!data.autoId && !data.informacionAuto) {
      throw new Error(
        "Debe seleccionar un vehículo o ingresar información del vehículo nuevo",
      );
    }

    const esFeriado = await this.feriadoRepo.existsByFecha(requestDate);
    if (esFeriado) {
      throw new Error("No se pueden crear turnos en días feriados");
    }

    return this.turnoRepo.create(data);
  }

  async update(id: number, data: UpdateTurnoData): Promise<any> {
    const current = await this.turnoRepo.findById(id);
    if (!current) {
      throw new Error("Turno no encontrado");
    }

    const turnoDate = new Date(current.fecha);
    turnoDate.setHours(0, 0, 0, 0);

    if (!data.autoId && !data.informacionAuto) {
      throw new Error(
        "Debe seleccionar un vehículo o ingresar información del vehículo nuevo",
      );
    }

    const requestDate = new Date(data.fecha);
    requestDate.setHours(0, 0, 0, 0);
    const esFeriado = await this.feriadoRepo.existsByFecha(requestDate);
    if (esFeriado) {
      throw new Error("No se pueden programar turnos en días feriados");
    }

    return this.turnoRepo.update(id, data);
  }

  async patchVino(id: number, vino: boolean): Promise<any> {
    const current = await this.turnoRepo.findById(id);
    if (!current) {
      throw new Error("Turno no encontrado");
    }
    return this.turnoRepo.updateVino(id, vino);
  }

  async delete(id: number): Promise<void> {
    const current = await this.turnoRepo.findById(id);
    if (!current) {
      throw new Error("Turno no encontrado");
    }
    await this.turnoRepo.delete(id);
  }
}
