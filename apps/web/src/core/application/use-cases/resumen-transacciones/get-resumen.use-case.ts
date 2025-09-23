import { UsuarioRepository } from "@/core/domain/repositories/usuario.repository";
import { GetResumenesDto } from "../../dto/resumen.dto";
import { ResumenTransaccionesService } from "../../services/resumen-transacciones.service";

export class GetResumenUseCase {
  constructor(
    private readonly usuarioRepository: UsuarioRepository,
    private readonly resumenTransaccionesService: ResumenTransaccionesService
  ) {}

  async execute(dto: GetResumenesDto) {
    const user = await this.usuarioRepository.findById(dto.decodedToken.userId);
    if (!user || !user.rol) {
      throw new Error("Usuario no tiene rol asignado");
    }

    const resumen =
      await this.resumenTransaccionesService.getResumenTransacciones(dto);
    return resumen;
  }
}
