"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { GlobalModalProvider } from "@/sections/commons/contexts/GlobalModalContext";
import BoschTemplateButton from "@/sections/ordenes-reparacion/BoschTemplateButton";
import OrdenesReparacionTable from "@/sections/ordenes-reparacion/OrdenesReparacionTable";

const OrdenesReparacionPage = () => {
  return (
    <GlobalModalProvider>
      <ABMPage
        apiEndpoint="/api/orden-reparacion"
        table={OrdenesReparacionTable}
        crudActions={[CrudAction.ADD, CrudAction.DELETE]}
        extraContent={BoschTemplateButton}
      />
    </GlobalModalProvider>
  );
};

export default OrdenesReparacionPage;
