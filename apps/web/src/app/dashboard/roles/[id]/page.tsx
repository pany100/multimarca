"use client";

import { SnackbarProvider } from "@/contexts/SnackbarContext";
import { RolAdminPageContent } from "@/sections/roles/admin/RolAdminPageContent";

export default function RolAdminPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <SnackbarProvider>
      <RolAdminPageContent roleId={params.id} />
    </SnackbarProvider>
  );
}
