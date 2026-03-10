"use client";

import { CrudAction } from "@/components/formV2/constants";
import ABMPage from "@/components/pageV2/ABMPage";
import { useAuth } from "@/hooks/useAuth";
import ConfiguracionGeneralForm, {
  schema,
} from "@/sections/configuracion-general/ConfiguracionGeneralForm";
import ConfiguracionGeneralTable from "@/sections/configuracion-general/ConfiguracionGeneralTable";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ConfiguracionGeneralPage = () => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos ?? [];
      if (!permisos.includes("AdministracionGeneral")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  if (isLoading) return null;

  const permisos = userData?.permisos ?? [];
  if (!permisos.includes("AdministracionGeneral")) {
    return null;
  }

  return (
    <ABMPage
      apiEndpoint="/api/configuracion-general"
      table={ConfiguracionGeneralTable}
      form={ConfiguracionGeneralForm}
      crudActions={[CrudAction.EDIT]}
      schema={schema}
      editMethod="PATCH"
    />
  );
};

export default ConfiguracionGeneralPage;
