import UploadImageModal from "@/components/UploadImageModal";
import { useFetch } from "@/contexts/FetchContext";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, MenuItem, Snackbar } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CustomTable, {
  InheritedTableProps,
} from "../../components/tableV2/CustomTable";

function MecanicosTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();
  const [selectedEmpleado, setSelectedEmpleado] = useState<string | null>(null);
  const { authFetch } = useFetch();

  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleSaveDNIImage = async (file: File | null) => {
    if (file && selectedEmpleado) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await authFetch(
          `/api/mecanicos/${selectedEmpleado}/dni`,
          {
            method: "PUT",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Error al guardar el dni");
        }

        const updatedAuto = await response.json();
        console.log("DNI guardado exitosamente", updatedAuto);

        setModalOpen(false);
        setSnackbar({
          open: true,
          message: "DNI guardado exitosamente",
          severity: "success",
        });
        setRefreshTrigger && setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error al guardar el dni:", error);
        setSnackbar({
          open: true,
          message: "Error al guardar el dni",
          severity: "error",
        });
      }
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Nombre", flex: 1 },
    {
      field: "start_date",
      headerName: "Fecha de comienzo",
      flex: 1,
      valueGetter: (start_date: string) => {
        return new Date(start_date).toLocaleDateString("es-ES");
      },
    },
    { field: "dni", headerName: "CUIT/CUIL", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "tipo", headerName: "Tipo", flex: 1 },
    { field: "phone", headerName: "Teléfono", flex: 1 },
    {
      field: "dniFrentePath",
      headerName: "Foto DNI",
      flex: 0.7,
      renderCell: (params: GridRenderCellParams) => {
        const src =
          params.row.dniFrentePath ?? params.row.dniImagePath ?? null;
        return src ? (
          <Image src={src} alt="DNI" width={100} height={50} />
        ) : (
          "-"
        );
      },
    },
  ];
  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="edit"
        onClick={() => router.push(`/dashboard/mecanicos/${params.id}/ver`)}
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Administración General
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };
  return (
    <>
      <CustomTable
        title="Colaboradores"
        columns={columns}
        apiEndpoint="/api/mecanicos"
        ctaCb={() => router.push("/dashboard/mecanicos/nuevo")}
        extraActions={customActions}
        {...rest}
      />
      {selectedEmpleado && (
        <UploadImageModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveDNIImage}
          title="Agregar Foto DNI"
        />
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default MecanicosTable;
