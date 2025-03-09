"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import PermisosGastoForm, {
  schema,
} from "@/sections/permisos-gasto/PermisosGastoForm";
import PermisosGastoTable from "@/sections/permisos-gasto/PermisosGastoTable";

const PermisosGastoPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/permisos-gasto"
      table={PermisosGastoTable}
      form={PermisosGastoForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default PermisosGastoPage;
