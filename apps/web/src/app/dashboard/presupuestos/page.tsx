"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { GlobalModalProvider } from "@/sections/commons/contexts/GlobalModalContext";
import NuevoPresupuestoModal from "@/sections/presupuestos/modals/NuevoPresupuestoModal";
import NuevoPresupuestoButton from "@/sections/presupuestos/NuevoPresupuestoButton";
import PresupuestosTable from "@/sections/presupuestos/PresupuestosTable";

const ExtraContentWrapper = ({ setRefreshTrigger }: any) => {
  return (
    <>
      <NuevoPresupuestoButton />
      <NuevoPresupuestoModal
        refreshTable={() => setRefreshTrigger((prev: number) => prev + 1)}
      />
    </>
  );
};

const PresupuestosPage = () => {
  return (
    <SnackbarProvider>
      <GlobalModalProvider>
        <ABMPage
          apiEndpoint="/api/presupuestos"
          table={PresupuestosTable}
          crudActions={[CrudAction.ADD, CrudAction.DELETE]}
          extraContent={ExtraContentWrapper}
        />
      </GlobalModalProvider>
    </SnackbarProvider>
  );
};

export default PresupuestosPage;
