export type RolUsuarioResumen = {
  id: number;
  fullName: string;
  email: string;
  username: string;
};

export type RolDetalle = {
  id: number;
  name: string;
  permisos: string[];
  usuarios: RolUsuarioResumen[];
};
