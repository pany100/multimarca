"use client";

import CrudTable from "@/components/CrudTable";
import { FieldConfig } from "@/components/DynamicForm";
import { useFetch } from "@/contexts/FetchContext";
import { getFormattedPrice } from "@/utils/fieldHelper";
import SendIcon from "@mui/icons-material/Send";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Modal,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import * as yup from "yup";

interface IngresoPorReparacion {
  id: string;
  fecha: string;
  monto: number;
  descripcion: string;
  clienteId: number;
  cliente: {
    fullName: string;
  };
  ordenReparacionId: number;
  ordenReparacion: {
    id: number;
    auto: {
      patent: string;
      brand: string;
      model: string;
    };
  };
  tipoOperacion:
    | "EFECTIVO"
    | "TRANSFERENCIA"
    | "CHEQUE"
    | "DEBITO_AUTOMATICO_TARJETA_CREDITO";
}

const IngresosPorReparacionPage = () => {
  const [options, setOptions] = useState<{ label: string; value: number }[]>(
    []
  );
  const initializedRef = useRef(false);
  const { authFetch } = useFetch();
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedIngreso, setSelectedIngreso] =
    useState<IngresoPorReparacion | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    {
      field: "fecha",
      headerName: "Fecha",
      flex: 1,
      valueGetter: (fecha: string) =>
        new Date(fecha).toLocaleDateString("es-AR"),
    },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      valueGetter: (monto: any) => getFormattedPrice(monto),
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
      headerName: "Tipo de Ingreso",
      flex: 1,
      renderCell: (params: any) =>
        params.value === "DEBITO_AUTOMATICO_TARJETA_CREDITO"
          ? "DEBITO AUTOMATICO"
          : params.value,
    },
    { field: "descripcion", headerName: "Descripción", flex: 2 },
    {
      field: "cliente",
      headerName: "Cliente",
      width: 150,
      valueGetter: (cliente: any) => cliente?.fullName || "",
      flex: 1.5,
    },
    {
      field: "ordenReparacion",
      headerName: "Orden de Reparación",
      width: 200,
      valueGetter: (ordenReparacion: any) =>
        `#${ordenReparacion.id} - ${ordenReparacion.auto.patent} ${
          ordenReparacion.auto.brand
        } ${ordenReparacion.auto.model}: ${
          ordenReparacion.fechaEntradaReparacion
            ? new Date(
                ordenReparacion.fechaEntradaReparacion
              ).toLocaleDateString("es-AR")
            : "Sin Fecha de entrada"
        }`,
      flex: 2,
    },
    {
      field: "reciboEnviado",
      headerName: "Recibo Enviado",
      flex: 1,
      valueGetter: (reciboEnviado: boolean) => (reciboEnviado ? "Sí" : "No"),
    },
  ];

  const formFields: FieldConfig[] = [
    {
      name: "fecha",
      label: "Fecha",
      type: "date",
      layout: {
        xs: 6,
      },
    },
    {
      name: "monto",
      label: "Monto",
      type: "number",
      layout: {
        xs: 6,
      },
    },
    {
      name: "moneda",
      label: "Moneda",
      type: "select",
      options: [
        { label: "Dolar", value: "Dolar" },
        { label: "Peso", value: "Peso" },
      ],
    },
    {
      name: "tipoOperacion",
      label: "Tipo de Ingreso",
      type: "select",
      options: [
        { label: "Efectivo", value: "EFECTIVO" },
        { label: "Transferencia", value: "TRANSFERENCIA" },
        { label: "Cheque", value: "CHEQUE" },
        {
          label: "Débito Automático tarjeta crédito",
          value: "DEBITO_AUTOMATICO_TARJETA_CREDITO",
        },
      ],
    },
    { name: "descripcion", label: "Descripción", type: "text" },
    {
      name: "clienteId",
      label: "Cliente",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await authFetch(
          `/api/clientes?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((cliente: { fullName: string; id: number }) => ({
          label: cliente.fullName,
          value: cliente.id,
        }));
      },
      getInitialValue: (ingreso: any) => {
        const value = {
          value: ingreso.cliente.id,
          label: ingreso.cliente.fullName,
        };
        return value;
      },
      onChange: async (
        value: number | null,
        setValue: UseFormSetValue<any>
      ) => {
        initializedRef.current = true;

        if (!value) {
          setValue("ordenReparacionId", null);
          return;
        }
        const response = await authFetch(
          `/api/clientes/${value}/orden-reparacion?soloConDeuda=true&limit=10&page=0`
        );
        const data = await response.json();
        setOptions(
          data.map(
            (orden: {
              id: number;
              auto: { patent: string; brand: string; model: string };
              fechaEntradaReparacion: string;
            }) => ({
              label: `#${orden.id} - ${orden.auto.patent} ${orden.auto.brand} ${
                orden.auto.model
              } - ${
                orden.fechaEntradaReparacion
                  ? new Date(orden.fechaEntradaReparacion).toLocaleDateString()
                  : "-"
              }`,
              value: orden.id,
            })
          )
        );
        setValue("ordenReparacionId", null);
      },
    },
    {
      name: "ordenReparacionId",
      label: "Orden de Reparación",
      type: "select",
      options: (ingreso: any) => {
        if (ingreso.ordenReparacionId && !initializedRef.current) {
          console.log("Is Edit");
          console.log(ingreso);
          const init = [
            {
              label: `#${ingreso.ordenReparacionId} - ${
                ingreso.ordenReparacion.auto.patent
              } ${ingreso.ordenReparacion.auto.brand} ${
                ingreso.ordenReparacion.auto.model
              } - ${
                ingreso.ordenReparacion.fechaEntradaReparacion
                  ? new Date(
                      ingreso.ordenReparacion.fechaEntradaReparacion
                    ).toLocaleDateString()
                  : "-"
              }`,
              value: ingreso.ordenReparacionId,
            },
          ];
          return init;
        }
        return options;
      },
    },
  ];

  const createNewIngresoPorReparacion = (): IngresoPorReparacion => {
    return {
      id: "",
      fecha: new Date().toISOString().split("T")[0],
      monto: 0,
      descripcion: "",
      clienteId: 0,
      cliente: {
        fullName: "",
      },
      ordenReparacionId: 0,
      ordenReparacion: {
        id: 0,
        auto: {
          patent: "",
          brand: "",
          model: "",
        },
      },
      tipoOperacion: "EFECTIVO",
    };
  };

  const handleExtraAction = async (ingreso: IngresoPorReparacion) => {
    try {
      const response = await authFetch(
        `/api/ingresos-reparacion/${ingreso.id}/generar-recibo`
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(`${url}#zoom=100`);
      setSelectedIngreso(ingreso);
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

  const handleEdit = (item: any) => {
    initializedRef.current = false;
  };

  const handleSendRecibo = async () => {
    if (!selectedIngreso) return;
    try {
      const response = await authFetch(
        `/api/ingresos-reparacion/${selectedIngreso.id}/enviar-recibo`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Recibo enviado con éxito",
          severity: "success",
        });
      } else {
        throw new Error("Error al enviar el recibo");
      }
    } catch (error) {
      console.error("Error al enviar el recibo:", error);
      setSnackbar({
        open: true,
        message: "Error al enviar el recibo",
        severity: "error",
      });
    } finally {
      setModalOpen(false);
    }
  };

  const extraActions = (ingreso: IngresoPorReparacion) => (
    <>
      <Tooltip title="Enviar Recibo">
        <IconButton onClick={() => handleExtraAction(ingreso)} size="small">
          <SendIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <>
      <CrudTable<IngresoPorReparacion>
        title="Ingresos por Reparación"
        columns={columns}
        apiEndpoint="/api/ingresos-reparacion"
        fields={formFields}
        createNewItem={createNewIngresoPorReparacion}
        extraActions={extraActions}
        onEdit={handleEdit}
        validationSchema={yup.object({
          fecha: yup.date().required("La fecha es requerida"),
          monto: yup
            .number()
            .required("El monto es requerido")
            .positive("El monto debe ser positivo"),
          moneda: yup.string().required("La moneda es requerida"),
          descripcion: yup.string().required("La descripción es requerida"),
          clienteId: yup
            .number()
            .typeError("Debe selecionar un cliente de la lista")
            .required("El cliente es requerido"),
          ordenReparacionId: yup
            .number()
            .required("La orden de reparación es requerida"),
          tipoOperacion: yup
            .string()
            .oneOf(
              [
                "EFECTIVO",
                "TRANSFERENCIA",
                "CHEQUE",
                "DEBITO_AUTOMATICO_TARJETA_CREDITO",
              ],
              "Tipo de extracción inválido"
            )
            .required("El tipo de extracción es requerido"),
        })}
      />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%", // Aumenta el ancho del modal
            maxWidth: 900, // Establece un ancho máximo
            height: "90%", // Aumenta la altura del modal
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Vista previa del recibo
          </Typography>
          <iframe
            src={pdfUrl}
            width="100%"
            height="100%"
            style={{ flexGrow: 1 }}
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendRecibo} variant="contained">
              Enviar
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default IngresosPorReparacionPage;
