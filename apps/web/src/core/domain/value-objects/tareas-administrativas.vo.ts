export type TareasAdministrativasProps = {
  usuarioId: number;
  descripcion: string;
};

export class TareasAdministrativasVO {
  constructor(
    public readonly usuarioId: number,
    public readonly descripcion: string
  ) {}

  static from(props: TareasAdministrativasProps): TareasAdministrativasVO {
    return new TareasAdministrativasVO(props.usuarioId, props.descripcion);
  }
}
