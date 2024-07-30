import { Server as NetServer } from "http";
import { Socket, Server as SocketNetServer } from "net";
import { NextApiRequest, NextApiResponse } from "next";
import { Server as ServerIO, Server as SocketIOServer } from "socket.io";

type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: SocketNetServer & {
      io: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: true,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path,
      addTrailingSlash: false,
    });
    res.socket.server.io = io;
  }
  res.end();
};

export default ioHandler;
