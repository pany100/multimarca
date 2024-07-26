"use client";

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import utilsAuthFetch from "../utils/authFetch";

interface FetchContextType {
  isLoading: boolean;
  fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  authFetch: (
    url: string,
    options: RequestInit,
    req?: any,
    res?: any
  ) => Promise<Response>;
}

const FetchContext = createContext<FetchContextType | undefined>(undefined);

export const FetchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const interceptedFetch = useCallback(
    async (input: RequestInfo, init?: RequestInit) => {
      setIsLoading(true);
      try {
        const response = await fetch(input, init);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}, req?: any, res?: any) => {
      setIsLoading(true);
      try {
        const response = await utilsAuthFetch(url, options, req, res);
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <FetchContext.Provider
      value={{ isLoading, fetch: interceptedFetch, authFetch }}
    >
      {children}
    </FetchContext.Provider>
  );
};

export const useFetch = () => {
  const context = useContext(FetchContext);
  if (context === undefined) {
    throw new Error("useFetch debe ser usado dentro de un FetchProvider");
  }
  return context;
};
