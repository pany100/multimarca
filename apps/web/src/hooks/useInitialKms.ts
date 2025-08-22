import { useFetch } from "@/contexts/FetchContext";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";

function useInitialKms() {
  const autoId = useWatch({ name: "autoId" });
  const { setValue } = useFormContext();
  const { authFetch } = useFetch();
  const initialAutoId = useRef(autoId);

  useEffect(() => {
    if (!autoId) {
      setValue("kilometros", null);
      return;
    }
    const fetchAuto = async () => {
      if (autoId !== initialAutoId.current) {
        const response = await authFetch(`/api/autos/${autoId}`);
        const data = await response.json();
        setValue("kilometros", data.kms);
      }
    };

    fetchAuto();
  }, [autoId]);
}

export default useInitialKms;
