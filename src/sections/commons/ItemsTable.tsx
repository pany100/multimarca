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

function ItemsTable() {
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
            <TableCell>Cantidad</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length > 0 ? (
            items.map((item: any, index: number) => (
              <TableRow
                key={item.id}
                sx={
                  index === items.length - 1
                    ? {
                        "&:last-child td, &:last-child th": { border: 0 },
                      }
                    : {}
                }
              >
                <TableCell>{item.stockId}</TableCell>
                <TableCell>{item.cantidad}</TableCell>
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
            ))
          ) : (
            <TableRow
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell>---</TableCell>
              <TableCell>---</TableCell>
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
