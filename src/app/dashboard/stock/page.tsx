"use client";

import CrudTable from "@/components/CrudTable";
import DynamicForm, { FieldConfig } from "@/components/DynamicForm";

interface Stock {
  id: string;
  name: string;
  brand: string;
  buyPrice: number;
  units?: number | null;
  restockValue: number | null;
  label: string | null;
  markup: number | null;
  proveedorId: number;
  proveedor?: {
    id: number;
    name: string;
  };
}

const StockPage = () => {
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "Nombre", width: 200 },
    { field: "brand", headerName: "Marca", width: 150 },
    { field: "buyPrice", headerName: "Precio de compra", width: 150 },
    { field: "units", headerName: "Unidades", width: 100 },
    { field: "restockValue", headerName: "Valor de reposición", width: 150 },
    { field: "label", headerName: "Etiqueta", width: 150 },
    { field: "markup", headerName: "Margen", width: 100 },
    {
      field: "proveedor",
      headerName: "Proveedor",
      width: 200,
      renderCell: (params: any) => params.row.proveedor?.name || "",
    },
  ];

  const formFields: FieldConfig[] = [
    { name: "name", label: "Nombre", type: "text" },
    { name: "brand", label: "Marca", type: "text" },
    { name: "buyPrice", label: "Precio de compra", type: "number" },
    { name: "restockValue", label: "Valor de reposición", type: "number" },
    { name: "label", label: "Etiqueta", type: "text" },
    { name: "markup", label: "Margen", type: "number" },
    {
      name: "proveedorId",
      label: "Proveedor",
      type: "autocomplete",
      searchOptions: async (query: string) => {
        const response = await fetch(
          `/api/proveedores?query=${query}&limit=10&page=0`
        );
        const data = await response.json();
        return data.items.map((proveedor: { name: any; id: any }) => ({
          label: proveedor.name,
          value: proveedor.id,
        }));
      },
      getInitialValue: (stock: Stock) => ({
        value: stock.proveedor?.id || stock.proveedorId,
        label: stock.proveedor?.name || "",
      }),
    },
  ];

  const renderEditForm = (
    stock: Stock | null,
    handleChange: (field: keyof Stock, value: any) => void
  ) => (
    <DynamicForm<Stock>
      item={stock}
      fields={formFields}
      handleChange={handleChange}
    />
  );

  const createNewStock = (): Stock => {
    return {
      id: "",
      name: "",
      brand: "",
      buyPrice: 0,
      restockValue: null,
      label: null,
      markup: null,
      proveedorId: 0,
    };
  };

  return (
    <CrudTable<Stock>
      title="Stock"
      columns={columns}
      apiEndpoint="/api/stock"
      renderEditForm={renderEditForm}
      createNewItem={createNewStock}
    />
  );
};

export default StockPage;
