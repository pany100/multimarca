"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import {
  GlobalModalProvider,
  useGlobalModal,
} from "@/sections/commons/contexts/GlobalModalContext";
import NuevaOrdenDeCompraModal from "@/sections/orden-de-compra/modals/NuevaOrdenDeCompraModal";
import OrdenDeCompraTable from "@/sections/orden-de-compra/OrdenDeCompraTable";

const ExtraContentWrapper = ({ setRefreshTrigger }: any) => {
  return (
    <NuevaOrdenDeCompraModal
      refreshTable={() => setRefreshTrigger((prev: number) => prev + 1)}
    />
  );
};

const OrdenDeCompraPageContent = () => {
  const { showModal } = useGlobalModal();

  return (
    <ABMPage
      apiEndpoint="/api/orden-de-compra"
      table={OrdenDeCompraTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      extraContent={ExtraContentWrapper}
      onAddClick={showModal}
    />
  );
};

const OrdenDeCompraPage = () => {
  return (
    <SnackbarProvider>
      <GlobalModalProvider>
        <OrdenDeCompraPageContent />
      </GlobalModalProvider>
    </SnackbarProvider>
  );
};

export default OrdenDeCompraPage;
