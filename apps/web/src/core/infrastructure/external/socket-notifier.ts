// infrastructure/external/socket-notifier.ts
import type { NotifierPort } from "@/core/domain/ports/notifier.port";
import { getIO } from "@/lib/socketio";

export class SocketNotifier implements NotifierPort {
  emit(event: string, payload?: any) {
    const io = getIO();
    if (io) io.emit(event, payload);
  }
}
