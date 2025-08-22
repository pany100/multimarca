"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import CategoriasGastoForm, {
  schema,
} from "@/sections/categorias-gasto/CategoriasGastoForm";
import CategoriasGastoTable from "@/sections/categorias-gasto/CategoriasGastoTable";

const CategoriasGastoPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/categorias-gasto"
      table={CategoriasGastoTable}
      form={CategoriasGastoForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default CategoriasGastoPage;
