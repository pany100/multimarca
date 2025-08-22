import { useFetch } from "@/contexts/FetchContext";

function useRecibo() {
  const { authFetch } = useFetch();

  const generateRecibo = async (ingreso: { id: string }) => {
    const response = await authFetch(
      `/api/ingresos-reparacion/${ingreso.id}/generar-recibo`
    );
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  };

  const generateReciboVentas = async (ingreso: { id: string }) => {
    const response = await authFetch(
      `/api/ingresos-ventas/${ingreso.id}/generar-recibo`
    );
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  };

  const sendRecibo = async (ingreso: { id: string }) => {
    if (!ingreso.id) return;
    console.log(ingreso);
    const response = await authFetch(
      `/api/ingresos-reparacion/${ingreso.id}/enviar-recibo`,
      {
        method: "POST",
      }
    );
    if (response.ok) {
      return true;
    } else {
      throw new Error("Error al enviar el recibo");
    }
  };

  const sendReciboVentas = async (ingreso: { id: string }) => {
    if (!ingreso.id) return;
    console.log(ingreso);
    const response = await authFetch(
      `/api/ingresos-ventas/${ingreso.id}/enviar-recibo`,
      {
        method: "POST",
      }
    );
    if (response.ok) {
      return true;
    } else {
      throw new Error("Error al enviar el recibo");
    }
  };

  return {
    generateRecibo,
    generateReciboVentas,
    sendRecibo,
    sendReciboVentas,
  };
}
export default useRecibo;
