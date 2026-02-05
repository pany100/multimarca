"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import PrestamoHerramientasForm, {
  schema,
} from "@/sections/prestamo-herramientas/PrestamoHerramientasForm";
import PrestamoHerramientasTable from "@/sections/prestamo-herramientas/PrestamoHerramientasTable";

const PrestamoHerramientasPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/prestamo-herramientas"
      table={PrestamoHerramientasTable}
      form={PrestamoHerramientasForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default PrestamoHerramientasPage;
