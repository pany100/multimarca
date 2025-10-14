import { TipoEmpleado } from "@prisma/client";

export class EmpleadoVO {
  constructor(
    public readonly id: number | null,
    public readonly name: string,
    public readonly startDate: Date | null,
    public readonly dni: string | null,
    public readonly address: string | null,
    public readonly city: string | null,
    public readonly state: string | null,
    public readonly postalCode: string | null,
    public readonly email: string | null,
    public readonly phone: string | null,
    public readonly tipo: TipoEmpleado | undefined,
    public readonly birthday: Date | null,
    public readonly dniImagePath: string | null,
    public readonly contactoEmergencia: string | null
  ) {}
}
