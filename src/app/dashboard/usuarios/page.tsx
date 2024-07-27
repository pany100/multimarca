"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import React from "react";
import * as yup from "yup";

interface Usuario {
  id: string;
  fullName: string;
  email: string;
  username: string;
  rolId: number;
}

const UsuariosPage = () => {
  const [roles, setRoles] = React.useState<{ value: number; label: string }[]>(
    []
  );
  const { authFetch } = useFetch();

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await authFetch("/api/roles");
        const response = await rolesData.json();
        const customRoles = response.items.map(
          (role: { id: number; name: string }) => ({
            value: role.id,
            label: role.name,
          })
        );
        setRoles(customRoles);
      } catch (error) {
        console.error("Error al obtener roles:", error);
      }
    };
    fetchRoles();
  }, [authFetch]);

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "fullName", headerName: "Nombre completo", flex: 2 },
    { field: "email", headerName: "Email", flex: 2 },
    { field: "username", headerName: "Usuario", flex: 1.5 },
    { field: "rol", headerName: "Rol", flex: 1.5 },
  ];

  const formFields: FieldConfig[] = [
    { name: "fullName", label: "Nombre completo", type: "text" },
    { name: "username", label: "Nombre de usuario", type: "text" },
    { name: "email", label: "Email", type: "email" },
    {
      name: "rolId",
      label: "Rol",
      type: "select",
      options: roles,
      getInitialValue(item) {
        const role = roles.find((role) => role.label === item.rol);
        return {
          value: role ? role.value : "",
          label: role ? role.label : "",
        };
      },
    },
  ];

  return (
    <CrudTable<Usuario>
      title="Usuarios"
      columns={columns}
      fields={formFields}
      apiEndpoint="/api/usuarios"
      validationSchema={yup.object().shape({
        fullName: yup.string().required("El nombre es requerido"),
        username: yup.string().required("El nombre de usuario es requerido"),
        email: yup
          .string()
          .email("El email es inválido")
          .required("El email es requerido"),
        rolId: yup.number().required("El rol es requerido"),
      })}
    />
  );
};

export default UsuariosPage;
