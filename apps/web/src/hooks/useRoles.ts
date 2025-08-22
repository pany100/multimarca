import { useFetch } from "@/contexts/FetchContext";
import * as React from "react";

function useRoles() {
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

  return { roles };
}

export default useRoles;
