import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

function useInitialKms() {
  const autoId = useWatch({ name: "autoId" });
  const { setValue } = useFormContext();
  const { authFetch } = useFetch();
  const initialAutoId = useRef(autoId);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const fetchAuto = async () => {
      if (autoId) {
        if (initialAutoId.current === autoId) {
          isFirstRun.current = false;
          return;
        }
        if (isFirstRun.current) {
          return;
        }

        const response = await authFetch(`/api/autos/${autoId}`);
        const data = await response.json();
        setValue("kilometros", data.kms);
      } else {
        setValue("kilometros", null);
      }
    };

    fetchAuto();
  }, [autoId]);
}

export default useInitialKms;
