"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import BoschTemplateButton from "@/sections/ordenes-reparacion/BoschTemplateButton";
import OrdenesReparacionTable from "@/sections/ordenes-reparacion/OrdenesReparacionTable";

const OrdenesReparacionPage = () => {
  return (
    <>
      <ABMPage
        apiEndpoint="/api/orden-reparacion"
        table={OrdenesReparacionTable}
        crudActions={[CrudAction.ADD, CrudAction.DELETE]}
        extraContent={BoschTemplateButton}
      />
    </>
  );
};

export default OrdenesReparacionPage;
