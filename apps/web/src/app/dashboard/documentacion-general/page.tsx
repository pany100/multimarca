"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import DocumentacionGeneralForm, {
  schema,
} from "@/sections/documentacion-general/DocumentacionGeneralForm";
import DocumentacionGeneralTable from "@/sections/documentacion-general/DocumentacionGeneralTable";

const DocumentacionGeneralPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/documentos-generales"
      table={DocumentacionGeneralTable}
      form={DocumentacionGeneralForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default DocumentacionGeneralPage;
