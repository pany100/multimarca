"use client";

import CustomTable, {
  InheritedTableProps,
} from "@/components/tableV2/CustomTable";
import useRecibo from "@/hooks/useRecibo";
import authFetch from "@/utils/authFetch";
import { getFormattedDate, getFormattedPrice } from "@/utils/fieldHelper";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, Checkbox, Chip, MenuItem, Snackbar } from "@mui/material";
import { GridRowParams } from "@mui/x-data-grid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RecibosModal from "../ingresos-reparacion/RecibosModal";

function IngresosVentasTable({
  extraActions,
  ctaCb,
  setRefreshTrigger,
  ...rest
}: InheritedTableProps) {
  const router = useRouter();

  const [selectedIngreso, setSelectedIngreso] = useState<{
    id: string;
  } | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const { generateReciboVentas } = useRecibo();

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (value: any) => new Date(value).toLocaleDateString("es-AR"),
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueGetter: (value: any) => getFormattedPrice(value),
    },
    {
      field: "moneda",
      headerName: "Moneda",
      flex: 1,
      renderCell: (params: any) => (
        <Chip
          label={params.value}
          color={params.value === "Dolar" ? "success" : "warning"}
          size="small"
        />
      ),
    },
    {
      field: "tipoOperacion",
      headerName: "Tipo de Operación",
      flex: 1.5,
      renderCell: (params: any) => {
        const value = params.value;
        if (value === null) {
          return "No especificado";
        }
        if (value.label === "Cheque" && params.row.chequeId) {
          const cheque = params.row.cheque;
          return (
            <Link
              href={`/dashboard/cheques/${params.row.chequeId}`}
              style={{ textDecoration: "underline" }}
            >
              Cheque {cheque.rechazado ? "(Rechazado, revisar)" : ""}
            </Link>
          );
        }
        return value.label;
      },
    },
    { field: "descripcion", headerName: "Descripción", flex: 2 },
    {
      field: "cliente",
      headerName: "Cliente",
      flex: 1.5,
      renderCell: (params: any) =>
        params.row.cliente?.fullName || params.row.informacionCliente,
    },
    {
      field: "ventaId",
      headerName: "Venta",
      flex: 2,
      renderCell: (params: any) => {
        const venta = params.row.venta;
        return (
          <Link
            href={`/dashboard/ventas/${venta.id}/ver`}
            style={{ textDecoration: "underline" }}
          >
            Venta #{venta.id} - {getFormattedDate(venta.fecha)}
          </Link>
        );
      },
    },
    {
      field: "reciboEnviado",
      headerName: "Recibo Enviado",
      flex: 1,
      renderCell: (params: any) => (
        <Checkbox
          checked={params.row.reciboEnviado ?? false}
          onChange={(event) => handleReciboEnviadoChange(event, params.row.id)}
        />
      ),
    },
  ];

  const handleReciboEnviadoChange = async (event: any, ingresoId: string) => {
    try {
      const response = await authFetch(`/api/ingresos-ventas/${ingresoId}`, {
        method: "PATCH",
        body: JSON.stringify({ reciboEnviado: event.target.checked }),
      });
      if (response.ok) {
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error al actualizar el estado recibo enviado:", error);
    }
  };

  const handleExtraAction = async (ingresoId: string) => {
    try {
      const url = await generateReciboVentas({ id: ingresoId });
      setSelectedIngreso({ id: ingresoId });
      setPdfUrl(`${url}#zoom=100`);
      setModalOpen(true);
    } catch (error) {
      console.error("Error al generar el recibo:", error);
      setSnackbar({
        open: true,
        message: "Error al generar el recibo",
        severity: "error",
      });
    }
  };

  const customActions = (params: any) => {
    const defaultActions = extraActions ? extraActions(params) : [];
    const customActions: React.ReactNode[] = [
      <MenuItem
        key="ver"
        onClick={() =>
          router.push(`/dashboard/ingresos-ventas/${params.id}`)
        }
      >
        <VisibilityIcon sx={{ mr: 1 }} />
        Ver
      </MenuItem>,
      <MenuItem
        key="editar"
        onClick={() =>
          router.push(`/dashboard/ingresos-ventas/${params.id}/editar`)
        }
      >
        <EditIcon sx={{ mr: 1 }} />
        Editar
      </MenuItem>,
      <MenuItem key="recibo" onClick={() => handleExtraAction(params.id)}>
        <SendIcon sx={{ mr: 1 }} />
        Enviar recibo
      </MenuItem>,
    ];
    return customActions.concat(defaultActions);
  };

  const getRowClassName = (params: GridRowParams) => {
    if (params.row.chequeId) {
      const cheque = params.row.cheque;
      if (cheque.rechazado) {
        return "low-stock-row";
      }
    }
    return "";
  };

  return (
    <>
      <CustomTable
        title="Ingresos por Venta"
        apiEndpoint="/api/ingresos-ventas"
        extraActions={customActions}
        ctaCb={ctaCb}
        columns={columns}
        getRowClassName={getRowClassName}
        {...rest}
      />
      {selectedIngreso && (
        <RecibosModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          pdfUrl={pdfUrl}
          selectedIngreso={selectedIngreso}
          setSnackbar={setSnackbar}
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

export default IngresosVentasTable;
