"use client";

import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { useFetch } from "@/contexts/FetchContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RolNombreCard } from "./RolNombreCard";
import { RolPermisosSection } from "./RolPermisosSection";
import { RolUsuariosCard } from "./RolUsuariosCard";
import type { RolDetalle } from "./types";

type Props = {
  roleId: string;
};

export function RolAdminPageContent({ roleId }: Props) {
  const router = useRouter();
  const { authFetch } = useFetch();
  const [rol, setRol] = useState<RolDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/api/roles/${roleId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "No se pudo cargar el rol");
        setRol(null);
        return;
      }
      setRol(data as RolDetalle);
    } catch {
      setError("Error de red");
      setRol(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, roleId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 240,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !rol) {
    return (
      <Paper sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/dashboard/roles")}
          sx={{ mb: 2 }}
        >
          Volver a roles
        </Button>
        <Typography color="error">{error || "Rol no encontrado"}</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5 }, maxWidth: 1400, mx: "auto" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/dashboard/roles")}
        size="small"
        sx={{ mb: 1 }}
      >
        Volver a roles
      </Button>

      <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>
        Administrar rol
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack spacing={2}>
            <RolNombreCard rol={rol} onUpdated={setRol} />
            <RolUsuariosCard usuarios={rol.usuarios} />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <RolPermisosSection rol={rol} onUpdated={setRol} />
        </Grid>
      </Grid>

      <FormSnackbar />
    </Box>
  );
}
