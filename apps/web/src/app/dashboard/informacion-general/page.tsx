"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import InformacionGeneralForm, {
  schema,
} from "@/sections/informacion-general/InformacionGeneralForm";
import InformacionGeneralTable from "@/sections/informacion-general/InformacionGeneralTable";

const InformacionGeneralPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/informacion-general"
      table={InformacionGeneralTable}
      form={InformacionGeneralForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default InformacionGeneralPage;
