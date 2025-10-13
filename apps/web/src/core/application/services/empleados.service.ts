import { EmpleadoRepository } from "@/core/domain/repositories/empleado.repository";
import {
  CreateMecanicoData,
  ListMecanicosQueryData,
} from "@/core/infrastructure/validation/schemas/mecanico.schema";
import { PageResult } from "@/shared/utils/pagination";
import { Empleado } from "@prisma/client";
import { EmpleadoVOMapper } from "../mapper/empleado-vo.mapper";

export class EmpleadoService {
  constructor(private readonly repo: EmpleadoRepository) {}

  private transformToSerializable(empleado: Empleado) {
    return {
      ...empleado,
      dni: empleado.dni ? empleado.dni.toString() : null,
    };
  }

  async findAll(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>> {
    const result = await this.repo.listPaged(dto);
    const empleadosSerializables = result.items.map((empleado) =>
      this.transformToSerializable(empleado)
    );
    return {
      items: empleadosSerializables,
      total: result.total,
      page: result.page,
      size: result.size,
      totalPages: result.totalPages,
    };
  }

  async create(dto: CreateMecanicoData): Promise<Empleado> {
    const empleadoVO = EmpleadoVOMapper.transformDtoToVo(dto);
    const empleado = await this.repo.create(empleadoVO);
    const empleadoSerializable = this.transformToSerializable(empleado);
    return empleadoSerializable;
  }

  async findById(id: number): Promise<Empleado | null> {
    const empleado = await this.repo.findById(id);
    if (!empleado) {
      throw new Error("Empleado no encontrado");
    }
    const empleadoSerializable = this.transformToSerializable(empleado);
    return empleadoSerializable;
  }

  async delete(id: number): Promise<Empleado | null> {
    return this.repo.delete(id);
  }
}
