"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import IngresosVentasForm, {
  schema,
} from "@/sections/ingresos-ventas/IngresosVentasForm";
import IngresosVentasTable from "@/sections/ingresos-ventas/IngresosVentasTable";

const IngresosPorVentasPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/ingresos-ventas"
      table={IngresosVentasTable}
      form={IngresosVentasForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default IngresosPorVentasPage;
