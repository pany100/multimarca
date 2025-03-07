"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import IngresosManualesForm, {
  schema,
} from "@/sections/ingresos-manuales/IngresosManualesForm";
import IngresosManualesTable from "@/sections/ingresos-manuales/IngresosManualesTable";

const IngresosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/ingresos-manuales"
      table={IngresosManualesTable}
      form={IngresosManualesForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default IngresosPage;
