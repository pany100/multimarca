/**
 * Permisos de roles: orden alineado a las secciones del menú del dashboard.
 * IDs según tabla `Permiso` en BD (referencia para soporte / documentación).
 */

export type RolPermisoDef = {
  id: number;
  /** Coincide con `Permiso.name` */
  name: string;
  label: string;
};

export type RolPermisoSection = {
  title: string;
  items: RolPermisoDef[];
};

export const ROL_PERMISO_SECTIONS: RolPermisoSection[] = [
  {
    title: "Administración general",
    items: [
      { id: 1, name: "Usuarios", label: "Usuarios" },
      { id: 2, name: "Roles", label: "Roles" },
      { id: 14, name: "Mecanicos", label: "Colaboradores" },
      { id: 32, name: "AdministracionGeneral", label: "Administración general" },
      { id: 33, name: "InformacionGeneral", label: "Información general" },
      { id: 34, name: "DatosVarios", label: "Datos varios" },
    ],
  },
  {
    title: "Clientes",
    items: [
      { id: 3, name: "Clientes", label: "Clientes" },
      { id: 4, name: "Autos", label: "Vehículos" },
    ],
  },
  {
    title: "Gestión de Taller",
    items: [
      { id: 9, name: "Controles", label: "Controles" },
      { id: 10, name: "Trabajos", label: "Mano de obra" },
      { id: 8, name: "Reparaciones", label: "Presupuestos / Órdenes de reparación" },
      { id: 13, name: "PagosReparaciones", label: "Pagos a mecánicos" },
      { id: 28, name: "Agenda", label: "Agenda (feriados, turnos, tareas)" },
      { id: 29, name: "EditarManoObra", label: "Editar mano de obra" },
    ],
  },
  {
    title: "Inventario y Compras",
    items: [
      { id: 12, name: "Stock", label: "Stock" },
      { id: 11, name: "Proveedores", label: "Proveedores" },
      { id: 22, name: "OrdenesCompra", label: "Órdenes de compra" },
      { id: 23, name: "Ventas", label: "Ventas" },
    ],
  },
  {
    title: "Estadísticas y Reportes",
    items: [
      { id: 7, name: "Estadisticas", label: "Estadísticas" },
      { id: 30, name: "EstadisticasBalance", label: "Balances" },
      { id: 31, name: "EstadisticasExtracciones", label: "Estadísticas extracciones" },
    ],
  },
  {
    title: "Finanzas",
    items: [
      { id: 26, name: "Cheques", label: "Cheques" },
      { id: 25, name: "IngresoDinero", label: "Ingreso manual" },
      { id: 18, name: "RetirosDinero", label: "Extracciones" },
      { id: 16, name: "Gastos", label: "Gastos" },
      { id: 15, name: "GastosEmpleados", label: "Gastos empleados" },
      { id: 24, name: "GastosExclusivos", label: "Permisos de gastos" },
      { id: 27, name: "TipoDeOperacion", label: "Tipo de operación" },
      { id: 17, name: "CategoriaGasto", label: "Categorías de gasto" },
      { id: 21, name: "Ingresos", label: "Ingresos / deudores / caja" },
      { id: 35, name: "ResumenTransacciones", label: "Resumen transacciones" },
      { id: 36, name: "ResumenPorMecanico", label: "Resumen por mecánico (gastos)" },
      { id: 19, name: "Inversiones", label: "Inversiones" },
      { id: 20, name: "Deposito", label: "Depósito" },
    ],
  },
  {
    title: "Comunicación y Notificaciones",
    items: [
      { id: 5, name: "Notificaciones", label: "Notificaciones internas" },
      { id: 6, name: "NotificacionesClientes", label: "Notificaciones clientes (WhatsApp, etc.)" },
    ],
  },
];

/** Nombres de permiso en orden plano (todas las secciones). */
export const ROL_PERMISO_NAMES_ORDERED: string[] = ROL_PERMISO_SECTIONS.flatMap(
  (s) => s.items.map((i) => i.name),
);
