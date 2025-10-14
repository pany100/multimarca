import { Empleado } from "@prisma/client";
import React from "react";
import useEmpleadoFetcher from "../hooks/useEmpleadoFetcher";

interface EmpleadoContextType {
  empleado: Empleado | null;
  loading: boolean;
}

const EmpleadosContext = React.createContext<EmpleadoContextType | null>(null);

type Props = {
  id: string;
  children: React.ReactNode;
};

export const EmpleadosProvider = ({ id, children }: Props) => {
  const { empleado, loading } = useEmpleadoFetcher(id);

  return (
    <EmpleadosContext.Provider value={{ empleado, loading }}>
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
