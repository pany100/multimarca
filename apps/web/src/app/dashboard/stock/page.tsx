"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import FormSnackbar from "@/components/orden-reparacion/formV2/commons/FormSnackbar";
import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { GlobalModalProvider, useGlobalModal } from "@/sections/commons/contexts/GlobalModalContext";
import StockExtraContent from "@/sections/stock/StockExtraContent";
import StockForm, { schema } from "@/sections/stock/StockForm";
import StockTable from "@/sections/stock/StockTable";
import NuevoStockModal from "@/sections/stock/modals/NuevoStockModal";

const ExtraContentWrapper = ({ setRefreshTrigger }: any) => {
  return (
    <>
      <StockExtraContent setRefreshTrigger={setRefreshTrigger} />
      <NuevoStockModal
        refreshTable={() => setRefreshTrigger((prev: number) => prev + 1)}
      />
    </>
  );
};

const StockPageContent = () => {
  const { showModal } = useGlobalModal();

  return (
    <ABMPage
      apiEndpoint="/api/stock"
      extraContent={ExtraContentWrapper}
      table={StockTable}
      form={StockForm}
      crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
      onAddClick={showModal}
    />
  );
};

const StockPage = () => {
  return (
    <SnackbarProvider>
      <GlobalModalProvider>
        <FormSnackbar />
        <StockPageContent />
      </GlobalModalProvider>
    </SnackbarProvider>
  );
};

export default StockPage;
