"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { GlobalModalProvider, useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import NuevoPresupuestoModal from "@/sections/presupuestos/modals/NuevoPresupuestoModal";
import PresupuestosTable from "@/sections/presupuestos/PresupuestosTable";

const ExtraContentWrapper = ({ setRefreshTrigger }: any) => {
  return (
    <NuevoPresupuestoModal
      refreshTable={() => setRefreshTrigger((prev: number) => prev + 1)}
    />
  );
};

const PresupuestosPageContent = () => {
  const { showModal } = useGlobalModal();

  return (
    <ABMPage
      apiEndpoint="/api/presupuestos"
      table={PresupuestosTable}
      crudActions={[CrudAction.ADD, CrudAction.DELETE]}
      extraContent={ExtraContentWrapper}
      onAddClick={showModal}
    />
  );
};

const PresupuestosPage = () => {
  return (
    <SnackbarProvider>
      <GlobalModalProvider>
        <PresupuestosPageContent />
      </GlobalModalProvider>
    </SnackbarProvider>
  );
};

export default PresupuestosPage;
