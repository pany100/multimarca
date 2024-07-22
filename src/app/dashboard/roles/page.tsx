"use client";

import CrudTable from "@/components/CrudTable";
import authFetch from "@/utils/authFetch";
import React from "react";

interface Rol {
  id: string;
  name: string;
  permisos: string[];
}

type FieldType = "text" | "multiselect" | "select" | "email";

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  options?: { id: number; name: string }[];
  valueKey?: string;
  labelKey?: string;
}

const RolesPage = () => {
  const [permisos, setPermisos] = React.useState<
    { id: number; name: string }[]
  >([]);

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
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nombre del Rol", width: 200 },
    { field: "permisos", headerName: "Permisos", width: 300 },
  ];

  const formFields: FormField[] = [
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
    />
  );
};

export default RolesPage;
