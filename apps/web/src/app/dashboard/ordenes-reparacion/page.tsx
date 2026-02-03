"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { GlobalModalProvider, useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import BoschTemplateButton from "@/sections/ordenes-reparacion/BoschTemplateButton";
import { RefreshTableProvider } from "@/sections/ordenes-reparacion/contexts/RefreshTableContext";
import OrdenesReparacionTable from "@/sections/ordenes-reparacion/OrdenesReparacionTable";
import NuevaOrdenModal from "@/sections/ordenes-reparacion/v2/modals/NuevaOrdenModal";

const ExtraContentWrapper = ({ setRefreshTrigger }: any) => {
  return (
    <RefreshTableProvider
      onRefresh={() => setRefreshTrigger((prev: number) => prev + 1)}
    >
      <BoschTemplateButton />
      <NuevaOrdenModal />
    </RefreshTableProvider>
  );
};

const OrdenesReparacionPageContent = () => {
  const { showModal } = useGlobalModal();

  return (
    <ABMPage
      apiEndpoint="/api/orden-reparacion"
      table={OrdenesReparacionTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      extraContent={ExtraContentWrapper}
      onAddClick={showModal}
    />
  );
};

const OrdenesReparacionPage = () => {
  return (
    <GlobalModalProvider>
      <SnackbarProvider>
        <OrdenesReparacionPageContent />
      </SnackbarProvider>
    </GlobalModalProvider>
  );
};

export default OrdenesReparacionPage;
