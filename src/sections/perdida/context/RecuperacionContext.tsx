"use client";

import { createContext, useContext, ReactNode } from "react";

interface RecuperacionContextType {
  perdidaId: number;
}

const RecuperacionContext = createContext<RecuperacionContextType | undefined>(
  undefined
);

interface RecuperacionProviderProps {
  children: ReactNode;
  perdidaId: number;
}

export const RecuperacionProvider = ({
  children,
  perdidaId,
}: RecuperacionProviderProps) => {
  return (
    <RecuperacionContext.Provider value={{ perdidaId }}>
      {children}
    </RecuperacionContext.Provider>
  );
};

export const useRecuperacionContext = (): RecuperacionContextType => {
  const context = useContext(RecuperacionContext);

  if (context === undefined) {
    throw new Error(
      "useRecuperacionContext must be used within a RecuperacionProvider"
    );
  }

  return context;
};
