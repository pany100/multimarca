"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import authFetch from "@/utils/authFetch";
import { CategoriaGasto } from "@prisma/client";
import React from "react";
import * as yup from "yup";

interface PermisoGasto {
  id: string;
  roles: {
    id: number;
    name: string;
  }[];
}

const PermisosGastoPage = () => {
  const [roles, setRoles] = React.useState<{ id: number; name: string }[]>([]);

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const fetch = await authFetch("/api/roles");
        const response = await fetch.json();
        const roleData = response.items.map(
          (role: { id: number; name: string }) => ({
            id: role.id,
            name: role.name,
          })
        );
        setRoles(roleData);
      } catch (error) {
        console.error("Error al obtener permisos:", error);
      }
    };
    fetchRoles();
  }, []);

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "nombre", headerName: "Nombre", flex: 2 },
    {
      field: "roles",
      headerName: "Roles",
      flex: 2,
      valueGetter: (roles: any) => {
        return roles?.map((rol: any) => rol.name).join(", ") || "";
      },
    },
  ];

  const formFields: FieldConfig[] = [
    {
      name: "id",
      label: "Categoría",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await authFetch(
          `/api/categorias-gasto?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((categoria: { nombre: string; id: number }) => ({
          label: categoria.nombre,
          value: categoria.id,
        }));
      },
      getInitialValue: (categoria: CategoriaGasto) => ({
        value: categoria.id,
        label: categoria.nombre,
      }),
    },
    {
      name: "roles",
      label: "Roles",
      type: "multiselect",
      options: roles,
      valueKey: "id",
      labelKey: "name",
    },
  ];

  const createNewPermisoGasto = (): PermisoGasto => {
    return {
      id: "",
      roles: [],
    };
  };

  return (
    <CrudTable<PermisoGasto>
      title="Permisos de Gasto"
      columns={columns}
      apiEndpoint="/api/permisos-gasto"
      fields={formFields}
      createNewItem={createNewPermisoGasto}
      validationSchema={yup.object({
        id: yup.string().required("El id es requerido"),
        roles: yup.array().min(1, "Debe seleccionar al menos un rol"),
      })}
    />
  );
};

export default PermisosGastoPage;
