import { useFetch } from "@/contexts/FetchContext";
import {
  Alert,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function RepuestoUsadoFormSection() {
  const { control, getValues, setValue } = useFormContext();
  const { authFetch } = useFetch();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openRepuestoModal, setOpenRepuestoModal] = useState(false);
  const [selectedRepuesto, setSelectedRepuesto] = useState<{
    id: number;
    name: string;
    buyPrice: number;
    markup: number;
  } | null>(null);
  const [repuestoOptions, setRepuestoOptions] = useState<
    Array<{ id: number; name: string; buyPrice: number; markup: number }>
  >([]);
  const [precioCompra, setPrecioCompra] = useState("");
  const [precioVenta, setPrecioVenta] = useState("");
  const [unidadesConsumidas, setUnidadesConsumidas] = useState("");

  const searchRepuestos = async (query: string) => {
    const response = await authFetch(
      `/api/stock?query=${query}&limit=10&page=0`
    );
    const data = await response.json();
    setRepuestoOptions(
      data.items.map(
        (repuesto: {
          name: string;
          id: number;
          buyPrice: number;
          markup: number;
        }) => ({
          id: repuesto.id,
          name: repuesto.name,
          buyPrice: repuesto.buyPrice,
          markup: repuesto.markup,
        })
      )
    );
  };

  const handleAddRepuesto = () => {
    if (selectedRepuesto) {
      const currentRepuestos = getValues("repuestosUsados") || [];
      const newRepuesto = {
        stock: selectedRepuesto,
        precioCompra: Number(precioCompra),
        precioVenta: Number(precioVenta),
        unidadesConsumidas: Number(unidadesConsumidas),
      };

      if (
        currentRepuestos.some((r: any) => r.stock.id === selectedRepuesto.id)
      ) {
        setSnackbar({
          open: true,
          message: "Este repuesto ya ha sido agregado al formulario",
          severity: "error",
        });
      } else {
        setValue("repuestosUsados", [...currentRepuestos, newRepuesto]);
        setOpenRepuestoModal(false);
        setSelectedRepuesto(null);
        setPrecioCompra("");
        setPrecioVenta("");
        setUnidadesConsumidas("");
        setSnackbar({
          open: true,
          message: "Repuesto agregado correctamente",
          severity: "success",
        });
      }
    }
  };

  const handleRemoveRepuesto = (id: number) => {
    const currentRepuestos = getValues("repuestosUsados") || [];
    const updatedRepuestos = currentRepuestos.filter(
      (r: any) => r.stock.id !== id
    );

    setValue("repuestosUsados", updatedRepuestos);
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Repuestos Usados
      </Typography>
      <Controller
        name="repuestosUsados"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Repuesto</TableCell>
                  <TableCell>Precio Compra</TableCell>
                  <TableCell>Precio Venta</TableCell>
                  <TableCell>Unidades Consumidas</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.value?.map((repuesto: any) => (
                  <TableRow key={repuesto.stock.id}>
                    <TableCell>{repuesto.stock.name}</TableCell>
                    <TableCell>{repuesto.precioCompra}</TableCell>
                    <TableCell>{repuesto.precioVenta}</TableCell>
                    <TableCell>{repuesto.unidadesConsumidas}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          handleRemoveRepuesto(repuesto.stock.id);
                        }}
                      >
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {error && <Typography color="error">{error.message}</Typography>}
            <Button
              onClick={() => setOpenRepuestoModal(true)}
              variant="contained"
              color="secondary"
            >
              Agregar Repuesto
            </Button>
          </>
        )}
      />
      <Dialog
        open={openRepuestoModal}
        onClose={() => setOpenRepuestoModal(false)}
      >
        <DialogTitle>Agregar Repuesto</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={repuestoOptions}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="Repuesto" />}
            value={selectedRepuesto}
            onChange={(_, newValue) => {
              setSelectedRepuesto(newValue);
              if (newValue) {
                setPrecioCompra(newValue.buyPrice.toString());
                const precioVentaCalculado =
                  newValue.buyPrice * (1 + (newValue.markup || 0) / 100);
                setPrecioVenta(precioVentaCalculado.toFixed(2));
              } else {
                setPrecioCompra("");
                setPrecioVenta("");
              }
            }}
            onInputChange={(_, newInputValue) => {
              searchRepuestos(newInputValue);
            }}
          />
          <TextField
            label="Precio Compra"
            type="number"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Precio Venta"
            type="number"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Unidades Consumidas"
            type="number"
            value={unidadesConsumidas}
            onChange={(e) => setUnidadesConsumidas(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setOpenRepuestoModal(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAddRepuesto}
            disabled={
              !selectedRepuesto ||
              !precioCompra ||
              !precioVenta ||
              !unidadesConsumidas
            }
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity as "success" | "error" | "warning"}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default RepuestoUsadoFormSection;
