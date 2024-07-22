"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import authFetch from "@/utils/authFetch";
import React from "react";
import * as yup from "yup";

interface Usuario {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatar: string;
  rolId: number;
}

const UsuariosPage = () => {
  const [roles, setRoles] = React.useState<{ value: number; label: string }[]>(
    []
  );

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
  }, []);

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "fullName", headerName: "Nombre completo", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "username", headerName: "Usuario", width: 150 },
    { field: "rol", headerName: "Rol", width: 150 },
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
    { name: "avatar", label: "Avatar URL", type: "text" },
  ];

  return (
    <CrudTable<Usuario>
      title="Gestión de Usuarios"
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
