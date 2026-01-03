import React, { createContext, useContext, useState } from "react";

interface TrabajosContextType {
  descripcion: string;
  setDescripcion: (descripcion: string) => void;
  precioUnitario: number | null;
  setPrecioUnitario: (precio: number | null) => void;
  diasParaRecordatorio: number | null;
  setDiasParaRecordatorio: (dias: number | null) => void;
  resetForm: () => void;
}

const TrabajosContext = createContext<TrabajosContextType | undefined>(
  undefined
);

export const useTrabajosContext = () => {
  const context = useContext(TrabajosContext);
  if (!context) {
    throw new Error(
      "useTrabajosContext must be used within a TrabajosProvider"
    );
  }
  return context;
};

interface TrabajosProviderProps {
  children: React.ReactNode;
  initialDescripcion?: string;
  initialPrecioUnitario?: number | null;
  initialDiasParaRecordatorio?: number | null;
}

export const TrabajosProvider = ({
  children,
  initialDescripcion = "",
  initialPrecioUnitario = null,
  initialDiasParaRecordatorio = null,
}: TrabajosProviderProps) => {
  const [descripcion, setDescripcion] = useState<string>(initialDescripcion);
  const [precioUnitario, setPrecioUnitario] = useState<number | null>(
    initialPrecioUnitario
  );
  const [diasParaRecordatorio, setDiasParaRecordatorio] = useState<
    number | null
  >(initialDiasParaRecordatorio);

  const resetForm = () => {
    setDescripcion("");
    setPrecioUnitario(null);
    setDiasParaRecordatorio(null);
  };

  return (
    <TrabajosContext.Provider
      value={{
        descripcion,
        setDescripcion,
        precioUnitario,
        setPrecioUnitario,
        diasParaRecordatorio,
        setDiasParaRecordatorio,
        resetForm,
      }}
    >
      {children}
    </TrabajosContext.Provider>
  );
};
