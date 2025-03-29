import React, { createContext, useContext, useState } from "react";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

interface NuevaOrdenContextType {
  snackbar: SnackbarState;
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>;
}

const NuevaOrdenContext = createContext<NuevaOrdenContextType | undefined>(
  undefined
);

export const NuevaOrdenProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "info",
  });

  return (
    <NuevaOrdenContext.Provider value={{ snackbar, setSnackbar }}>
      {children}
    </NuevaOrdenContext.Provider>
  );
};

export const useNuevaOrdenContext = () => {
  const context = useContext(NuevaOrdenContext);
  if (context === undefined) {
    throw new Error("useNuevaOrden must be used within a NuevaOrdenProvider");
  }
  return context;
};

export default NuevaOrdenContext;
