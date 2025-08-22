"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ProveedoresForm, {
  schema,
} from "@/sections/proveedores/ProveedoresForm";
import ProveedoresTable from "@/sections/proveedores/ProveedoresTable";
const ProveedoresPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/proveedores"
      table={ProveedoresTable}
      form={ProveedoresForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default ProveedoresPage;
