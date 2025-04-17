"use client";
import AutoInfo from "@/components/orden-reparacion/ver/AutoInfo";
import Controls from "@/components/orden-reparacion/ver/Controls";
import Details from "@/components/orden-reparacion/ver/Details";
import Header from "@/components/orden-reparacion/ver/Header";
import Mechanics from "@/components/orden-reparacion/ver/Mechanics";
import NotasInternas from "@/components/orden-reparacion/ver/NotasInternas";
import PriceInfo from "@/components/orden-reparacion/ver/PriceInfo";
import RevisadoPor from "@/components/orden-reparacion/ver/RevisadoPor";
import ScannerInfo from "@/components/orden-reparacion/ver/ScannerInfo";
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

const VerOrdenReparacionPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { userData, isLoading } = useAuth();

  const [ordenReparacion, setOrdenReparacion] = useState<any>(null);
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
    const fetchOrdenReparacion = async () => {
      try {
        const response = await authFetch(`/api/orden-reparacion/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setOrdenReparacion(data);
        } else {
          console.error("Error al obtener la orden de reparación");
        }
      } catch (error) {
        console.error("Error al obtener la orden de reparación:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenReparacion();
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
      <Header ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 3 }} />
      <AutoInfo ordenReparacion={ordenReparacion} />
      <Divider sx={{ my: 2 }} />
      <Details ordenReparacion={ordenReparacion} />
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
      <PriceInfo ordenReparacion={ordenReparacion} />
    </Paper>
  );
};

export default VerOrdenReparacionPage;
