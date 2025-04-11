import { useFetch } from "@/contexts/FetchContext";
import { useState } from "react";

interface UseGeneratePdfOptions {
  onError?: (message: string) => void;
  printDirectly?: boolean;
}

interface UseGeneratePdfReturn {
  generatePdf: (endpoint: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for generating and opening PDFs from API endpoints
 * @param options Configuration options
 * @param options.onError Callback for error handling
 * @param options.printDirectly If true, will directly open the print dialog instead of opening in a new tab
 */
export const useGeneratePdf = (
  options?: UseGeneratePdfOptions
): UseGeneratePdfReturn => {
  const { authFetch } = useFetch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = async (endpoint: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authFetch(endpoint, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`Error al generar el PDF (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      if (options?.printDirectly) {
        // Create an iframe to print the PDF directly
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";

        // Set the source to the PDF URL
        printFrame.src = url;

        // Wait for the iframe to load before printing
        printFrame.onload = () => {
          try {
            // Print the iframe content
            printFrame.contentWindow?.focus(); // Focus the window before printing
            printFrame.contentWindow?.print();

            // Don't remove the iframe immediately to keep the print dialog open
            // Only clean up URL object to prevent memory leaks
            URL.revokeObjectURL(url);
          } catch (err) {
            console.error("Error printing:", err);
            // Fallback to opening in a new tab if printing fails
            window.open(url, "_blank");
            // Clean up the iframe in case of error
            document.body.removeChild(printFrame);
          }
        };

        document.body.appendChild(printFrame);
      } else {
        // Just open in a new tab
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);

      if (options?.onError) {
        options.onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generatePdf,
    isLoading,
    error,
  };
};
