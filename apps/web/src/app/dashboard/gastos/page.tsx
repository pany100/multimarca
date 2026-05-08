"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { useAuth } from "@/hooks/useAuth";
import GastosForm, { schema } from "@/sections/gastos/GastosForm";
import GastosTable from "@/sections/gastos/GastosTable";
import ResumenUltimaSemana from "@/sections/gastos/ResumenUltimaSemana";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

const GastosPage = () => {
  const { userData } = useAuth();
  const permisos = userData?.permisos || [];
  const router = useRouter();

  return (
    <Box>
      {permisos.includes("ResumenPorMecanico") && <ResumenUltimaSemana />}
      <ABMPage
        apiEndpoint="/api/gastos"
        table={GastosTable}
        form={GastosForm}
        schema={schema}
        crudActions={[CrudAction.ADD, CrudAction.EDIT, CrudAction.DELETE]}
        onAddClick={() => router.push("/dashboard/gastos/nuevo")}
        onEditClick={(entity) =>
          router.push(`/dashboard/gastos/${entity.id}/editar`)
        }
      />
    </Box>
  );
};

export default GastosPage;
