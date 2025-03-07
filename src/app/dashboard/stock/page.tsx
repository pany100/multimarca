"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import PreciosProveedorModal from "@/sections/stock/PreciosProveedorModal";
import StockForm, { schema } from "@/sections/stock/StockForm";
import StockTable from "@/sections/stock/StockTable";

const StockPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/stock"
      extraContent={PreciosProveedorModal}
      table={StockTable}
      form={StockForm}
      crudActions={[CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default StockPage;
