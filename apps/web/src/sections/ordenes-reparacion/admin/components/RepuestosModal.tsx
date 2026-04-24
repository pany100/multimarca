import ORepObjectAutocomplete from "@/components/orden-reparacion/formV2/commons/inputs/ORepObjectAutocomplete";
import ORepTextField from "@/components/orden-reparacion/formV2/commons/inputs/ORepTextField";
import useStockObjectAutocomplete from "@/hooks/orden-reparacion/useStockObjectAutocomplete";
import { getFormattedPrice } from "@/utils/fieldHelper";
import { calcularPrecioVenta } from "@/utils/stock-pricing";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

interface Stock {
  id: number;
  nombre: string;
  fraccionable?: boolean;
  buyPrice?: number;
  markup?: number;
  buyIva?: number;
  sellIva?: number;
}

interface RepuestoUsado {
  id: number;
  stockId: number;
  precioCompra: number;
  precioVenta: number;
  unidadesConsumidas: number;
  stock: Stock;
  ocultoParaCliente?: boolean;
  iva?: number | null;
  buyIva?: number | null;
  markup?: number | null;
}

interface RepuestosModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    stockId: number;
    precioCompra: number;
    precioVenta: number;
    unidadesConsumidas: number;
    ocultoParaCliente?: boolean;
    iva?: number | null;
    buyIva?: number | null;
    markup?: number | null;
  }) => Promise<boolean>;
  loading?: boolean;
  editRepuesto?: RepuestoUsado;
}

const RepuestosModal = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  editRepuesto,
}: RepuestosModalProps) => {
  const { searchStockObject, initialStock } = useStockObjectAutocomplete();

  const [stock, setStock] = useState<Stock | null>(null);
  const [precioCompra, setPrecioCompra] = useState<string>("");
  const [buyIva, setBuyIva] = useState<string>("");
  const [markup, setMarkup] = useState<string>("");
  const [sellIva, setSellIva] = useState<string>("");
  const [precioVenta, setPrecioVenta] = useState<string>("");
  const [precioUnitario, setPrecioUnitario] = useState<string>("");
  const [unidadesConsumidas, setUnidadesConsumidas] = useState<string>("");
  const [ocultoParaCliente, setOcultoParaCliente] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      if (editRepuesto) {
        setStock(editRepuesto.stock);
        setPrecioCompra(editRepuesto.precioCompra.toString());
        setPrecioVenta(editRepuesto.precioVenta.toString());
        setUnidadesConsumidas(
          String(
            typeof editRepuesto.unidadesConsumidas === "number"
              ? editRepuesto.unidadesConsumidas
              : Number(editRepuesto.unidadesConsumidas),
          ),
        );
        const u = Number(editRepuesto.unidadesConsumidas) || 1;
        const unitPrice = (editRepuesto.precioVenta / u).toFixed(2);
        setPrecioUnitario(unitPrice);
        setOcultoParaCliente(!!editRepuesto.ocultoParaCliente);
        setBuyIva(
          editRepuesto.buyIva != null ? editRepuesto.buyIva.toString() : "",
        );
        setMarkup(
          editRepuesto.markup != null ? editRepuesto.markup.toString() : "",
        );
        setSellIva(editRepuesto.iva != null ? editRepuesto.iva.toString() : "");
      } else {
        setStock(null);
        setPrecioCompra("");
        setBuyIva("");
        setMarkup("");
        setSellIva("");
        setPrecioVenta("");
        setPrecioUnitario("");
        setUnidadesConsumidas("");
        setOcultoParaCliente(false);
      }
    }
  }, [open, editRepuesto]);

  const handleSubmit = async () => {
    if (!stock || !precioCompra || !precioVenta || !unidadesConsumidas) return;

    await onSubmit({
      stockId: stock.id,
      precioCompra: Number(precioCompra),
      precioVenta: Number(precioVenta),
      unidadesConsumidas: Number(unidadesConsumidas),
      ocultoParaCliente,
      iva: sellIva !== "" ? Number(sellIva) : null,
      buyIva: buyIva !== "" ? Number(buyIva) : null,
      markup: markup !== "" ? Number(markup) : null,
    });
  };

  /** Recalculate unit price and total from current field values */
  const recalcFromFields = (
    pc: string,
    mk: string,
    si: string,
    uds: string,
  ) => {
    const newUnitario =
      calcularPrecioVenta(
        pc === "" ? 0 : Number(pc),
        mk === "" ? 0 : Number(mk),
        si === "" ? 0 : Number(si),
      ) ?? 0;
    setPrecioUnitario(newUnitario.toString());
    const units = Number(uds) || 1;
    setPrecioVenta((Math.round(newUnitario * units * 100) / 100).toString());
  };

  const handlePrecioCompraChange = (value: string) => {
    setPrecioCompra(value);
    recalcFromFields(value, markup, sellIva, unidadesConsumidas);
  };

  const handleMarkupChange = (value: string) => {
    setMarkup(value);
    recalcFromFields(precioCompra, value, sellIva, unidadesConsumidas);
  };

  const handleSellIvaChange = (value: string) => {
    setSellIva(value);
    recalcFromFields(
      precioCompra,
      value === "" ? "0" : markup,
      value,
      unidadesConsumidas,
    );
    // Recalc with correct markup
    const newUnitario =
      calcularPrecioVenta(
        precioCompra === "" ? 0 : Number(precioCompra),
        markup === "" ? 0 : Number(markup),
        value === "" ? 0 : Number(value),
      ) ?? 0;
    setPrecioUnitario(newUnitario.toString());
    const units = Number(unidadesConsumidas) || 1;
    setPrecioVenta((Math.round(newUnitario * units * 100) / 100).toString());
  };

  const handleUnidadesChange = (value: string) => {
    if (value === "") {
      setUnidadesConsumidas("");
    } else {
      setUnidadesConsumidas(value);
      const unitPrice = Number(precioUnitario) || 0;
      setPrecioVenta((Math.round(unitPrice * Number(value) * 100) / 100).toString());
    }
  };

  // Computed values for the explanation box
  const precioCompraNum = precioCompra !== "" ? Number(precioCompra) : null;
  const markupNum = markup !== "" ? Number(markup) : 0;
  const sellIvaNum = sellIva !== "" ? Number(sellIva) : 0;
  const precioUnitarioNum =
    precioUnitario !== "" ? Number(precioUnitario) : null;
  const precioVentaNum = precioVenta !== "" ? Number(precioVenta) : null;
  const unidadesNum =
    unidadesConsumidas !== "" ? Number(unidadesConsumidas) : null;

  const isValid =
    stock &&
    precioCompra !== "" &&
    precioVenta !== "" &&
    unidadesConsumidas !== "" &&
    Number(precioCompra) >= 0 &&
    Number(precioVenta) >= 0 &&
    Number(unidadesConsumidas) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editRepuesto ? "Editar Repuesto Usado" : "Agregar Repuesto Usado"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={1} sx={{ pt: 1 }}>
          <Grid item xs={12}>
            <ORepObjectAutocomplete
              label="Repuesto"
              searchOptions={searchStockObject}
              initialOptions={initialStock}
              selectOption={(option) => {
                const obj = option?.object;
                const si = obj?.sellIva ?? 0;
                const bi = obj?.buyIva ?? 0;
                const mk = obj?.markup ?? 0;
                const pv = calcularPrecioVenta(obj?.buyPrice, mk, si) ?? 0;
                setStock(obj || null);
                setPrecioCompra(obj?.buyPrice?.toString() ?? "");
                setBuyIva(bi ? bi.toString() : "");
                setMarkup(mk ? mk.toString() : "");
                setSellIva(si ? si.toString() : "");
                setPrecioUnitario(pv.toString());
                setUnidadesConsumidas("1");
                setPrecioVenta(pv.toString());
              }}
              initialValue={editRepuesto?.stock?.id.toString()}
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

          {/* Row 3: Precio unitario (read-only, calculado) */}
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

          {/* Row 4: Unidades */}
          <Grid item xs={12}>
            <ORepTextField
              label={
                stock?.fraccionable
                  ? "Litros consumidos"
                  : "Unidades consumidas"
              }
              type="number"
              value={unidadesConsumidas}
              onChange={(e) => handleUnidadesChange(e.target.value)}
              disabled={loading}
              required
              inputProps={{
                min: 0,
                step: stock?.fraccionable ? 0.1 : 1,
              }}
            />
          </Grid>

          {/* Row 5: Precio venta total (read-only, calculado) */}
          <Grid item xs={12}>
            <ORepTextField
              label="Precio venta total"
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

          {/* Explanation box */}
          {stock && precioCompraNum != null && (
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
                {/* Precio unitario breakdown */}
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

                {/* Precio venta total (only if >1 unit) */}
                {unidadesNum != null && unidadesNum > 1 && (
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Precio venta total = Precio unitario x Unidades
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
                        ? ` = ${getFormattedPrice(precioUnitarioNum)} x ${unidadesNum}`
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
                  Valores pre-cargados del stock. Editables para esta operación.
                  Los precios se redondean a 2 decimales.
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={ocultoParaCliente}
                  onChange={(e) => setOcultoParaCliente(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Oculto para el cliente"
            />
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
          {editRepuesto ? "Actualizar" : "Agregar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepuestosModal;
