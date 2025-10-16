export interface TareaDiaria {
  id: number;
  descripcion: string;
  realizado: boolean;
  fecha: string;
  usuarioId: number;
  usuario?: {
    id: number;
    fullName: string;
    username: string;
  };
}

export interface TareasAgrupadasPorFecha {
  [fecha: string]: TareaDiaria[];
}
