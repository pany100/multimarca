import ImageInput from "@/components/ImageInput";
import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useReparacionTercerosObjectAutocomplete from "@/hooks/orden-reparacion/useReparacionTercerosObjectAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularPrecioVenta } from "@/utils/stock-pricing";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Proveedor {
  id: number;
  name: string;
}

interface ReparacionTercero {
  id: number;
  nombre: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
  proveedor: Proveedor;
  recibo?: string | null;
}

interface TercerosModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    nombre: string;
    proveedorId: number;
    cantidad: number;
    precioCompra: number;
    precioVenta: number;
    iva?: number | null;
    buyIva?: number | null;
    markup?: number | null;
    recibo?: string | null;
  }) => Promise<boolean>;
  loading?: boolean;
  editTercero?: ReparacionTercero;
}

const TercerosModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  editTercero,
}: TercerosModalProps) => {
  const { searchProveedores, initialProveedores } =
    useReparacionTercerosObjectAutocomplete();

  const [nombre, setNombre] = useState("");
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [precioCompra, setPrecioCompra] = useState<string>("");
  const [buyIva, setBuyIva] = useState<string>("");
  const [markup, setMarkup] = useState<string>("");
  const [sellIva, setSellIva] = useState<string>("");
  const [precioUnitario, setPrecioUnitario] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("1");
  const [precioVenta, setPrecioVenta] = useState<string>("");
  const [recibo, setRecibo] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editTercero) {
        setNombre(editTercero.nombre);
        setProveedor(editTercero.proveedor);
        setPrecioCompra(editTercero.precioCompra.toString());
        setBuyIva(
          editTercero.buyIva != null ? editTercero.buyIva.toString() : "",
        );
        setMarkup(
          editTercero.markup != null ? editTercero.markup.toString() : "",
        );
        setSellIva(
          editTercero.iva != null ? editTercero.iva.toString() : "",
        );
        const c = Number(editTercero.cantidad) || 1;
        setCantidad(String(c));
        const unit = (Number(editTercero.precioVenta) / c).toFixed(2);
        setPrecioUnitario(unit);
        setPrecioVenta(editTercero.precioVenta.toString());
        setRecibo(editTercero.recibo || null);
      } else {
        setNombre("");
        setProveedor(null);
        setPrecioCompra("");
        setBuyIva("");
        setMarkup("");
        setSellIva("");
        setCantidad("1");
        setPrecioUnitario("");
        setPrecioVenta("");
        setRecibo(null);
      }
    }
  }, [open, editTercero]);

  const recalcFromFields = (pc: string, mk: string, si: string, cd: string) => {
    const unit =
      calcularPrecioVenta(
        pc === "" ? 0 : Number(pc),
        mk === "" ? 0 : Number(mk),
        si === "" ? 0 : Number(si),
      ) ?? 0;
    setPrecioUnitario(unit.toString());
    const c = Number(cd) || 1;
    setPrecioVenta(Math.round(unit * c).toString());
  };

  const handlePrecioCompraChange = (value: string) => {
    setPrecioCompra(value);
    recalcFromFields(value, markup, sellIva, cantidad);
  };

  const handleMarkupChange = (value: string) => {
    setMarkup(value);
    recalcFromFields(precioCompra, value, sellIva, cantidad);
  };

  const handleSellIvaChange = (value: string) => {
    setSellIva(value);
    recalcFromFields(precioCompra, markup, value, cantidad);
  };

  const handleCantidadChange = (value: string) => {
    if (value === "") {
      setCantidad("");
    } else {
      setCantidad(value);
      const unit = Number(precioUnitario) || 0;
      setPrecioVenta(Math.round(unit * Number(value)).toString());
    }
  };

  const handleSubmit = async () => {
    if (!proveedor || !nombre || !precioCompra || !precioVenta || !cantidad)
      return;

    await onSubmit({
      nombre,
      proveedorId: proveedor.id,
      cantidad: Number(cantidad),
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      iva: sellIva !== "" ? Number(sellIva) : null,
      buyIva: buyIva !== "" ? Number(buyIva) : null,
      markup: markup !== "" ? Number(markup) : null,
      recibo,
    });
  };

  // Computed values for the explanation box
  const precioCompraNum = precioCompra !== "" ? Number(precioCompra) : null;
  const markupNum = markup !== "" ? Number(markup) : 0;
  const sellIvaNum = sellIva !== "" ? Number(sellIva) : 0;
  const cantidadNum = cantidad !== "" ? Number(cantidad) : null;
  const precioUnitarioNum =
    precioUnitario !== "" ? Number(precioUnitario) : null;
  const precioVentaNum = precioVenta !== "" ? Number(precioVenta) : null;

  const isValid =
    nombre &&
    proveedor &&
    precioCompra !== "" &&
    precioVenta !== "" &&
    cantidad !== "" &&
    Number(precioCompra) >= 0 &&
    Number(precioVenta) >= 0 &&
    Number(cantidad) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editTercero
          ? "Editar Reparación de Tercero"
          : "Agregar Reparación de Tercero"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <ORepObjectAutocomplete
              label="Proveedor"
              searchOptions={searchProveedores}
              initialOptions={initialProveedores}
              selectOption={(option) => {
                setProveedor(option?.object || null);
              }}
              initialValue={editTercero?.proveedor?.id.toString()}
            />
          </Grid>

          <Grid item xs={12}>
            <ORepTextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>

          {/* Row 1: Precio compra + IVA compra */}
          <Grid item xs={6}>
            <ORepTextField
              label="Precio de compra"
              type="number"
              value={precioCompra}
              onChange={(e) => handlePrecioCompraChange(e.target.value)}
              disabled={loading}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <ORepTextField
              label="IVA compra informativo (%)"
              type="number"
              value={buyIva}
              onChange={(e) => setBuyIva(e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* Row 2: Margen + IVA venta */}
          <Grid item xs={6}>
            <ORepTextField
              label="Margen (%)"
              type="number"
              value={markup}
              onChange={(e) => handleMarkupChange(e.target.value)}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={6}>
            <ORepTextField
              label="IVA venta (%)"
              type="number"
              value={sellIva}
              onChange={(e) => handleSellIvaChange(e.target.value)}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 0.5 }} />
          </Grid>

          {/* Precio unitario calculado (read-only) */}
          <Grid item xs={12}>
            <ORepTextField
              label="Precio unitario (con IVA)"
              type="number"
              value={precioUnitario}
              InputProps={{ readOnly: true }}
              disabled={loading}
              sx={{
                "& .MuiInputBase-root": {
                  bgcolor: "grey.100",
                  cursor: "default",
                },
                "& .MuiInputBase-input": {
                  cursor: "default",
                },
              }}
            />
          </Grid>

          {/* Cantidad (decimal, default 1) */}
          <Grid item xs={12}>
            <ORepTextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => handleCantidadChange(e.target.value)}
              disabled={loading}
              required
              inputProps={{
                min: 0,
                step: 0.001,
              }}
            />
          </Grid>

          {/* Precio de venta total (read-only) */}
          <Grid item xs={12}>
            <ORepTextField
              label="Precio venta total (con IVA)"
              type="number"
              value={precioVenta}
              InputProps={{ readOnly: true }}
              disabled={loading}
              sx={{
                "& .MuiInputBase-root": {
                  bgcolor: "grey.100",
                  cursor: "default",
                },
                "& .MuiInputBase-input": {
                  cursor: "default",
                },
              }}
            />
          </Grid>

          {/* Explanation box — same style as RepuestosModal */}
          {precioCompraNum != null && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "grey.50",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Precio unitario = Precio compra x (1 + Margen/100) x (1 + IVA
                  venta/100)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {precioUnitarioNum != null ? (
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ fontWeight: 800 }}
                      >
                        {getFormattedPrice(precioUnitarioNum)}
                      </Typography>
                      {` = ${getFormattedPrice(precioCompraNum)} x (1 + ${markupNum}/100) x (1 + ${sellIvaNum}/100)`}
                    </>
                  ) : (
                    "-"
                  )}
                </Typography>

                {cantidadNum != null && cantidadNum !== 1 && (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Precio venta total = Precio unitario x Cantidad
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ fontWeight: 800 }}
                      >
                        {precioVentaNum != null
                          ? getFormattedPrice(precioVentaNum)
                          : "-"}
                      </Typography>
                      {precioUnitarioNum != null
                        ? ` = ${getFormattedPrice(precioUnitarioNum)} x ${cantidadNum}`
                        : ""}
                    </Typography>
                  </>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  component="div"
                  sx={{ mt: 1, fontStyle: "italic" }}
                >
                  El precio se redondea al entero más cercano.
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Recibo
            </Typography>
            <Box sx={{ overflow: "hidden" }}>
              <ImageInput
                label=""
                image={recibo}
                setImage={(image: string | null) => setRecibo(image)}
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {editTercero ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TercerosModal;
