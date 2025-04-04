"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import StockExtraContent from "@/sections/stock/StockExtraContent";
import StockForm, { schema } from "@/sections/stock/StockForm";
import StockTable from "@/sections/stock/StockTable";

const StockPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/stock"
      extraContent={StockExtraContent}
      table={StockTable}
      form={StockForm}
      crudActions={[CrudAction.EDIT, CrudAction.DELETE]}
      schema={schema}
    />
  );
};

export default StockPage;
