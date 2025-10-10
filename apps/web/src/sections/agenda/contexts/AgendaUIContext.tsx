import React from "react";

type AgendaUIContextType = {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  day: Date | null;
  setDay: React.Dispatch<Date | null>;
};

const AgendaUIContext = React.createContext<AgendaUIContextType | null>(null);

export const AgendaUIProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const [day, setDay] = React.useState<Date | null>(null);

  return (
    <AgendaUIContext.Provider
      value={{
        isModalOpen,
        setIsModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        day,
        setDay,
      }}
    >
      {children}
    </AgendaUIContext.Provider>
  );
};

export const useAgendaUIContext = () => {
  const context = React.useContext(AgendaUIContext);
  if (!context) {
    throw new Error(
      "useAgendaUIContext must be used within an AgendaUIProvider"
    );
  }
  return context;
};
