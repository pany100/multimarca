"use client";

import {
  ROL_PERMISO_NAMES_ORDERED,
  ROL_PERMISO_SECTIONS,
} from "@/shared/config/rol-permisos-catalog";
import { useFetch } from "@/contexts/FetchContext";
import { useSnackbarContext } from "@/contexts/SnackbarContext";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { RolPermisoRow } from "./RolPermisoRow";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { RolDetalle } from "./types";

const CATALOG_SET = new Set(ROL_PERMISO_NAMES_ORDERED);

type Props = {
  rol: RolDetalle;
  onUpdated: (rol: RolDetalle) => void;
};

export function RolPermisosSection({ rol, onUpdated }: Props) {
  const { authFetch } = useFetch();
  const { setSnackbar } = useSnackbarContext();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(() => new Set());
  const [saving, setSaving] = useState(false);

  const orphans = useMemo(
    () => rol.permisos.filter((p) => !CATALOG_SET.has(p)),
    [rol.permisos],
  );

  const syncDraftFromRol = useCallback(() => {
    setDraft(new Set(rol.permisos.filter((p) => CATALOG_SET.has(p))));
  }, [rol.permisos]);

  useEffect(() => {
    if (!isEditing) {
      syncDraftFromRol();
    }
  }, [rol.permisos, isEditing, syncDraftFromRol]);

  const toggle = (name: string) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isChecked = (name: string) => {
    if (isEditing) return draft.has(name);
    return rol.permisos.includes(name);
  };

  const handleCancel = () => {
    setIsEditing(false);
    syncDraftFromRol();
  };

  const handleConfirm = async () => {
    const permisosToSave = [...Array.from(draft), ...orphans];
    setSaving(true);
    try {
      const res = await authFetch(`/api/roles/${rol.id}`, {
        method: "PATCH",
        body: JSON.stringify({ permisos: permisosToSave }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSnackbar({
          open: true,
          message: body?.error || "No se pudieron guardar los permisos",
          severity: "error",
        });
        return;
      }
      onUpdated(body as RolDetalle);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: "Permisos actualizados",
        severity: "success",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1.25}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Permisos
          </Typography>
          {!isEditing && (
            <IconButton
              size="small"
              onClick={() => {
                syncDraftFromRol();
                setIsEditing(true);
              }}
              aria-label="Editar permisos"
              sx={{ "&:hover": { backgroundColor: "action.hover" } }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Grid container spacing={1.5}>
          {ROL_PERMISO_SECTIONS.map((section) => (
            <Grid item xs={12} sm={6} lg={4} key={section.title}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.4,
                  mb: 0.25,
                }}
              >
                {section.title}
              </Typography>
              <Stack spacing={0} sx={{ borderRadius: 1, overflow: "hidden" }}>
                {section.items.map((item) => (
                  <RolPermisoRow
                    key={item.name}
                    label={item.label}
                    checked={isChecked(item.name)}
                    disabled={!isEditing}
                    onToggle={() => isEditing && toggle(item.name)}
                  />
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        {orphans.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="caption" color="warning.main" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
              Fuera del catálogo (se conservan al guardar)
            </Typography>
            <Stack spacing={0}>
              {orphans.map((name) => (
                <RolPermisoRow
                  key={name}
                  label={name}
                  checked
                  disabled
                  onToggle={() => {}}
                />
              ))}
            </Stack>
          </>
        )}

        {isEditing && (
          <Box display="flex" justifyContent="flex-start" gap={1.5} mt={2}>
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : undefined}
            >
              {saving ? "Guardando…" : "Confirmar"}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
