export class MecanicoRef {
  private constructor(
    public readonly id: number,
    public readonly detalle: string
  ) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("Mecánico inválido");
  }
  static from(p: { id: number; detalle?: string | null }) {
    return new MecanicoRef(Number(p.id), p.detalle ?? "");
  }
}
