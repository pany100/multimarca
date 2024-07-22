"use client";

import CrudTable from "@/components/CrudTable";
import authFetch from "@/utils/authFetch";
import React from "react";

interface Usuario {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatar: string;
  rolId: number;
}

type FieldType = "text" | "email" | "select";

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  options?: { id: number; name: string }[];
}

const UsuariosPage = () => {
  const [roles, setRoles] = React.useState<{ id: number; name: string }[]>([]);

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await authFetch("/api/roles");
        setRoles(await rolesData.json());
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

  const formFields: FormField[] = [
    { name: "fullName", label: "Nombre completo", type: "text" },
    { name: "username", label: "Nombre de usuario", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "rolId", label: "Rol", type: "select", options: roles },
    { name: "avatar", label: "Avatar URL", type: "text" },
  ];

  return (
    <CrudTable<Usuario>
      title="Gestión de Usuarios"
      columns={columns}
      fields={formFields}
      apiEndpoint="/api/usuarios"
    />
  );
};

export default UsuariosPage;
