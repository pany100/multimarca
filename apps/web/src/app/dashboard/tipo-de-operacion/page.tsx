"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import TiposOperacionForm, {
  schema,
} from "@/sections/tipos-operacion/TiposOperacionForm";
import TiposOperacionTable from "@/sections/tipos-operacion/TiposOperacionTable";

const TipoOperacionPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/tipo-operacion"
      table={TiposOperacionTable}
      form={TiposOperacionForm}
      crudActions={[CrudAction.EDIT, CrudAction.DELETE, CrudAction.ADD]}
      schema={schema}
    />
  );
};

export default TipoOperacionPage;
