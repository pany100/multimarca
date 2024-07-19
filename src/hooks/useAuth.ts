import { useState, useEffect } from "react";
import authFetch from "@/utils/authFetch";

interface UserData {
  permisos: string[];
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authFetch("/api/usuarios/yo");
        if (response.ok) {
          const userData = await response.json();
          setIsAuthenticated(true);
          setUserData(userData);
        }
      } catch (error) {
        console.error("Error al verificar la autenticación:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isLoading, userData };
};
