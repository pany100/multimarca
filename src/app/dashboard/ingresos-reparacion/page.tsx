"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import IngresosReparacionForm, {
  schema,
} from "@/sections/ingresos-reparacion/IngresosReparacionForm";
import IngresosReparacionTable from "@/sections/ingresos-reparacion/IngresosReparacionTable";

const IngresosPorReparacionPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/ingresos-reparacion"
      table={IngresosReparacionTable}
      form={IngresosReparacionForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default IngresosPorReparacionPage;
