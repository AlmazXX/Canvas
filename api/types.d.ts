import { WebSocket } from "ws";

export interface ActiveConnections {
  [id: string]: WebSocket;
}