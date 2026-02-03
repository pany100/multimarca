"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { GlobalModalProvider, useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import NuevaVentaV2Modal from "@/sections/ventas/modals/NuevaVentaV2Modal";
import VentasTable from "@/sections/ventas/VentasTable";

const ExtraContentWrapper = ({ setRefreshTrigger }: any) => {
  return (
    <NuevaVentaV2Modal
      refreshTable={() => setRefreshTrigger((prev: number) => prev + 1)}
    />
  );
};

const VentasPageContent = () => {
  const { showModal } = useGlobalModal();

  return (
    <ABMPage
      apiEndpoint="/api/ventas"
      table={VentasTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      extraContent={ExtraContentWrapper}
      onAddClick={showModal}
    />
  );
};

const VentasPage = () => {
  return (
    <SnackbarProvider>
      <GlobalModalProvider>
        <VentasPageContent />
      </GlobalModalProvider>
    </SnackbarProvider>
  );
};

export default VentasPage;
