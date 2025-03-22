"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import GastosForm, { schema } from "@/sections/gastos/GastosForm";
import GastosTable from "@/sections/gastos/GastosTable";
import ResumenUltimaSemana from "@/sections/gastos/ResumenUltimaSemana";
import { Box } from "@mui/material";

const GastosPage = () => {
  return (
    <Box>
      <ResumenUltimaSemana />
      <ABMPage
        apiEndpoint="/api/gastos"
        table={GastosTable}
        form={GastosForm}
        schema={schema}
        crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
      />
    </Box>
  );
};

export default GastosPage;
