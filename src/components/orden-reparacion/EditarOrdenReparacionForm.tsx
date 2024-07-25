import authFetch from "@/utils/authFetch";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import debounce from "lodash/debounce";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import * as yup from "yup";
import ControlesEnReparacionForm from "./ControlesEnReparacionForm";
import MecanicoFormSection from "./MecanicoFormSection";
import ObservacionesEntradaForm from "./ObservacionesEntradaForm";
import ReparacionesTercerosFormSection from "./ReparacionesTercerosFormSection";
import RepuestoUsadoFormSection from "./RepuestoUsadoFormSection";
import TrabajosRealizadosFormSection from "./TrabajosRealizadosFormSection";

const schema = yup.object().shape({
  autoId: yup.number().required("Debe seleccionar un auto"),
  fechaCreacion: yup.date().required("La fecha de creación es requerida"),
  fechaEntradaReparacion: yup.date().nullable(),
  fechaSalidaReparacion: yup
    .date()
    .nullable()
    .min(
      yup.ref("fechaEntradaReparacion"),
      "La fecha de salida debe ser posterior a la fecha de entrada"
    ),
  kilometros: yup
    .number()
    .positive()
    .integer()
    .required("Debe ingresar los kilómetros"),
  observacionesCliente: yup.string(),
  observacionesSalida: yup.string().required(),
  estado: yup
    .string()
    .oneOf(["Presupuestado", "En Progreso", "Aceptado", "Terminado"])
    .required("Debe seleccionar un estado"),
  mecanicos: yup.array().of(
    yup.object().shape({
      id: yup.number().required(),
      name: yup.string().required(),
    })
  ),
  repuestosUsados: yup.array().of(
    yup.object().shape({
      stock: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El repuesto es requerido"),
      precioCompra: yup
        .number()
        .positive()
        .required("El precio de compra es requerido"),
      precioVenta: yup
        .number()
        .positive()
        .required("El precio de venta es requerido"),
      unidadesConsumidas: yup
        .number()
        .positive()
        .integer()
        .required("Las unidades consumidas son requeridas"),
    })
  ),
  controlesEnReparacion: yup.array().of(
    yup.object().shape({
      id: yup.number().required("Id es requerido"),
      valor: yup.string(),
    })
  ),
  trabajosRealizados: yup.array().of(
    yup.object().shape({
      manoDeObra: yup
        .object()
        .shape({
          name: yup.string().required(),
        })
        .required("La mano de obra es requerida"),
      precioUnitario: yup
        .number()
        .positive()
        .required("El precio unitario es requerido"),
    })
  ),
  reparacionesDeTercero: yup.array().of(
    yup.object().shape({
      nombre: yup.string().required("El nombre de la reparación es requerido"),
      precioCompra: yup
        .number()
        .positive()
        .required("El precio de compra es requerido"),
      precioVenta: yup
        .number()
        .positive()
        .required("El precio de venta es requerido"),
      proveedor: yup
        .object()
        .shape({
          id: yup.number().required(),
          name: yup.string().required(),
        })
        .required("El proveedor es requerido"),
    })
  ),
  montoTotalCliente: yup
    .number()
    .positive()
    .required("El monto total es requerido"),
  observacionesEntrada: yup.string(),
});

type Props = {
  ordenReparacion: OrdenReparacion;
};

type OrdenReparacion = {
  id: number;
  autoId: number;
  fechaCreacion: Date;
  fechaEntradaReparacion: Date | null;
  fechaSalidaReparacion: Date | null;
  kilometros: number;
  observacionesCliente: string;
  observacionesEntrada: string;
  observacionesSalida: string;
  estado: "Presupuestado" | "En Progreso" | "Aceptado" | "Terminado";
  pdfPath: string | null;
  montoTotalCliente: number;
  auto: {
    id: number;
    patent: string;
    model: string;
    brand: string;
  };
  mecanicos: any[];
  repuestosUsados: {
    id: number;
    ordenReparacionId: number;
    stockId: number;
    stock: {
      id: number;
      name: string;
    };
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
  }[];
  reparacionesDeTercero: {
    id: number;
    nombre: string;
    precioCompra: number;
    precioVenta: number;
    proveedorId: number;
    proveedor: {
      id: number;
      name: string;
    };
  }[];
  trabajosRealizados: {
    id: number;
    ordenReparacionId: number;
    descripcion: string;
    precioUnitario: number;
  }[];
  controlesEnReparacion: {
    id: number;
    valor: string;
    controlMecanico: {
      id: number;
      name: string;
      type: string;
    };
  }[];
};

const EditarOrdenReparacionForm = ({ ordenReparacion }: Props) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [observacionSalida, setObservacionSalida] = useState<string>("");

  const handleAddObservacionSalida = () => {
    if (observacionSalida.trim()) {
      const currentObservaciones = JSON.parse(
        methods.getValues("observacionesSalida")
      );
      methods.setValue(
        "observacionesSalida",
        JSON.stringify([...currentObservaciones, observacionSalida.trim()])
      );
      setObservacionSalida("");
    }
  };

  const handleDeleteObservacionSalida = (index: number) => {
    const currentObservaciones = JSON.parse(
      methods.getValues("observacionesSalida")
    );
    const newObservaciones = currentObservaciones.filter(
      (_: string, i: number) => i !== index
    );
    methods.setValue("observacionesSalida", JSON.stringify(newObservaciones));
  };
  const [autocompleteOptions, setAutocompleteOptions] = useState<
    { value: string; label: string }[]
  >([
    {
      value: ordenReparacion.autoId.toString(),
      label: `${ordenReparacion.auto.patent} - ${
        ordenReparacion.auto.brand || ""
      } ${ordenReparacion.auto.model || ""}`,
    },
  ]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ...ordenReparacion,
      montoTotalCliente: ordenReparacion.montoTotalCliente,
      trabajosRealizados: ordenReparacion.trabajosRealizados.map((trabajo) => ({
        manoDeObra: { name: trabajo.descripcion },
        precioUnitario: Number(trabajo.precioUnitario),
      })),
      repuestosUsados: ordenReparacion.repuestosUsados.map((repuesto) => ({
        stock: { id: repuesto.stockId, name: repuesto.stock.name },
        precioCompra: Number(repuesto.precioCompra),
        precioVenta: Number(repuesto.precioVenta),
        unidadesConsumidas: repuesto.unidadesConsumidas,
      })),
      reparacionesDeTercero: ordenReparacion.reparacionesDeTercero.map(
        (reparacion) => ({
          nombre: reparacion.nombre,
          precioCompra: Number(reparacion.precioCompra),
          precioVenta: Number(reparacion.precioVenta),
          proveedor: {
            id: reparacion.proveedorId,
            name: reparacion.proveedor.name,
          },
        })
      ),
      observacionesSalida: ordenReparacion.observacionesSalida,
      controlesEnReparacion: ordenReparacion.controlesEnReparacion.map(
        (control) => ({
          id: control.id,
          valor: control.valor,
        })
      ),
    },
  });
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = methods;

  const repuestosUsados = useWatch({ control, name: "repuestosUsados" });
  const reparacionesTerceros = useWatch({
    control,
    name: "reparacionesDeTercero",
  });
  const trabajosRealizados = useWatch({ control, name: "trabajosRealizados" });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });

  useEffect(() => {
    if (!isEditing) return;

    const calcularMontoTotal = () => {
      const totalRepuestos =
        repuestosUsados?.reduce(
          (sum: any, r: any) => sum + r.precioVenta * r.unidadesConsumidas,
          0
        ) || 0;
      console.log("totalRepuestos", totalRepuestos);
      const totalReparaciones =
        reparacionesTerceros?.reduce(
          (sum: any, r: any) => sum + r.precioVenta,
          0
        ) || 0;
      console.log("totalReparaciones", totalReparaciones);
      const totalTrabajos =
        trabajosRealizados?.reduce(
          (sum: any, t: any) => sum + t.precioUnitario,
          0
        ) || 0;
      console.log("totalTrabajos", totalTrabajos);

      return totalRepuestos + totalReparaciones + totalTrabajos;
    };

    setValue("montoTotalCliente", calcularMontoTotal());
  }, [
    isEditing,
    repuestosUsados,
    reparacionesTerceros,
    trabajosRealizados,
    setValue,
  ]);

  useEffect(() => {
    setIsEditing(true);
  }, []);

  const debouncedSearch = debounce(
    async (
      query: string,
      callback: (options: { value: string; label: string }[]) => void
    ) => {
      const response = await authFetch(
        `/api/autos?query=${query}&limit=10&page=0`
      );
      const data = await response.json();

      const opciones = data.items.map(
        (auto: {
          patent: string;
          id: number;
          brand: string;
          model: string;
        }) => ({
          label: `${auto.patent} - ${auto.brand || ""} ${auto.model || ""}`,
          value: auto.id.toString(),
        })
      );
      callback(opciones);
    },
    300
  );

  const handleFormChange = () => {
    if (!isEditing) setIsEditing(true);
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(data));
      if (selectedFile) {
        formData.append("pdfPath", selectedFile);
      }
      const response = await authFetch(
        `/api/orden-reparacion/${ordenReparacion.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          message: "Orden de reparación actualizada con éxito",
          severity: "success",
        });
        router.push("/dashboard/ordenes-reparacion");
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message:
            errorData.error || "Error al actualizar la orden de reparación",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setSnackbar({
        open: true,
        message: `Error al realizar la solicitud de actualización: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
        severity: "error",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} onChange={handleFormChange}>
        <Controller
          name="autoId"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Autocomplete
              options={autocompleteOptions || []}
              getOptionLabel={(option) => option?.label || ""}
              value={
                value
                  ? autocompleteOptions.find(
                      (option) => option.value === value.toString()
                    ) || null
                  : null
              }
              onChange={(_, newValue) => {
                onChange(newValue?.value || null);
              }}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === "input") {
                  debouncedSearch(
                    newInputValue,
                    (options: { value: string; label: string }[]) =>
                      setAutocompleteOptions(options)
                  );
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Auto"
                  error={!!errors.autoId}
                  helperText={errors.autoId?.message as string}
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option?.value === value?.value
              }
              loadingText="Buscando..."
              noOptionsText="No se encontraron resultados"
              sx={{
                marginBottom: 2,
              }}
            />
          )}
        />
        <Controller
          name="fechaCreacion"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="date"
              label="Fecha de creación"
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              value={
                field.value
                  ? new Date(field.value).toISOString().split("T")[0]
                  : ""
              }
              error={!!errors.fechaCreacion}
              helperText={errors.fechaCreacion?.message as string}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          )}
        />
        <Controller
          name="fechaEntradaReparacion"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="date"
              label="Fecha de entrada"
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              value={
                field.value
                  ? new Date(field.value).toISOString().split("T")[0]
                  : ""
              }
              error={!!errors.fechaEntradaReparacion}
              helperText={errors.fechaEntradaReparacion?.message as string}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          )}
        />

        <Controller
          name="fechaSalidaReparacion"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="date"
              label="Fecha de salida"
              InputLabelProps={{ shrink: true }}
              fullWidth
              margin="normal"
              value={
                field.value
                  ? new Date(field.value).toISOString().split("T")[0]
                  : ""
              }
              error={!!errors.fechaSalidaReparacion}
              helperText={errors.fechaSalidaReparacion?.message as string}
              onChange={(e) => field.onChange(e.target.value || null)}
            />
          )}
        />

        <Controller
          name="kilometros"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              label="Kilómetros"
              fullWidth
              margin="normal"
              error={!!errors.kilometros}
              helperText={errors.kilometros?.message as string}
            />
          )}
        />

        <Controller
          name="observacionesCliente"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Observaciones del cliente"
              multiline
              rows={4}
              fullWidth
              margin="normal"
              error={!!errors.observacionesCliente}
              helperText={errors.observacionesCliente?.message as string}
            />
          )}
        />
        <TextField
          label="Nueva observación de salida"
          value={observacionSalida}
          onChange={(e) => setObservacionSalida(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button onClick={handleAddObservacionSalida} variant="outlined">
          Agregar observación
        </Button>

        <Controller
          name="observacionesSalida"
          control={control}
          render={({ field }) => (
            <Stack direction="row" spacing={1} flexWrap="wrap" marginTop={2}>
              {JSON.parse(field.value)?.map((obs: string, index: number) => (
                <Chip
                  key={index}
                  label={obs}
                  onDelete={() => handleDeleteObservacionSalida(index)}
                />
              ))}
            </Stack>
          )}
        />
        <ObservacionesEntradaForm />
        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Estado"
              fullWidth
              margin="normal"
              error={!!errors.estado}
              helperText={errors.estado?.message as string}
            >
              {["Presupuestado", "En Progreso", "Aceptado", "Terminado"].map(
                (option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                )
              )}
            </TextField>
          )}
        />
        <MecanicoFormSection />
        <RepuestoUsadoFormSection />
        <ReparacionesTercerosFormSection />
        <TrabajosRealizadosFormSection />
        <Controller
          name="controlesEnReparacion"
          control={control}
          render={() => (
            <>
              <ControlesEnReparacionForm
                controlesMecanicos={ordenReparacion.controlesEnReparacion.map(
                  (control) => ({
                    id: control.id,
                    nombre: control.controlMecanico.name,
                    tipo:
                      control.controlMecanico.type === "checkbox"
                        ? "checkbox"
                        : "texto",
                    valor: control.valor,
                  })
                )}
              />
              {!!errors.controlesEnReparacion && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.controlesEnReparacion.message}
                </Alert>
              )}
            </>
          )}
        />
        <Box sx={{ mt: 2, mb: 2 }}>
          <Paper
            {...getRootProps()}
            sx={{
              p: 2,
              border: "2px dashed",
              borderColor: isDragActive ? "primary.main" : "grey.300",
              backgroundColor: isDragActive
                ? "action.hover"
                : "background.paper",
              cursor: "pointer",
            }}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <Box>
                <Typography>
                  Archivo seleccionado: {selectedFile.name}
                </Typography>
                <Box
                  component="iframe"
                  src={URL.createObjectURL(selectedFile)}
                  width="100%"
                  height="300px"
                />
              </Box>
            ) : ordenReparacion.pdfPath ? (
              <Box>
                <Typography>
                  PDF actual: {ordenReparacion.pdfPath.split("/").pop()}
                </Typography>
                <Box
                  component="iframe"
                  src={ordenReparacion.pdfPath}
                  width="100%"
                  height="300px"
                />
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Arrastra un nuevo archivo para reemplazar el PDF actual
                </Typography>
              </Box>
            ) : (
              <Typography>
                {isDragActive
                  ? "Suelta el archivo PDF aquí..."
                  : "Arrastra y suelta un archivo PDF aquí, o haz clic para seleccionar uno"}
              </Typography>
            )}
          </Paper>
        </Box>
        <Controller
          name="montoTotalCliente"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Monto Total Cliente"
              type="number"
              fullWidth
              margin="normal"
            />
          )}
        />

        <Button type="submit" variant="contained" color="primary">
          Actualizar Orden de Reparación
        </Button>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormProvider>
  );
};

export default EditarOrdenReparacionForm;
