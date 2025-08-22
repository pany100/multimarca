"use client";

import { useAuth } from "@/hooks/useAuth";
import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          backgroundColor: "rgba(255, 255, 255, 0.7)", // Fondo semi-transparente
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }
  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
