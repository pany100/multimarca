"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import ExtraccionesForm, {
  schema,
} from "@/sections/extracciones/ExtraccionesForm";
import ExtraccionesTable from "@/sections/extracciones/ExtraccionesTable";

const ExtraccionesPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/extracciones"
      table={ExtraccionesTable}
      form={ExtraccionesForm}
      schema={schema}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
    />
  );
};

export default ExtraccionesPage;
