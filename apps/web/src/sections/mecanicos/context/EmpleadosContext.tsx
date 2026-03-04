import { useSnackbarContext } from "@/contexts/SnackbarContext";
import useWeek from "@/sections/gastos/hooks/useWeek";
import { AusenciaProgramada, CertificadoEstudio, Empleado, Inasistencia, LlegadaTarde, HoraExtra, NotaAdministrativa, Premio, Apercibimiento, Sueldo } from "@prisma/client";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import useEmpleadoFetcher from "../hooks/useEmpleadoFetcher";

interface ReparacionData {
  id: number;
  estado: string;
  fechaSalidaReparacion: string;
  kilometros: number;
  auto: {
    id: number;
    patent: string;
  };
  totalAPagar: string;
  totalManoDeObra: string;
}

/** Respuesta API: los paths de documentación vienen como string | null desde el backend */
type EmpleadoWithAusencias = Omit<
  Empleado,
  "licenciaConducirPath" | "inscripcionMonotributoPath" | "recategorizacionMonotributoPath" | "curriculumPath"
> & {
  licenciaConducirPath?: string | null;
  inscripcionMonotributoPath?: string | null;
  recategorizacionMonotributoPath?: string | null;
  curriculumPath?: string | null;
} & {
  ausenciasProgramadas?: AusenciaProgramada[];
  inasistencias?: Inasistencia[];
  llegadasTarde?: LlegadaTarde[];
  horasExtra?: HoraExtra[];
  premios?: Premio[];
  apercibimientos?: Apercibimiento[];
  certificadosEstudio?: CertificadoEstudio[];
  sueldos?: Sueldo[];
  notasAdministrativas?: NotaAdministrativa[];
};

interface EmpleadoContextType {
  empleado: EmpleadoWithAusencias | null;
  loading: boolean;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  setDateRange: (dateRange: { from: Date | null; to: Date | null }) => void;
  reparaciones: ReparacionData[] | null;
  loadingReparaciones: boolean;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

const EmpleadosContext = React.createContext<EmpleadoContextType | null>(null);

type Props = {
  id: string;
  children: React.ReactNode;
};

export const EmpleadosProvider = ({ id, children }: Props) => {
  const { startDate, endDate } = useWeek();
  const {
    empleado,
    loading,
    fetchReparaciones,
    loadingReparaciones,
    setRefreshTrigger,
  } = useEmpleadoFetcher(id);
  const [reparaciones, setReparaciones] = useState<any | null>(null);

  const { setSnackbar } = useSnackbarContext();
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: startDate,
    to: endDate,
  });

  useEffect(() => {
    const fetchData = async (start: Date, end: Date) => {
      try {
        const reparaciones = await fetchReparaciones(start, end);
        setReparaciones(reparaciones);
      } catch (err) {
        console.error("Error fetching data:", err);
        setSnackbar({
          message: "Error al cargar los datos: " + err,
          severity: "error",
          open: true,
        });
      }
    };

    if (dateRange.from && dateRange.to && empleado !== null) {
      fetchData(dateRange.from, dateRange.to);
    }
  }, [dateRange, empleado]);

  return (
    <EmpleadosContext.Provider
      value={{
        empleado,
        loading,
        dateRange,
        setDateRange,
        reparaciones,
        loadingReparaciones,
        setRefreshTrigger,
      }}
    >
      {children}
    </EmpleadosContext.Provider>
  );
};

export const useEmpleadosContext = () => {
  const context = React.useContext(EmpleadosContext);
  if (!context) {
    throw new Error(
      "useEmpleadosContext must be used within an EmpleadosProvider"
    );
  }
  return context;
};
