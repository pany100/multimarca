"use client";
import PresupuestoAutoInfo from "@/components/orden-reparacion/presupuesto/PresupuestoAutoInfo";
import PresupuestoHeader from "@/components/orden-reparacion/presupuesto/PresupuestoHeader";
import Details from "@/components/orden-reparacion/ver/Details";
import { useFetch } from "@/contexts/FetchContext";
import { useAuth } from "@/hooks/useAuth";
import { Box, CircularProgress, Divider, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VerPresupuestosPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  const [presupuesto, setPresupuesto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!isLoading) {
      const permisos = userData?.permisos || [];
      if (!permisos.includes("Reparaciones")) {
        router.push("/dashboard");
      }
    }
  }, [userData, router, isLoading]);

  const { authFetch } = useFetch();

  useEffect(() => {
    const fetchPresupuesto = async () => {
      try {
        const response = await authFetch(`/api/presupuestos/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setPresupuesto(data);
        } else {
          console.error("Error al obtener el presupuesto");
        }
      } catch (error) {
        console.error("Error al obtener la orden de reparación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPresupuesto();
  }, [params.id, authFetch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        mb: 3,
      }}
    >
      <PresupuestoHeader presupuesto={presupuesto} />
      <Divider sx={{ my: 3 }} />
      <PresupuestoAutoInfo presupuesto={presupuesto} />
      <Divider sx={{ my: 2 }} />
      <Details ordenReparacion={presupuesto} />
      <Divider sx={{ my: 2 }} />
      {/*
      <DetalleTrabajo ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <NotasInternas ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <Controls ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <Mechanics ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <RevisadoPor ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <ScannerInfo ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <Recibos ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <PriceInfo ordenReparacion={ordenReparacion} /> */}
    </Paper>
  );
};

export default VerPresupuestosPage;
