import ImageWithPreview from "@/components/ImageWithPreview";
import UploadImageModal from "@/components/UploadImageModal";
import { useFetch } from "@/contexts/FetchContext";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, MenuItem, Snackbar } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function AutosTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();
  const [selectedAuto, setSelectedAuto] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleExtraAction = (auto: string) => {
    setSelectedAuto(auto);
    setModalOpen(true);
  };

  const handleSaveCedulaVerde = async (file: File | null) => {
    if (file && selectedAuto) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await authFetch(`/api/autos/${selectedAuto}/cedula`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al guardar la cédula verde");
        }

        const updatedAuto = await response.json();
        console.log("Cédula verde guardada exitosamente", updatedAuto);

        setModalOpen(false);
        setSnackbar({
          open: true,
          message: "Cédula verde guardada exitosamente",
          severity: "success",
        });
        setRefreshTrigger && setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error al guardar la cédula verde:", error);
        setSnackbar({
          open: true,
          message: "Error al guardar la cédula verde",
          severity: "error",
        });
      }
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "patent", headerName: "Patente", flex: 0.7 },
    { field: "brand", headerName: "Marca", flex: 1 },
    { field: "model", headerName: "Modelo", flex: 1.5 },
    { field: "year", headerName: "Año", flex: 0.5 },
    { field: "color", headerName: "Color", flex: 0.7 },
    { field: "kms", headerName: "Kilómetros", flex: 0.7 },
    {
      field: "tipoCombustible",
      headerName: "Combustible",
      flex: 0.8,
      valueGetter: (value: string | null) => value || "-",
    },
    {
      field: "owner",
      headerName: "Propietario",
      flex: 2,
      renderCell: (params: any) => params.row.owner?.fullName || "-",
    },
    {
      field: "cedulaVerdeFile",
      headerName: "Cédula Verde",
      flex: 0.7,
      renderCell: (params: any) => {
        const src =
          params.row.cedulaVerdeFile?.finalPath ??
          params.row.cedulaVerdeFile?.tempPath;
        return src ? (
          <ImageWithPreview
            src={src}
            alt="Cédula Verde"
            title="Cédula Verde"
            width={100}
            height={50}
          />
        ) : (
          "-"
        );
      },
    },
  ];

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem key="dni" onClick={() => handleExtraAction(params.id)}>
        <CameraAltIcon sx={{ mr: 1 }} />
        Subir Cédula Verde
      </MenuItem>,
      <MenuItem
        key="edit"
        onClick={() => router.push(`/dashboard/autos/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  return (
    <>
      <CustomTable
        title="Autos"
        apiEndpoint="/api/autos"
        extraActions={customActions}
        ctaCb={ctaCb}
        columns={columns}
        {...rest}
      />
      <UploadImageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCedulaVerde}
        title="Subir Cédula Verde"
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AutosTable;
