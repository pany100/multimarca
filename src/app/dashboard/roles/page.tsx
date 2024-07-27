"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import React from "react";
import * as yup from "yup";

interface Rol {
  id: string;
  name: string;
  permisos: string[];
}

const RolesPage = () => {
  const [permisos, setPermisos] = React.useState<
    { id: number; name: string }[]
  >([]);
  const { authFetch } = useFetch();

  React.useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const permisosData = await authFetch("/api/permisos");
        setPermisos(await permisosData.json());
      } catch (error) {
        console.error("Error al obtener permisos:", error);
      }
    };
    fetchPermisos();
  }, [authFetch]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Rol", flex: 1 },
    {
      field: "permisos",
      headerName: "Permisos",
      flex: 4,
      renderCell: (params: any) => {
        return (
          <div style={{ whiteSpace: "normal", wordWrap: "break-word" }}>
            {params.row.permisos.join(", ")}
          </div>
        );
      },
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre del Rol", type: "text" },
    {
      name: "permisos",
      label: "Permisos",
      type: "multiselect",
      options: permisos,
      valueKey: "name",
      labelKey: "name",
    },
  ];

  const createNewRole = (): Rol => {
    return {
      id: "", // El id generalmente se asigna en el backend
      name: "",
      permisos: [],
    };
  };

  return (
    <CrudTable<Rol>
      title="Roles"
      columns={columns}
      apiEndpoint="/api/roles"
      fields={formFields}
      createNewItem={createNewRole}
      validationSchema={yup.object({
        name: yup.string().required("El nombre es requerido"),
        permisos: yup
          .array()
          .min(1, "Seleccione al menos un permiso")
          .required("Los permisos son requeridos"),
      })}
    />
  );
};

export default RolesPage;
