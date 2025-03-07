import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useState } from "react";

function useAdmins() {
  const [admins, setAdmins] = useState<{ value: number; label: string }[]>([]);
  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await authFetch("/api/usuarios/admins");
        const data = await response.json();
        const customUsuarios = data.map(
          (usuario: { id: number; fullName: string }) => ({
            value: usuario.id,
            label: usuario.fullName,
          })
        );
        setAdmins(customUsuarios);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsuarios();
  }, [authFetch]);

  return { admins };
}

export default useAdmins;
