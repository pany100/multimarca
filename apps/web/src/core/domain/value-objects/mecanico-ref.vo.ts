export class MecanicoRef {
  private constructor(public readonly id: number) {
    if (!Number.isInteger(id) || id <= 0) throw new Error("Mecánico inválido");
  }
  static from(p: { id: number }) {
    return new MecanicoRef(Number(p.id));
  }
}
