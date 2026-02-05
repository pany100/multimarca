"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import InformacionSensibleForm, {
  schema,
} from "@/sections/informacion-sensible/InformacionSensibleForm";
import InformacionSensibleTable from "@/sections/informacion-sensible/InformacionSensibleTable";

const InformacionSensiblePage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/informacion-sensible"
      table={InformacionSensibleTable}
      form={InformacionSensibleForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default InformacionSensiblePage;
