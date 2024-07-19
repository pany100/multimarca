import { useState, useEffect } from "react";
import authFetch from "@/utils/authFetch";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authFetch("/api/usuarios/yo");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error al verificar la autenticación:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading };
};
