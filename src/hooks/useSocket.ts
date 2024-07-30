import { useEffect, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SOCKET_URL!,
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
      }
    );
    console.log(socketInstance);
    socketInstance.on("connect", () => {
      console.log("Conectado al socket");
    });

    socketInstance.on("connect_error", (err) => {
      console.log("Error al conectar al socket", JSON.stringify(err));
    });

    socketInstance.on("disconnect", () => {
      console.log("Desconectado del socket");
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
