import { getFormattedPrice } from "@/utils/fieldHelper";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useFormContext } from "react-hook-form";

type Props = {
  showPrecios?: boolean;
};

function ItemsTable({ showPrecios = false }: Props) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const items = watch("items") || [];
  const error = errors.items?.message as string | undefined;

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Stock</TableCell>
            {showPrecios && <TableCell>Rótulo</TableCell>}
            <TableCell>Cantidad</TableCell>
            {showPrecios && <TableCell>Precio Unit.</TableCell>}
            {showPrecios && <TableCell>IVA %</TableCell>}
            {showPrecios && <TableCell>Precio c/IVA</TableCell>}
            {showPrecios && <TableCell>Subtotal</TableCell>}
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item: any, index: number) => {
              const precioUnitario = Number(item.precioUnitario) || 0;
              const ivaPercent = Number(item.iva) || 0;
              const precioConIva = precioUnitario * (1 + ivaPercent / 100);
              const subtotal = precioConIva * Number(item.cantidad);

              return (
                <TableRow
                  key={item.stockId}
                  sx={
                    index === items.length - 1
                      ? {
                          "&:last-child td, &:last-child th": { border: 0 },
                        }
                      : {}
                  }
                >
                  <TableCell>{item.name}</TableCell>
                  {showPrecios && <TableCell>{item.label || "—"}</TableCell>}
                  <TableCell>{item.cantidad}</TableCell>
                  {showPrecios && (
                    <TableCell>
                      {item.precioUnitario != null
                        ? getFormattedPrice(precioUnitario)
                        : "—"}
                    </TableCell>
                  )}
                  {showPrecios && (
                    <TableCell>
                      {item.iva != null ? `${ivaPercent}%` : "—"}
                    </TableCell>
                  )}
                  {showPrecios && (
                    <TableCell>
                      {item.precioUnitario != null
                        ? getFormattedPrice(precioConIva)
                        : "—"}
                    </TableCell>
                  )}
                  {showPrecios && (
                    <TableCell>
                      {item.precioUnitario != null
                        ? getFormattedPrice(subtotal)
                        : "—"}
                    </TableCell>
                  )}
                  <TableCell>
                    <Button
                      onClick={() => {
                        const newItems = items.filter((i: any) => i !== item);
                        setValue("items", newItems);
                      }}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>---</TableCell>
              {showPrecios && <TableCell>---</TableCell>}
              <TableCell>---</TableCell>
              {showPrecios && <TableCell>---</TableCell>}
              {showPrecios && <TableCell>---</TableCell>}
              {showPrecios && <TableCell>---</TableCell>}
              {showPrecios && <TableCell>---</TableCell>}
              <TableCell>---</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {error && <Typography color="error">{error}</Typography>}
    </>
  );
}

export default ItemsTable;
