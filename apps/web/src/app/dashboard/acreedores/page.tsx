"use client";

import ABMPage from "@/components/pageV2/ABMPage";
import AcreedoresTable from "@/sections/acreedores/AcreedoresTable";

const AcreedoresPage = () => {
  return (
    <ABMPage
      apiEndpoint="/api/acreedores"
      table={AcreedoresTable}
      crudActions={[]} // Read-only table, no CRUD actions
    />
  );
};

export default AcreedoresPage;
