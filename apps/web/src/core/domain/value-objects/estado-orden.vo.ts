import { EstadoOrdenReparacion } from "@prisma/client";

export class EstadoOrden {
  private constructor(public readonly value: EstadoOrdenReparacion) {}
  static from(value: string | EstadoOrdenReparacion) {
    const v = value as EstadoOrdenReparacion;
    if (!Object.values(EstadoOrdenReparacion).includes(v)) {
      throw new Error("Estado de orden inválido");
    }
    return new EstadoOrden(v);
  }
  isPresupuestado() {
    return this.value === "Presupuestado";
  }
  isTerminado() {
    return this.value === "Terminado";
  }
  toPrisma() {
    return this.value;
  }
}
