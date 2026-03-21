import type { FeriadoRepository } from "@/core/domain/repositories/feriado.repository";
import type {
  CreateTurnoData,
  ListTurnosParams,
  ListTurnosResult,
  TurnoRepository,
  UpdateTurnoData,
} from "@/core/domain/repositories/turno.repository";
import { TURNOS_TIMEZONE } from "@/lib/turno-fecha-tz";
import { formatInTimeZone } from "date-fns-tz";

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
    const requestDay = formatInTimeZone(
      new Date(data.fecha),
      TURNOS_TIMEZONE,
      "yyyy-MM-dd",
    );
    const todayDay = formatInTimeZone(new Date(), TURNOS_TIMEZONE, "yyyy-MM-dd");

    if (requestDay < todayDay) {
      throw new Error("No se pueden crear turnos para fechas pasadas");
    }

    if (!data.autoId && !data.informacionAuto) {
      throw new Error(
        "Debe seleccionar un vehículo o ingresar información del vehículo nuevo",
      );
    }

    const esFeriado = await this.feriadoRepo.existsByFecha(new Date(data.fecha));
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

    if (!data.autoId && !data.informacionAuto) {
      throw new Error(
        "Debe seleccionar un vehículo o ingresar información del vehículo nuevo",
      );
    }

    const esFeriado = await this.feriadoRepo.existsByFecha(new Date(data.fecha));
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
