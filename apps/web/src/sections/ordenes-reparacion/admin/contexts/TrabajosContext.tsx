import React, { createContext, useContext, useState } from "react";

interface TrabajosContextType {
  descripcion: string;
  setDescripcion: (descripcion: string) => void;
  precioUnitario: number | null;
  setPrecioUnitario: (precio: number | null) => void;
  diasParaRecordatorio: number | null;
  setDiasParaRecordatorio: (dias: number | null) => void;
  pdfName: string;
  setPdfName: (pdfName: string) => void;
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
  initialPdfName?: string | null;
}

export const TrabajosProvider = ({
  children,
  initialDescripcion = "",
  initialPrecioUnitario = null,
  initialDiasParaRecordatorio = null,
  initialPdfName = "",
}: TrabajosProviderProps) => {
  const [descripcion, setDescripcion] = useState<string>(initialDescripcion);
  const [precioUnitario, setPrecioUnitario] = useState<number | null>(
    initialPrecioUnitario
  );
  const [diasParaRecordatorio, setDiasParaRecordatorio] = useState<
    number | null
  >(initialDiasParaRecordatorio);
  const [pdfName, setPdfName] = useState<string>(initialPdfName ?? "");

  const resetForm = () => {
    setDescripcion("");
    setPrecioUnitario(null);
    setDiasParaRecordatorio(null);
    setPdfName("");
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
        pdfName,
        setPdfName,
        resetForm,
      }}
    >
      {children}
    </TrabajosContext.Provider>
  );
};
