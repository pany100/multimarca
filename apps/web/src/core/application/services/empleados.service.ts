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

  async findAll(dto: ListMecanicosQueryData): Promise<PageResult<Empleado>> {
    const result = await this.repo.listPaged(dto);
    const empleadosSerializables = result.items.map((empleado) => ({
      ...empleado,
      dni: empleado.dni ? empleado.dni.toString() : null,
    }));
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
    const empleadoSerializable = {
      ...empleado,
      dni: empleado.dni ? empleado.dni.toString() : null,
    };
    return empleadoSerializable;
  }
}
