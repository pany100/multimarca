import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Chip, MenuItem, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ROL_PERMISO_SECTIONS } from "@/shared/config/rol-permisos-catalog";

function PermisosCell({ permisos }: { permisos: string[] }) {
  if (!permisos.length) {
    return <Typography variant="body2" color="text.secondary">—</Typography>;
  }

  const set = new Set(permisos);
  const grouped = ROL_PERMISO_SECTIONS.map((section) => ({
    title: section.title,
    items: section.items.filter((item) => set.has(item.name)),
  })).filter((section) => section.items.length > 0);

  const catalogNames = new Set(
    ROL_PERMISO_SECTIONS.flatMap((s) => s.items.map((i) => i.name)),
  );
  const huerfanos = permisos.filter((p) => !catalogNames.has(p));

  return (
    <Stack spacing={1} sx={{ py: 1, width: "100%" }}>
      {grouped.map((section) => (
        <Box key={section.title}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              mb: 0.5,
            }}
          >
            {section.title}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {section.items.map((item) => (
              <Chip
                key={item.name}
                label={item.label}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      ))}
      {huerfanos.length > 0 && (
        <Box>
          <Typography
            variant="caption"
            color="warning.main"
            sx={{
              display: "block",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              mb: 0.5,
            }}
          >
            Fuera del catálogo
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {huerfanos.map((name) => (
              <Chip
                key={name}
                label={name}
                size="small"
                variant="outlined"
                color="warning"
              />
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}

function RolesTable({ extraActions, ctaCb, ...rest }: InheritedTableProps) {
  const router = useRouter();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre del Rol", flex: 1 },
    {
      field: "permisos",
      headerName: "Permisos",
      flex: 4,
      sortable: false,
      renderCell: (params: any) => (
        <PermisosCell permisos={params.row.permisos ?? []} />
      ),
    },
  ];

  const customActions = (params: any) => {
    const fromAbm = extraActions ? extraActions(params) : [];
    return [
      <MenuItem
        key="administrar"
        onClick={() => router.push(`/dashboard/roles/${params.id}`)}
      >
        <SettingsIcon sx={{ mr: 1 }} />
        Administrar
      </MenuItem>,
      ...fromAbm,
    ];
  };

  return (
    <CustomTable
      title="Roles"
      columns={columns}
      apiEndpoint="/api/roles"
      ctaCb={ctaCb}
      extraActions={customActions}
      {...rest}
    />
  );
}

export default RolesTable;
