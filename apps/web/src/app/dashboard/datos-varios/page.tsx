"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import DatosVariosForm, {
  schema,
} from "@/sections/datos-varios/DatosVariosForm";
import DatosVariosTable from "@/sections/datos-varios/DatosVariosTable";

const DatosVariosPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/datos-varios"
      table={DatosVariosTable}
      form={DatosVariosForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default DatosVariosPage;
