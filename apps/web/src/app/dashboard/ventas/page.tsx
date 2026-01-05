"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { GlobalModalProvider } from "@/sections/commons/contexts/GlobalModalContext";
import { schema } from "@/sections/ventas/VentasForm";
import NuevaVentaV2Button from "@/sections/ventas/NuevaVentaV2Button";
import NuevaVentaV2Modal from "@/sections/ventas/modals/NuevaVentaV2Modal";
import VentasTable from "@/sections/ventas/VentasTable";

const ExtraContentWrapper = ({ setRefreshTrigger }: any) => {
  return (
    <>
      <NuevaVentaV2Button />
      <NuevaVentaV2Modal
        refreshTable={() => setRefreshTrigger((prev: number) => prev + 1)}
      />
    </>
  );
};

const VentasPage = () => {
  return (
    <SnackbarProvider>
      <GlobalModalProvider>
        <ABMPage
          apiEndpoint="/api/ventas"
          table={VentasTable}
          schema={schema}
          crudActions={[CrudAction.ADD, CrudAction.DELETE]}
          extraContent={ExtraContentWrapper}
        />
      </GlobalModalProvider>
    </SnackbarProvider>
  );
};

export default VentasPage;
