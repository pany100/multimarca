export const dynamic = "force-dynamic";

import { getSession } from "@/lib/auth/authService";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return redirect("/dashboard");
}
